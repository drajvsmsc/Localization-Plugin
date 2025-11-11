# Contributing to LocalizationChecker

Thank you for your interest in contributing to LocalizationChecker! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Submitting Changes](#submitting-changes)
8. [Reporting Bugs](#reporting-bugs)
9. [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and professional
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

---

## Getting Started

### Prerequisites

- Git installed
- Node.js 14+ (optional, for development tools)
- Chrome 90+ or Firefox 89+
- Basic knowledge of JavaScript and browser extensions

### Find an Issue

1. Browse [open issues](https://github.com/localization-checker/issues)
2. Look for issues tagged `good first issue` or `help wanted`
3. Comment on the issue to claim it

### Ask Questions

Not sure where to start? Open a [discussion](https://github.com/localization-checker/discussions) or comment on an issue.

---

## Development Setup

### 1. Fork & Clone

```bash
# Fork repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/localization-checker.git
cd localization-checker

# Add upstream remote
git remote add upstream https://github.com/localization-checker/extension.git
```

### 2. Install Dependencies

```bash
# Download required libraries
cd libs
curl -o franc.min.js https://cdn.jsdelivr.net/npm/franc-min@6/dist/index.js
curl -o compromise.min.js https://cdn.jsdelivr.net/npm/compromise@14/builds/compromise.min.js
cd ..

# Optional: Install dev dependencies
npm install
```

### 3. Load Extension

**Chrome:**
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension directory

**Firefox:**
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json`

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

---

## How to Contribute

### Types of Contributions

- 🐛 **Bug fixes**: Fix reported issues
- ✨ **New features**: Implement new functionality
- 📝 **Documentation**: Improve guides and docs
- 🧪 **Testing**: Add tests or improve coverage
- 🎨 **UI/UX**: Improve design and usability
- 🌍 **Localization**: Add language support
- 🚀 **Performance**: Optimize speed and memory usage

### Contribution Workflow

1. **Find/create an issue** describing the change
2. **Fork and clone** the repository
3. **Create a branch** for your changes
4. **Make changes** following coding standards
5. **Test thoroughly** in multiple scenarios
6. **Commit with clear messages**
7. **Push to your fork**
8. **Open a pull request**

---

## Coding Standards

### JavaScript Style

```javascript
// Use ES6+ features
const analyzeText = (text) => {
  // ...
};

// Use descriptive variable names
const nonLocalizedCount = 0;
const localizedElements = [];

// Add comments for complex logic
// Calculate percentage with null check
const percentage = total > 0 ? (count / total) * 100 : 0;

// Use async/await over promises
async function loadSettings() {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings;
}
```

### File Organization

```
New features should follow existing structure:

feature/
├── feature.js       # Main logic
├── feature.html     # UI (if needed)
├── feature.css      # Styles (if needed)
└── feature.test.js  # Tests
```

### Naming Conventions

- **Files**: kebab-case (`content-script.js`)
- **Functions**: camelCase (`analyzeText()`)
- **Classes**: PascalCase (`LocalizationAnalyzer`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ELEMENTS`)
- **Variables**: camelCase (`currentResults`)

### Comments

```javascript
/**
 * Analyze text element for localization
 * @param {string} text - The text content to analyze
 * @param {HTMLElement} element - The DOM element
 * @returns {Object} Classification result
 */
function classifyText(text, element) {
  // Implementation
}
```

### Error Handling

```javascript
try {
  // Attempt operation
  const result = await dangerousOperation();
  return { success: true, data: result };
} catch (error) {
  // Log error
  console.error('Operation failed:', error);
  // Return graceful failure
  return { success: false, error: error.message };
}
```

---

## Testing Guidelines

### Manual Testing

Before submitting, test your changes:

1. **Multiple browsers**: Chrome, Edge, Firefox
2. **Different page types**: Simple, complex, single-page apps
3. **Various regions**: Test at least 3 different language pairs
4. **Edge cases**: Empty pages, pages with no text, huge pages
5. **Settings**: Test with different configurations
6. **Export**: Verify all export formats work

### Test Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Analysis completes successfully
- [ ] Results are accurate
- [ ] Export functions work
- [ ] Settings save and load correctly
- [ ] No console errors
- [ ] Performance acceptable (< 5 sec for typical pages)

### Future: Automated Tests

We plan to add:
- Unit tests (Jest)
- Integration tests
- End-to-end tests (Puppeteer)

---

## Submitting Changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for Arabic language
fix: correct proper noun detection for hyphenated names
docs: update installation guide with Firefox instructions
style: format code according to style guide
refactor: simplify export handler logic
test: add tests for language detection
chore: update dependencies
```

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure no linting errors**
4. **Update CHANGELOG.md** with your changes
5. **Fill out PR template** completely
6. **Link related issues**

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Other (describe)

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested multiple scenarios
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots of UI changes

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review within 48-72 hours
2. Address any requested changes
3. Once approved, maintainers will merge
4. Your contribution will be credited

---

## Reporting Bugs

### Before Reporting

1. Search [existing issues](https://github.com/localization-checker/issues)
2. Ensure you're using the latest version
3. Test in a clean browser profile

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
Add screenshots if applicable

**Environment**
- Browser: Chrome 120
- OS: macOS 14.0
- Extension Version: 1.0.0

**Additional Context**
Any other relevant information
```

---

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, or other information

**Would you be willing to implement this?**
Yes/No
```

### Feature Evaluation

Features are evaluated based on:
- Alignment with project goals
- User demand
- Implementation complexity
- Maintenance burden

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned on project website

Top contributors may be invited to join the core team.

---

## Questions?

- Open a [discussion](https://github.com/localization-checker/discussions)
- Email: contribute@localizationchecker.dev

---

**Thank you for contributing! 🎉**

