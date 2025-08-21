# 🛠️ Development Environment Setup Guide

This guide helps you set up a complete development environment for CashLite, a Progressive Web App (PWA) built with React, TypeScript, and Vite.

## Prerequisites

### Required Software

#### 1. Node.js and npm
- **Node.js 18+** (Latest LTS recommended)
- **npm 8+** or **yarn 1.22+**

**Installation:**
- **Windows/macOS**: Download from [nodejs.org](https://nodejs.org/)
- **Linux (Ubuntu/Debian)**: 
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **macOS (Homebrew)**: 
  ```bash
  brew install node
  ```

**Verify Installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

#### 2. Git
- **Version Control**: Git 2.30+

**Installation:**
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **macOS**: `brew install git` or use Xcode Command Line Tools
- **Linux**: `sudo apt-get install git`

### Recommended IDE

#### Visual Studio Code
Download from [code.visualstudio.com](https://code.visualstudio.com/)

**Essential Extensions (automatically recommended when you open the project):**
- **ES7+ React/Redux/React-Native snippets** - React code snippets
- **Prettier - Code formatter** - Code formatting
- **ESLint** - JavaScript/TypeScript linting
- **Tailwind CSS IntelliSense** - Tailwind CSS class suggestions
- **TypeScript Hero** - TypeScript utilities
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
- **Path Intellisense** - Autocomplete for file paths
- **Todo Tree** - Highlight TODO comments
- **Live Server** - Launch development server

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SayefReyadh/CashLite.git
cd CashLite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Commands

### Core Commands
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Quality Commands
```bash
# Type checking
npm run type-check

# Linting (check)
npm run lint

# Linting (fix)
npm run lint:fix

# Code formatting
npm run format
```

### PWA Development Commands
```bash
# Build and test PWA features
npm run build && npm run preview

# For testing offline functionality:
# 1. Run npm run build && npm run preview
# 2. Open browser dev tools > Application > Service Workers
# 3. Check "Offline" to simulate offline mode
```

## IDE Configuration

### VS Code Setup
The project includes pre-configured VS Code settings in `.vscode/`:

- **settings.json** - Workspace settings with Prettier, ESLint, and TypeScript configuration
- **extensions.json** - Recommended extensions list
- **launch.json** - Debug configurations for Chrome and Edge

### Key VS Code Features Enabled:
- **Format on Save** - Automatically formats code using Prettier
- **Auto-fix ESLint** - Fixes linting issues on save
- **TypeScript IntelliSense** - Enhanced TypeScript support
- **Tailwind CSS Suggestions** - Auto-completion for Tailwind classes
- **Debugging Support** - Debug configurations for browsers

## Mobile Development Testing

Since CashLite is a PWA, you don't need Android Studio or Xcode for mobile development. Instead:

### Testing on Mobile Devices

#### 1. Local Network Testing
```bash
# Start dev server (shows network URLs)
npm run dev

# Access from mobile device using the network IP shown
# Example: http://192.168.1.100:5173
```

#### 2. PWA Installation Testing
```bash
# Build and serve
npm run build && npm run preview

# Open in mobile browser and test "Add to Home Screen"
```

#### 3. Browser Developer Tools
- **Chrome DevTools**: Device simulation
- **Firefox Responsive Design Mode**: Mobile testing
- **Safari Web Inspector**: iOS testing (macOS only)

### Mobile Testing Checklist
- [ ] Responsive design on various screen sizes
- [ ] Touch interactions and gestures
- [ ] PWA installation prompt
- [ ] Offline functionality
- [ ] Performance on mobile networks

## Browser Compatibility

### Supported Browsers
- **Chrome 90+** (Primary target)
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

### Testing Browsers
```bash
# Install different browsers for testing
# Chrome: Default development browser
# Firefox: Secondary testing
# Safari: macOS/iOS testing (Mac only)
```

## Environment Variables

Create a `.env.local` file for local environment variables:

```bash
# .env.local (not tracked by git)
VITE_APP_NAME=CashLite
VITE_APP_VERSION=1.0.0
```

## Troubleshooting

### Common Issues

#### 1. Node.js Version Issues
```bash
# Check version
node --version

# Update Node.js if version < 18
# Use nvm (Node Version Manager) for version management
```

#### 2. npm Install Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

#### 4. TypeScript Errors
```bash
# Run type checking
npm run type-check

# Check tsconfig.json configuration
```

#### 5. ESLint Issues
```bash
# Fix auto-fixable issues
npm run lint:fix

# Check .eslintrc.cjs configuration
```

## Development Workflow

### 1. Daily Development
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Start development
npm run dev
```

### 2. Before Committing
```bash
# Type check
npm run type-check

# Lint and fix
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test

# Build to ensure no build errors
npm run build
```

### 3. Creating a Production Build
```bash
# Clean build
rm -rf dist

# Build
npm run build

# Test production build
npm run preview
```

## Performance Tips

### Development Performance
- Use **TypeScript strict mode** for better IntelliSense
- Enable **ESLint auto-fix** for consistent code quality
- Use **Prettier** for consistent formatting
- Leverage **Vite's HMR** for fast development

### Build Performance
- **Code splitting** is pre-configured in `vite.config.ts`
- **Tree shaking** removes unused code automatically
- **Bundle analysis**: Use `npm run build` and check output sizes

## Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

### Tools
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit tool
- [Can I Use](https://caniuse.com/) - Browser compatibility checking

---

## Quick Start Summary

For experienced developers, here's the TL;DR:

```bash
# Prerequisites: Node.js 18+, VS Code with recommended extensions
git clone https://github.com/SayefReyadh/CashLite.git
cd CashLite
npm install
npm run dev
# Open http://localhost:5173
```

**Happy coding! 🚀**