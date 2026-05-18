# Contributing to Screen Recorder

Thank you for your interest in contributing to Screen Recorder! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the project
- Show empathy towards others

## Getting Started

### Prerequisites
- Python 3.8 or later
- Git
- Basic knowledge of FastAPI and SQLModel

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/screen-recorder.git
   cd screen-recorder
   ```

3. Run the setup script:
   ```bash
   ./scripts/setup.sh
   ```

4. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

5. Start the development server:
   ```bash
   python run.py
   ```

## Project Structure

```
screen-recorder/
├── app/                    # Main application package
│   ├── models/            # Database models
│   │   ├── user.py        # User model
│   │   └── video.py       # Video model
│   ├── routes/            # API endpoints
│   │   ├── auth.py        # Authentication routes
│   │   ├── videos.py      # Video management routes
│   │   └── pages.py       # HTML page routes
│   ├── services/          # Business logic
│   │   ├── auth.py        # Authentication service
│   │   └── database.py    # Database connection
│   ├── utils/             # Utility functions
│   │   └── background.py  # Background tasks
│   ├── config.py          # Configuration management
│   └── main.py            # FastAPI app initialization
├── static/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── html/             # HTML templates
├── scripts/              # Helper scripts
├── docs/                 # Documentation
├── tests/                # Test files
├── uploads/              # User uploads (gitignored)
├── run.py                # Application entry point
└── requirements.txt      # Python dependencies
```

## Development Workflow

### Creating a New Feature

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Test your changes thoroughly

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Guidelines

Use conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add video thumbnail generation
fix: resolve upload timeout issue
docs: update installation instructions
```

## Code Style

### Python Code

- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Write docstrings for modules, classes, and functions
- Keep functions small and focused
- Use meaningful variable names

Example:
```python
def create_access_token(data: dict) -> str:
    """Create a JWT access token.
    
    Args:
        data: Dictionary containing token payload
        
    Returns:
        Encoded JWT token string
    """
    # Implementation here
```

### JavaScript Code

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use meaningful variable names
- Add comments for complex logic

### HTML/CSS

- Use semantic HTML elements
- Keep CSS organized and modular
- Use consistent naming conventions
- Ensure accessibility (ARIA labels, alt text, etc.)

## Testing

### Running Tests

```bash
pytest
```

### Writing Tests

- Write tests for new features
- Test edge cases and error conditions
- Aim for meaningful test coverage
- Use descriptive test names

Example:
```python
def test_user_registration_with_valid_data():
    """Test that user registration succeeds with valid credentials."""
    # Test implementation
```

## Submitting Changes

### Pull Request Process

1. Update the README.md or documentation if needed
2. Ensure all tests pass
3. Push your changes to your fork
4. Create a Pull Request with:
   - Clear title and description
   - Reference any related issues
   - Screenshots (if UI changes)
   - List of changes made

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Branch is up to date with main

## Need Help?

- Check existing issues and pull requests
- Review the documentation in the `docs/` folder
- Open a new issue with your question

## Areas for Contribution

- **Features**: Video thumbnails, batch downloads, video editing
- **UI/UX**: Design improvements, accessibility enhancements
- **Performance**: Optimization, caching strategies
- **Testing**: Increase test coverage
- **Documentation**: Improve guides, add examples
- **Bug Fixes**: Check the issues page

Thank you for contributing! 🎉
