let mediaRecorder;
let stream;
let timerInterval;
let startTime;
let elapsedTime = 0;
let currentShareId = null;
let originalFileName = "";

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const stopBtn = document.getElementById('stop-btn');
const preview = document.getElementById('preview');
const recordingStatus = document.getElementById('recording-status');
const timerDisplay = document.getElementById('timer');
const shareSection = document.getElementById('share-section');
const shareUrlInput = document.getElementById('share-url');
const copyBtn = document.getElementById('copy-btn');
const placeholder = document.getElementById('placeholder');
const historyList = document.getElementById('history-list');
const refreshHistoryBtn = document.getElementById('refresh-history');
const userProfile = document.getElementById('user-profile');
const userNameDisplay = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const videoNameInput = document.getElementById('video-name-input');
const saveNameBtn = document.getElementById('save-name-btn');
const webcamEnabled = document.getElementById('webcam-enabled');
const compositeCanvas = document.getElementById('composite-canvas');

let lastRecordedShareId = null;
let webcamStream = null;
let animationFrameId = null;

// Auth Helpers
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

async function authFetch(url, options = {}) {
    const token = getToken();
    if (!token) {
        window.location.href = '/auth';
        return;
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        clearToken();
        window.location.href = '/auth';
        return;
    }

    return response;
}

async function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/auth';
        return;
    }

    try {
        const response = await authFetch('/me');
        if (response && response.ok) {
            const user = await response.json();
            userNameDisplay.textContent = user.username;
            userProfile.style.display = 'flex';
            fetchHistory();
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = '/auth';
    }
}

logoutBtn.addEventListener('click', () => {
    clearToken();
    window.location.href = '/auth';
});

