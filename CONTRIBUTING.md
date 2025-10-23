# Contributing to PWA Template 2025

Thank you for your interest in contributing to PWA Template 2025! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features

1. Check if the feature has been suggested
2. Create an issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests
5. Ensure all tests pass: `npm test`
6. Lint your code: `npm run lint`
7. Format your code: `npm run format`
8. Commit with clear messages
9. Push to your fork
10. Create a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/pwa-template-2025.git
cd pwa-template-2025

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Coding Standards

### JavaScript

- Use ES6+ features
- Follow ESLint configuration
- Write clear, self-documenting code
- Add JSDoc comments for complex functions
- Keep functions small and focused

### CSS

- Use CSS custom properties (variables)
- Follow BEM naming convention where applicable
- Mobile-first approach
- Ensure accessibility (color contrast, focus states)

### Git Commits

- Use clear, descriptive commit messages
- Present tense ("Add feature" not "Added feature")
- Reference issues when applicable

Examples:
```
feat: Add dark mode toggle
fix: Resolve service worker caching issue
docs: Update installation instructions
style: Format code with Prettier
refactor: Simplify state management
test: Add accessibility tests
chore: Update dependencies
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for >70% code coverage
- Test in multiple browsers

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific test
npm test -- pwa.test.js
```

## Performance

- Follow performance budget
- Test with Lighthouse
- Optimize images
- Minimize bundle size
- Consider slow networks

## Accessibility

- Follow WCAG 2.2 AA guidelines
- Test with screen readers
- Ensure keyboard navigation
- Maintain color contrast
- Add ARIA labels where needed

## Documentation

- Update README.md for new features
- Add JSDoc comments
- Update inline documentation
- Include examples

## Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, PR will be merged
4. Your contribution will be credited

## Questions?

Open an issue for questions or reach out to maintainers.

## License

By contributing, you agree your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