// Timer and History
function updateTimer() {
    const now = Date.now();
    const totalSeconds = Math.floor((now - startTime + elapsedTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

async function fetchHistory() {
    try {
        const response = await authFetch('/videos');
        if (!response || !response.ok) return;

        const videos = await response.json();

        if (videos.length === 0) {
            historyList.innerHTML = '<div class="loading-state">No recordings yet. Start your first one!</div>';
            return;
        }

        historyList.innerHTML = videos.map(video => {
            const lastDotIndex = video.original_name.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 ? video.original_name.substring(0, lastDotIndex) : video.original_name;
            const extension = lastDotIndex !== -1 ? video.original_name.substring(lastDotIndex) : '';

            return `
                <div class="history-item" id="item-${video.share_id}">
                    <div class="history-thumb">
                        <video muted>
                            <source src="/uploads/${video.filename}" type="video/webm">
                        </video>
                    </div>
                    <div class="history-info">
                        <h4 class="title-container">
                            <span class="video-title">${video.original_name}</span>
                            <div class="edit-wrapper" style="display: none;">
                                <input type="text" class="edit-input" value="${baseName}">
                                <span class="extension-suffix">${extension}</span>
                            </div>
                            <div class="title-actions">
                                <button class="edit-name-btn" onclick="toggleEdit('${video.share_id}')" title="Edit Name">✎</button>
                                <button class="save-edit-btn" onclick="saveInlineEdit('${video.share_id}')" style="display: none;">Save</button>
                                <button class="cancel-edit-btn" onclick="toggleEdit('${video.share_id}', true)" style="display: none;">Cancel</button>
                            </div>
                        </h4>
                        <p>${new Date(video.created_at).toLocaleString()}</p>
                        <div class="history-actions">
                            <a href="/v/${video.share_id}" class="btn primary small">Watch</a>
                            <button class="btn secondary small" onclick="copyLink('${window.location.origin}/v/${video.share_id}', this)">Copy Link</button>
                            <button class="btn danger small" onclick="deleteVideo('${video.share_id}')">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Error fetching history:", err);
        historyList.innerHTML = '<div class="loading-state">Failed to load history.</div>';
    }
}

window.toggleEdit = (shareId, cancel = false) => {
    const item = document.getElementById(`item-${shareId}`);
    const title = item.querySelector('.video-title');
    const editWrapper = item.querySelector('.edit-wrapper');
    const input = item.querySelector('.edit-input');
    const editBtn = item.querySelector('.edit-name-btn');
    const saveBtn = item.querySelector('.save-edit-btn');
    const cancelBtn = item.querySelector('.cancel-edit-btn');

    if (cancel) {
        const lastDotIndex = title.textContent.lastIndexOf('.');
        input.value = lastDotIndex !== -1 ? title.textContent.substring(0, lastDotIndex) : title.textContent;
    }

    const isEditing = editWrapper.style.display !== 'none';

    title.style.display = isEditing ? 'inline' : 'none';
    editWrapper.style.display = isEditing ? 'none' : 'flex';
    editBtn.style.display = isEditing ? 'inline-block' : 'none';
    saveBtn.style.display = isEditing ? 'none' : 'inline-block';
    cancelBtn.style.display = isEditing ? 'none' : 'inline-block';

    if (!isEditing) input.focus();
};

window.saveInlineEdit = async (shareId) => {
    const item = document.getElementById(`item-${shareId}`);
    const input = item.querySelector('.edit-input');
    const suffix = item.querySelector('.extension-suffix');
    const newName = input.value.trim() + suffix.textContent;

    if (!input.value.trim()) return;

    await editVideo(shareId, "", newName);
};

window.editVideo = async (shareId, currentName, newNameFromInput = null) => {
    const newName = newNameFromInput || prompt("Enter a new name for this recording:", currentName);
    if (!newName || newName === currentName) return;

    try {
        const response = await authFetch(`/videos/${shareId}?original_name=${encodeURIComponent(newName)}`, {
            method: 'PATCH'
        });
        if (response && response.ok) {
            fetchHistory();
        } else {
            alert("Failed to update video name.");
        }
    } catch (err) {
        console.error("Edit error:", err);
        alert("An error occurred while editing.");
    }
};

window.deleteVideo = async (shareId) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;

    try {
        const response = await authFetch(`/videos/${shareId}`, { method: 'DELETE' });
        if (response && response.ok) {
            fetchHistory();
        } else {
            alert("Failed to delete video.");
        }
    } catch (err) {
        console.error("Delete error:", err);
        alert("An error occurred while deleting.");
    }
};

window.copyLink = (url, btn) => {
    navigator.clipboard.writeText(url);
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
};

// Recording Logic
startBtn.addEventListener('click', async () => {
    try {
        originalFileName = `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;

        // Start upload session
        const startResponse = await authFetch(`/upload/start?filename=${encodeURIComponent(originalFileName)}`, { method: 'POST' });
        if (!startResponse || !startResponse.ok) return;

        const startData = await startResponse.json();
        currentShareId = startData.share_id;

        // Request screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: true
        });

        // Request microphone audio
        let micStream;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.warn("Microphone access denied:", e);
        }

        // Request webcam if enabled
        if (webcamEnabled.checked) {
            try {
                webcamStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 320, height: 240 },
                    audio: false 
                });
            } catch (e) {
                console.warn("Webcam access denied:", e);
                alert("Webcam access denied. Recording will continue without webcam.");
            }
        }

        const tracks = [...screenStream.getTracks()];
        if (micStream) tracks.push(...micStream.getTracks());

        // If webcam is enabled, composite screen + webcam
        if (webcamStream) {
            const videoTrack = screenStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            
            compositeCanvas.width = settings.width;
            compositeCanvas.height = settings.height;
            
            const ctx = compositeCanvas.getContext('2d');
            const screenVideo = document.createElement('video');
            const webcamVideo = document.createElement('video');
            
            screenVideo.srcObject = screenStream;
            webcamVideo.srcObject = webcamStream;
            
            await screenVideo.play();
            await webcamVideo.play();
            
            // Composite function
            const drawFrame = () => {
                // Draw screen
                ctx.drawImage(screenVideo, 0, 0, compositeCanvas.width, compositeCanvas.height);
                
                // Draw webcam in bottom-right corner (20% of screen width)
                const webcamWidth = compositeCanvas.width * 0.2;
                const webcamHeight = (webcamWidth * 3) / 4; // 4:3 aspect ratio
                const padding = 20;
                const x = compositeCanvas.width - webcamWidth - padding;
                const y = compositeCanvas.height - webcamHeight - padding;
                
                // Draw webcam with border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.fillStyle = '#000';
                ctx.fillRect(x - 2, y - 2, webcamWidth + 4, webcamHeight + 4);
                ctx.drawImage(webcamVideo, x, y, webcamWidth, webcamHeight);
                ctx.strokeRect(x, y, webcamWidth, webcamHeight);
            };
            // Use setInterval instead of requestAnimationFrame to continue drawing when tab is inactive
            animationFrameId = setInterval(drawFrame, 1000 / 30); // 30 FPS
            
            // Use canvas stream for preview and recording
            const canvasStream = compositeCanvas.captureStream(30);
            const audioTracks = tracks.filter(t => t.kind === 'audio');
            audioTracks.forEach(track => canvasStream.addTrack(track));
            
            stream = canvasStream;
        } else {
            stream = new MediaStream(tracks);
        }

        preview.srcObject = stream;
        placeholder.style.display = 'none';

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp9,opus'
        });

        mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && currentShareId) {
                // Upload chunk immediately
                await authFetch(`/upload/chunk/${currentShareId}`, {
                    method: 'POST',
                    body: event.data
                });
            }
        };

        mediaRecorder.onstop = async () => {
            clearInterval(timerInterval);

            // Finalize upload
            const finalizeResponse = await authFetch(`/upload/finalize/${currentShareId}?original_name=${encodeURIComponent(originalFileName)}`, { method: 'POST' });
            if (!finalizeResponse || !finalizeResponse.ok) return;

            const finalizeData = await finalizeResponse.json();

            lastRecordedShareId = finalizeData.share_id;

            const lastDotIndex = originalFileName.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 ? originalFileName.substring(0, lastDotIndex) : originalFileName;
            const extension = lastDotIndex !== -1 ? originalFileName.substring(lastDotIndex) : '';

            videoNameInput.value = baseName;
            document.getElementById('extension-suffix-ready').textContent = extension;

            const fullUrl = window.location.origin + finalizeData.url;
            shareUrlInput.value = fullUrl;
            shareSection.classList.add('visible');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            if (webcamStream) {
                webcamStream.getTracks().forEach(track => track.stop());
                webcamStream = null;
            }
            if (animationFrameId) {
                clearInterval(animationFrameId);
                animationFrameId = null;
            }
            preview.srcObject = null;
            placeholder.style.display = 'flex';
            timerDisplay.classList.remove('visible');
            elapsedTime = 0;
            currentShareId = null;

            fetchHistory(); // Refresh history
        };

        // Start recording with 1-second chunks
        mediaRecorder.start(1000);
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);

        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        recordingStatus.style.display = 'inline-block';
        timerDisplay.classList.add('visible');
        shareSection.classList.remove('visible');

    } catch (err) {
        console.error("Error starting recording:", err);
        alert("Could not start recording.");
    }
});

pauseBtn.addEventListener('click', () => {
    mediaRecorder.pause();
    elapsedTime += Date.now() - startTime;
    clearInterval(timerInterval);
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'inline-block';
    recordingStatus.textContent = 'Paused';
    recordingStatus.classList.remove('recording');
});

resumeBtn.addEventListener('click', () => {
    mediaRecorder.resume();
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    recordingStatus.textContent = 'Recording';
    recordingStatus.classList.add('recording');
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    stopBtn.disabled = true;
    recordingStatus.style.display = 'none';
    recordingStatus.textContent = 'Recording';
});

refreshHistoryBtn.addEventListener('click', fetchHistory);

saveNameBtn.addEventListener('click', async () => {
    const baseName = videoNameInput.value.trim();
    const extension = document.getElementById('extension-suffix-ready').textContent;
    if (!baseName || !lastRecordedShareId) return;

    const newName = baseName + extension;

    saveNameBtn.disabled = true;
    saveNameBtn.textContent = 'Saving...';
    await editVideo(lastRecordedShareId, "", newName);
    saveNameBtn.disabled = false;
    saveNameBtn.textContent = 'Saved!';
    setTimeout(() => saveNameBtn.textContent = 'Rename', 2000);
});

// Initial auth check
checkAuth();

copyBtn.addEventListener('click', () => {
    shareUrlInput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Link', 2000);
});
