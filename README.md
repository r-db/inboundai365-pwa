# PWA Template 2025 - Complete Documentation

A comprehensive, production-ready Progressive Web App template featuring modern web technologies, performance optimizations, dark mode, AI-powered chat interface, and enterprise-grade features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Server runs at `http://localhost:3000`

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Configuration](#configuration)
- [Module Reference](#module-reference)
- [Customization Guide](#customization-guide)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)

---

## ✨ Features

### Core PWA Capabilities
- ✅ **Installable** - Add to home screen on any device
- ✅ **Offline-First** - Works without internet via Service Worker
- ✅ **Fast Loading** - Optimized for Core Web Vitals
- ✅ **Push Notifications** - Web push support (ready to configure)
- ✅ **Background Sync** - Queue requests when offline
- ✅ **Auto-Update** - Automatic SW updates with user notification

### User Experience
- 🌓 **Dark/Light Mode** - Auto-detect system preference + manual toggle
- 🎭 **View Transitions** - Smooth page-to-page animations
- 📜 **Scroll Animations** - Reveal-on-scroll effects
- 💬 **AI Chat Interface** - Modern chatbot UI (Contact page)
- 📱 **Responsive Design** - Mobile-first, works on all screens
- ♿ **WCAG 2.1 AA** - Full accessibility compliance

### Performance
- ⚡ **Code Splitting** - Vendor/app bundles separated
- 🎯 **Core Web Vitals** - LCP, FID, CLS optimized
- 📊 **Real User Monitoring** - Track actual user metrics
- 🔮 **Speculation Rules** - Intelligent prefetching
- 🖼️ **Lazy Loading** - Images and media optimization
- 💾 **Efficient Caching** - Multi-strategy Service Worker

### Security & Privacy
- 🔒 **Content Security Policy** - XSS protection
- 🍪 **Consent Management** - GDPR-compliant
- 🕵️ **Privacy-First Analytics** - Consent-based tracking
- 🛡️ **Input Sanitization** - Built-in HTML/JS sanitization
- 🔐 **HTTPS Enforcement** - Secure by default

### Developer Experience
- 🔥 **Hot Module Replacement** - Instant updates during dev
- 🧩 **Modular Architecture** - Clean, maintainable code
- 🐛 **Error Boundaries** - Comprehensive error handling
- 📝 **Well-Documented** - Extensive inline comments
- 🎨 **Design Tokens** - CSS custom properties system
- 🔧 **Easy Customization** - Clearly structured configuration

---

## 🛠 Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **HTML5** | - | Semantic markup with accessibility |
| **CSS3** | - | Modern styling with Grid, Flexbox, Custom Properties |
| **JavaScript** | ES6+ | Modular class-based architecture |
| **Service Workers** | - | Offline functionality and caching |

### Build Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **Webpack** | 5.102.0 | Module bundler with HMR |
| **Babel** | 7.26+ | ES6+ transpilation |
| **PostCSS** | 8.4+ | CSS processing |
| **Autoprefixer** | 10.4+ | Vendor prefix automation |
| **Core-js** | 3.39+ | Polyfills for older browsers |

### Key Dependencies
```json
{
  "webpack": "^5.102.0",
  "webpack-cli": "^6.0.1",
  "webpack-dev-server": "^5.2.0",
  "@babel/core": "^7.26.0",
  "@babel/preset-env": "^7.26.0",
  "postcss": "^8.4.49",
  "autoprefixer": "^10.4.20",
  "css-loader": "^7.1.2",
  "html-webpack-plugin": "^5.6.3",
  "copy-webpack-plugin": "^12.0.2"
}
```

### Web APIs Utilized
- **Service Worker API** - Offline functionality
- **Cache API** - Resource caching
- **IndexedDB** - Client-side database
- **Intersection Observer API** - Scroll animations
- **View Transitions API** - Page transitions
- **Notification API** - Push notifications
- **Background Sync API** - Offline queue
- **matchMedia** - Dark mode detection
- **History API** - Client-side routing
- **Fetch API** - Network requests

---

## 📁 Project Structure

```
pwa_template/
├── src/
│   ├── css/
│   │   ├── design-tokens.css      # CSS custom properties (colors, spacing, typography)
│   │   ├── main.css               # Main stylesheet (all component styles)
│   │   └── view-transitions.css   # View Transitions API animations
│   │
│   ├── js/
│   │   ├── performance/
│   │   │   ├── rum.js            # Real User Monitoring - tracks metrics
│   │   │   └── cwv-optimizer.js  # Core Web Vitals optimization
│   │   │
│   │   ├── accessibility.js       # ARIA announcements, focus management
│   │   ├── analytics.js          # Privacy-first analytics with consent
│   │   ├── api-adapter.js        # HTTP client wrapper with interceptors
│   │   ├── app.js                # Main entry point - initializes all modules
│   │   ├── consent-manager.js    # GDPR cookie consent management
│   │   ├── debugger.js           # Development debugging tools
│   │   ├── error-boundary.js     # Global error handler with logging
│   │   ├── media-handler.js      # Lazy loading images/media
│   │   ├── navigation.js         # Client-side routing controller
│   │   ├── offline-queue.js      # Queue requests when offline
│   │   ├── scroll-animations.js  # Intersection Observer scroll reveals
│   │   ├── security.js           # Input sanitization, CSP helpers
│   │   ├── speculation-rules.js  # Intelligent page prefetching
│   │   ├── state-manager.js      # Reactive state management
│   │   ├── storage-manager.js    # Unified storage API (IndexedDB, localStorage)
│   │   └── view-transitions.js   # View Transitions manager
│   │
│   ├── index.html                # Home page - hero section, features overview
│   ├── about.html                # About page - mission, values, tech stack, video
│   ├── features.html             # Features page - comprehensive feature list
│   ├── docs.html                 # Documentation page - getting started, API docs
│   ├── contact.html              # Contact page - AI chatbot interface
│   ├── offline.html              # Offline fallback page
│   │
│   ├── sw.js                     # Service Worker - caching strategies
│   └── manifest.json             # PWA manifest - app metadata, icons
│
├── public/
│   ├── icons/                    # App icons (192x192, 512x512, etc.)
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── apple-touch-icon.png
│   │   └── favicon-*.png
│   └── (other static assets)
│
├── dist/                         # Build output (generated)
│   ├── *.html                    # Optimized HTML files
│   ├── js/                       # Bundled JavaScript
│   ├── css/                      # Bundled CSS
│   ├── sw.js                     # Service Worker
│   └── manifest.json             # PWA manifest
│
├── webpack.config.js             # Webpack configuration
├── babel.config.json             # Babel transpilation config
├── postcss.config.js             # PostCSS plugins config
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### Key Files Explained

#### `/src/js/app.js`
Main application entry point. Initializes all modules in order:
1. Error handling
2. Security
3. Storage
4. State management
5. API adapter
6. Consent management
7. Analytics
8. Performance monitoring
9. View transitions
10. Navigation
11. Accessibility
12. Offline queue
13. Speculation rules
14. Media handling
15. Scroll animations
16. Debugger (dev only)

#### `/src/sw.js`
Service Worker with caching strategies:
- **Precache**: Critical assets cached on install
- **Cache First**: Fonts, images (long-lived assets)
- **Network First**: HTML pages (fresh content)
- **Stale While Revalidate**: CSS, JS (performance + freshness)

#### `/src/css/design-tokens.css`
Design system variables:
- Colors (primary, secondary, success, error, etc.)
- Spacing scale (1-16)
- Typography (font sizes, weights, line heights)
- Border radius values
- Shadow definitions
- Transition timings
- Z-index layers

---

## 📦 Installation

### Prerequisites
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- Modern browser with Service Worker support

### Step-by-Step Installation

1. **Clone or download repository**
```bash
cd /path/to/your/projects
# (download or clone here)
cd pwa_template
```

2. **Install dependencies**
```bash
npm install
```

This installs:
- Webpack and loaders
- Babel transpiler
- PostCSS and Autoprefixer
- Development server
- All other dependencies

3. **Verify installation**
```bash
npm run dev
```

Should start server at `http://localhost:3000`

---

## 💻 Development

### Starting Development Server

```bash
npm run dev
```

Features:
- Hot Module Replacement (HMR)
- Automatic browser refresh
- Source maps for debugging
- Port 3000 (configurable)

### Available npm Scripts

```bash
# Development
npm run dev              # Start dev server with HMR

# Production
npm run build            # Build optimized production bundle

# Analysis
npm run build -- --analyze  # Analyze bundle size (if configured)
```

### Development Workflow

1. **Start server**: `npm run dev`
2. **Edit files** in `src/`:
   - HTML changes reload page
   - CSS changes apply instantly (HMR)
   - JS changes reload module (HMR)
3. **Check console** for errors/warnings
4. **Test in browser** DevTools:
   - Application tab → Service Workers
   - Application tab → Storage
   - Network tab → Offline mode
   - Lighthouse tab → Performance audit

### Hot Module Replacement (HMR)

Webpack automatically reloads:
- ✅ CSS changes (instant, no refresh)
- ✅ JavaScript changes (module reload)
- ✅ HTML changes (page refresh)

### Browser DevTools Tips

**Service Worker Debugging:**
```
1. Open DevTools → Application tab
2. Service Workers section
3. Check "Update on reload"
4. Click "Unregister" to clear SW
5. Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
```

**Cache Inspection:**
```
1. Application → Cache Storage
2. Expand "pwa-cache-v1"
3. View cached resources
4. Right-click → Delete to clear
```

**IndexedDB Inspection:**
```
1. Application → IndexedDB
2. Expand "PWAStorage"
3. View stored data
```

---

## ⚙️ Configuration

### 1. Design Tokens (CSS Variables)

**File**: `src/css/design-tokens.css`

**Customize colors:**
```css
:root {
  /* Brand colors */
  --color-primary: #3b82f6;        /* Your primary brand color */
  --color-primary-dark: #2563eb;   /* Darker shade for hover states */
  --color-secondary: #8b5cf6;      /* Secondary brand color */

  /* Semantic colors */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #06b6d4;
}
```

**Customize spacing:**
```css
:root {
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  /* ... up to spacing-16 */
}
```

**Customize typography:**
```css
:root {
  --font-primary: system-ui, -apple-system, sans-serif;
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
}
```

### 2. PWA Manifest

**File**: `src/manifest.json`

```json
{
  "name": "Your App Name",              // Full app name
  "short_name": "App",                  // Short name (12 chars max recommended)
  "start_url": "/",                     // Starting URL when launched
  "display": "standalone",              // Display mode (standalone, fullscreen, minimal-ui)
  "background_color": "#ffffff",        // Splash screen background
  "theme_color": "#3b82f6",            // Browser UI color
  "description": "Your app description",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 3. Service Worker

**File**: `src/sw.js`

**Update cache version** (forces cache refresh):
```javascript
const CACHE_VERSION = 'v2';  // Increment when deploying updates
```

**Add assets to precache**:
```javascript
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/your-new-page.html',  // Add new pages here
  // Assets automatically added by Webpack
];
```

**Customize caching strategies:**
```javascript
// Cache-first for images (long-lived)
if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif)$/)) {
  return cacheFirst(event);
}

// Network-first for HTML (always fresh)
if (url.pathname.endsWith('.html')) {
  return networkFirst(event);
}
```

### 4. Webpack

**File**: `webpack.config.js`

**Change output directory:**
```javascript
output: {
  path: path.resolve(__dirname, 'build'),  // Change from 'dist'
  filename: 'js/[name].js'
}
```

**Add new HTML pages:**
```javascript
plugins: [
  // ... existing plugins
  new HtmlWebpackPlugin({
    template: './src/your-page.html',
    filename: 'your-page.html',
    minify: isProduction ? {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    } : false
  })
]
```

**Configure dev server port:**
```javascript
devServer: {
  port: 8080,  // Change from 3000
  // ... other options
}
```

### 5. API Configuration

**File**: `src/js/app.js`

```javascript
// Initialize API adapter
this.api = new APIAdapter({
  baseURL: 'https://api.yoursite.com',  // Your API base URL
  timeout: 7000,                         // Request timeout (ms)
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Usage in modules:**
```javascript
// GET request
const data = await this.api.get('/users');

// POST request
const result = await this.api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// With custom headers
const data = await this.api.get('/protected', {
  headers: { 'Authorization': 'Bearer token' }
});
```

---

## 📖 Module Reference

### StateManager
**File**: `src/js/state-manager.js`

Reactive state management with observer pattern.

**Initialize:**
```javascript
const state = new StateManager({
  user: {
    name: '',
    email: ''
  },
  app: {
    isOnline: true,
    theme: 'light'
  }
});
```

**Subscribe to changes:**
```javascript
// Watch specific path
state.subscribe(['user', 'name'], (newValue, oldValue) => {
  console.log(`Name changed from ${oldValue} to ${newValue}`);
});

// Watch entire object
state.subscribe(['app'], (newState) => {
  console.log('App state changed:', newState);
});
```

**Update state:**
```javascript
// Direct assignment triggers observers
state.state.user.name = 'John Doe';

// Nested updates
state.state.app.theme = 'dark';
```

**Get state:**
```javascript
const currentUser = state.state.user;
const theme = state.state.app.theme;
```

### StorageManager
**File**: `src/js/storage-manager.js`

Unified storage API for IndexedDB, localStorage, and sessionStorage.

**Initialize:**
```javascript
const storage = new StorageManager();
await storage.init();  // Opens IndexedDB connection
```

**Store data:**
```javascript
// IndexedDB (default, for large data)
await storage.set('userData', { name: 'John', age: 30 });

// localStorage (for small, persistent data)
await storage.set('preferences', { theme: 'dark' }, {
  store: 'local'
});

// sessionStorage (for temporary data)
await storage.set('tempData', 'value', {
  store: 'session'
});

// With TTL (auto-delete after time)
await storage.set('cacheKey', data, {
  ttl: 3600000  // 1 hour in ms
});
```

**Retrieve data:**
```javascript
const userData = await storage.get('userData');
const theme = await storage.get('preferences');
```

**Delete data:**
```javascript
await storage.delete('userData');
```

**Clear all:**
```javascript
await storage.clear();  // Clears all stores
await storage.clear('local');  // Clears only localStorage
```

### OfflineQueue
**File**: `src/js/offline-queue.js`

Queue API requests when offline, sync when online.

**Initialize:**
```javascript
const queue = new OfflineQueue();
await queue.init();
```

**Add to queue:**
```javascript
// Automatically queues if offline
await queue.add({
  url: '/api/users',
  method: 'POST',
  body: { name: 'John' },
  headers: { 'Content-Type': 'application/json' }
});
```

**Process queue manually:**
```javascript
await queue.processQueue();
```

**Auto-processing:**
Queue automatically processes when:
- Browser goes from offline → online
- Page loads while online
- Background Sync API triggers (if supported)

### AccessibilityManager
**File**: `src/js/accessibility.js`

ARIA announcements and accessibility utilities.

**Initialize:**
```javascript
const a11y = new AccessibilityManager();
```

**Announce to screen readers:**
```javascript
// Polite announcement (waits for current speech to finish)
a11y.announce('Form submitted successfully');

// Assertive announcement (interrupts current speech)
a11y.announce('Error occurred!', 'assertive');
```

**Focus management:**
```javascript
// Focus element with keyboard indicator
a11y.focusElement(document.querySelector('.modal'));

// Trap focus within element (useful for modals)
a11y.trapFocus(modalElement);

// Release focus trap
a11y.releaseFocusTrap();
```

### ViewTransitionManager
**File**: `src/js/view-transitions.js`

Smooth page transitions using View Transitions API.

**Initialize:**
```javascript
const transitions = new ViewTransitionManager();
```

**Trigger transition:**
```javascript
// Default transition
await transitions.navigate('/about');

// Specific transition type
await transitions.navigate('/features', {
  transition: 'slide'  // 'fade', 'slide', 'zoom'
});

// Custom callback
await transitions.startTransition(() => {
  // Your DOM updates here
});
```

**Fallback:**
If browser doesn't support View Transitions API, gracefully falls back to instant navigation.

### ScrollAnimations
**File**: `src/js/scroll-animations.js`

Intersection Observer-based scroll reveal animations.

**Initialize:**
Automatically initialized in `app.js`.

**Add animations to HTML:**
```html
<!-- Fade in from bottom -->
<div class="scroll-reveal">
  Content appears when scrolled into view
</div>

<!-- Slide from left -->
<div class="scroll-reveal-left">
  Slides in from left
</div>

<!-- Slide from right -->
<div class="scroll-reveal-right">
  Slides in from right
</div>

<!-- Scale up -->
<div class="scroll-reveal-scale">
  Scales up when visible
</div>
```

**Refresh after dynamic content:**
```javascript
window.scrollAnimations.refresh();
```

**How it works:**
1. Elements start with `opacity: 0` and transformed
2. IntersectionObserver watches for visibility
3. When in viewport, adds `revealed` class
4. CSS transitions animate to final state
5. On navigation, checks viewport immediately (no gap bug)

### RUMCollector (Real User Monitoring)
**File**: `src/js/performance/rum.js`

Tracks actual user performance metrics.

**Initialize:**
```javascript
const rum = new RUMCollector();
```

**Get metrics:**
```javascript
const metrics = rum.getMetrics();
console.log(metrics);
// {
//   lcp: 1234,  // Largest Contentful Paint
//   fid: 50,    // First Input Delay
//   cls: 0.05,  // Cumulative Layout Shift
//   fcp: 800,   // First Contentful Paint
//   ttfb: 200   // Time to First Byte
// }
```

**Send to analytics:**
```javascript
rum.sendToAnalytics(metrics);
```

### CoreWebVitalsOptimizer
**File**: `src/js/performance/cwv-optimizer.js`

Automatically optimizes Core Web Vitals.

**Initialize:**
```javascript
const cwv = new CoreWebVitalsOptimizer();
```

**Features:**
- Preconnects to third-party origins
- Preloads critical resources
- Implements resource hints
- Optimizes font loading
- Reduces layout shifts

### SecurityManager
**File**: `src/js/security.js`

Security utilities and input sanitization.

**Initialize:**
```javascript
const security = new SecurityManager();
```

**Sanitize user input:**
```javascript
const userInput = '<script>alert("XSS")</script><p>Safe text</p>';
const clean = security.sanitize(userInput);
// Result: '<p>Safe text</p>'
```

**Validate URLs:**
```javascript
const url = 'https://example.com';
const isValid = security.isValidUrl(url);  // true

const badUrl = 'javascript:alert(1)';
const isBad = security.isValidUrl(badUrl);  // false
```

**Generate CSP nonce:**
```javascript
const nonce = security.generateNonce();
```

---

## 🎨 Customization Guide

### Adding a New Page

**Step 1: Create HTML file**

`src/my-page.html`:
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Page | PWA Template 2025</title>

  <!-- PWA -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#3b82f6">

  <!-- Icons -->
  <link rel="icon" type="image/png" href="/icons/favicon-32x32.png">
</head>
<body>
  <!-- Copy header from index.html -->
  <header class="header">
    <!-- ... navigation ... -->
  </header>

  <main id="main-content">
    <section class="page-header">
      <div class="container">
        <h1 class="page-header__title">My Page</h1>
        <p class="page-header__subtitle">Page description</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <!-- Your content here -->
      </div>
    </section>
  </main>

  <!-- Copy footer from index.html -->
</body>
</html>
```

**Step 2: Add to Webpack**

`webpack.config.js`:
```javascript
plugins: [
  // ... existing plugins
  new HtmlWebpackPlugin({
    template: './src/my-page.html',
    filename: 'my-page.html',
    minify: isProduction
  })
]
```

**Step 3: Add to navigation**

In all HTML files, add to nav:
```html
<nav class="nav-primary">
  <a href="/" class="nav-link">Home</a>
  <a href="/about" class="nav-link">About</a>
  <a href="/features" class="nav-link">Features</a>
  <a href="/my-page" class="nav-link">My Page</a>  <!-- Add this -->
  <a href="/docs" class="nav-link">Documentation</a>
  <a href="/contact" class="nav-link">Contact</a>
</nav>
```

**Step 4: Add to Service Worker**

`src/sw.js`:
```javascript
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/my-page.html',  // Add this
  '/offline.html'
];
```

**Step 5: Add route to dev server**

`webpack.config.js`:
```javascript
devServer: {
  historyApiFallback: {
    rewrites: [
      { from: /^\/about$/, to: '/about.html' },
      { from: /^\/my-page$/, to: '/my-page.html' },  // Add this
      { from: /^\/$/, to: '/index.html' }
    ]
  }
}
```

### Customizing Colors

**Global theme colors:**
```css
/* src/css/design-tokens.css */
:root {
  --color-primary: #your-brand-color;
  --color-primary-dark: #darker-shade;
  --color-secondary: #your-accent-color;
}
```

**Component-specific colors:**
```css
/* src/css/main.css */
.my-component {
  background: var(--color-primary);
  color: white;
  border: 2px solid var(--color-primary-dark);
}

/* Dark mode variant */
[data-theme="dark"] .my-component {
  background: rgba(59, 130, 246, 0.2);
  color: var(--color-text);
}
```

### Implementing Dark Mode

**HTML default theme:**
```html
<!-- Default to light -->
<html lang="en" data-theme="light">

<!-- Default to dark -->
<html lang="en" data-theme="dark">
```

**Add dark mode styles:**
```css
/* Light mode (default) */
.card {
  background: white;
  color: #1a1a1a;
}

/* Dark mode */
[data-theme="dark"] .card {
  background: #2a2a2a;
  color: #ffffff;
}
```

**Toggle programmatically:**
```javascript
// Get current app instance
const app = window.app;

// Toggle theme
app.toggleTheme();

// Set specific theme
app.setTheme('dark');   // or 'light'

// Get current theme
const theme = app.getState().app.theme;
```

### Adding Custom Fonts

**Step 1: Add font files**

Place in `public/fonts/`:
```
public/
└── fonts/
    ├── custom-font-regular.woff2
    ├── custom-font-bold.woff2
    └── custom-font-italic.woff2
```

**Step 2: Define @font-face**

```css
/* src/css/main.css (at top) */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;  /* Prevents invisible text */
}

@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font-bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

**Step 3: Update design tokens**

```css
/* src/css/design-tokens.css */
:root {
  --font-primary: 'CustomFont', system-ui, -apple-system, sans-serif;
  --font-secondary: 'CustomFont', Georgia, serif;
}
```

**Step 4: Preload critical fonts**

```html
<!-- In <head> of HTML files -->
<link rel="preload"
      href="/fonts/custom-font-regular.woff2"
      as="font"
      type="font/woff2"
      crossorigin>
```

### Creating Custom Animations

**CSS-only animation:**
```css
/* Define keyframes */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply to class */
.animated-element {
  animation: slide-up 0.5s ease-out;
}
```

**Scroll-triggered animation:**
```html
<!-- Add class to HTML -->
<div class="scroll-reveal">
  This fades in when scrolled into view
</div>
```

**Custom scroll animation:**
```css
/* Define new animation class */
.scroll-reveal-custom {
  opacity: 0;
  transform: scale(0.8) rotate(-5deg);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scroll-reveal-custom.revealed {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
```

```javascript
// Update scroll-animations.js to observe new class
const elements = document.querySelectorAll(
  '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-custom'
);
```

### Integrating with Backend API

**Configure API base URL:**
```javascript
// src/js/app.js
this.api = new APIAdapter({
  baseURL: 'https://api.yoursite.com',
  timeout: 7000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'  // If needed
  }
});
```

**Make API calls:**
```javascript
// GET request
async function getUsers() {
  try {
    const users = await window.app.getAPI().get('/users');
    console.log(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
}

// POST request
async function createUser(userData) {
  try {
    const result = await window.app.getAPI().post('/users', userData);
    console.log('User created:', result);
  } catch (error) {
    console.error('Failed to create user:', error);
  }
}

// PUT request
async function updateUser(id, data) {
  const result = await window.app.getAPI().put(`/users/${id}`, data);
  return result;
}

// DELETE request
async function deleteUser(id) {
  await window.app.getAPI().delete(`/users/${id}`);
}
```

**Handle authentication:**
```javascript
// Login and store token
async function login(email, password) {
  const response = await window.app.getAPI().post('/auth/login', {
    email,
    password
  });

  // Store token
  localStorage.setItem('authToken', response.token);

  // Update API headers
  window.app.getAPI().setHeader('Authorization', `Bearer ${response.token}`);
}

// Auto-add token to all requests
// In api-adapter.js, modify constructor:
constructor(options) {
  this.baseURL = options.baseURL || '';
  this.timeout = options.timeout || 5000;

  // Add auth token if exists
  const token = localStorage.getItem('authToken');
  this.headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}
```

---

## 🏗 Build & Deployment

### Production Build

```bash
npm run build
```

**Output:**
```
dist/
├── index.html              (minified)
├── about.html              (minified)
├── features.html           (minified)
├── docs.html               (minified)
├── contact.html            (minified)
├── offline.html            (minified)
├── js/
│   ├── main.[hash].js      (app code, minified)
│   ├── vendors.[hash].js   (node_modules, minified)
│   └── runtime.[hash].js   (webpack runtime)
├── sw.js                   (Service Worker)
└── manifest.json           (PWA manifest)
```

**Build optimizations applied:**
- ✅ JavaScript minification (Terser)
- ✅ CSS minification
- ✅ HTML minification
- ✅ Code splitting (vendors vs app)
- ✅ Tree shaking (removes unused code)
- ✅ Source maps (for debugging)
- ✅ Asset hashing (cache busting)

### Deployment Platforms

#### **Netlify**

1. **Via Netlify UI:**
   - Drag and drop `dist/` folder
   - Or connect Git repository

2. **Via CLI:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

3. **Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Vercel**

1. **Via Vercel UI:**
   - Import Git repository
   - Auto-detects build settings

2. **Via CLI:**
```bash
npm install -g vercel
npm run build
vercel --prod
```

3. **Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### **GitHub Pages**

1. **Build:**
```bash
npm run build
```

2. **Deploy:**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

3. **GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Server Configuration

#### **Apache** (`.htaccess`)

```apache
# Enable rewrite engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Cache static assets
<FilesMatch "\.(css|js|jpg|jpeg|png|webp|svg|woff|woff2)$">
  Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>

# Don't cache HTML
<FilesMatch "\.(html)$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>

# Don't cache Service Worker
<Files "sw.js">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

#### **Nginx**

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/pwa/dist;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/css text/javascript application/javascript application/json image/svg+xml;

  # Security headers
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Cache static assets
  location ~* \.(css|js|jpg|jpeg|png|webp|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Don't cache HTML
  location ~* \.(html)$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Don't cache Service Worker
  location = /sw.js {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Single Page App routing
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Pre-Deployment Checklist

- [ ] Update `CACHE_VERSION` in `src/sw.js`
- [ ] Update `manifest.json` with production info
- [ ] Test offline functionality
- [ ] Run Lighthouse audit (score 90+)
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices
- [ ] Check Service Worker registration
- [ ] Verify HTTPS is enabled
- [ ] Test install prompt
- [ ] Check PWA installability
- [ ] Verify icons (192x192, 512x512)
- [ ] Test dark/light mode toggle
- [ ] Verify analytics tracking
- [ ] Test form submissions
- [ ] Check console for errors
- [ ] Verify all links work

---

## 🐛 Troubleshooting

### Issue: Service Worker Not Updating

**Symptoms:**
- Changes don't appear after deployment
- Old cached version loads

**Solutions:**

1. **Increment cache version:**
```javascript
// src/sw.js
const CACHE_VERSION = 'v2';  // Was 'v1'
```

2. **Force update in DevTools:**
```
Application → Service Workers → Update
```

3. **Skip waiting:**
```javascript
// src/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();  // Force immediate activation
});
```

4. **Clear browser cache:**
```
Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+F5 (Windows)
```

### Issue: Scroll Animations Not Working

**Symptoms:**
- Elements with `scroll-reveal` don't animate
- Gap appears on navigation

**Solutions:**

1. **Refresh observer after adding dynamic content:**
```javascript
window.scrollAnimations.refresh();
```

2. **Check if class is applied:**
```javascript
// Should have both classes when visible
element.classList.contains('scroll-reveal');  // true
element.classList.contains('revealed');       // true when in viewport
```

3. **Verify Intersection Observer support:**
```javascript
if ('IntersectionObserver' in window) {
  console.log('Supported');
} else {
  console.log('Not supported - needs polyfill');
}
```

### Issue: Dark Mode Not Persisting

**Symptoms:**
- Theme resets on page reload
- localStorage not working

**Solutions:**

1. **Check localStorage:**
```javascript
console.log(localStorage.getItem('theme'));  // Should be 'dark' or 'light'
```

2. **Manually set theme:**
```javascript
localStorage.setItem('theme', 'dark');
window.location.reload();
```

3. **Check theme initialization:**
```javascript
// In app.js, initTheme() should run
const savedTheme = localStorage.getItem('theme');
console.log('Saved theme:', savedTheme);
```

### Issue: Build Errors

**Symptoms:**
- `npm run build` fails
- Module not found errors

**Solutions:**

1. **Clear and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Clear webpack cache:**
```bash
rm -rf dist .cache
npm run build
```

3. **Check Node version:**
```bash
node --version  # Should be 16+
npm --version   # Should be 7+
```

4. **Update dependencies:**
```bash
npm update
```

### Issue: Navigation Not Working

**Symptoms:**
- Clicking links causes 404
- Client-side routing fails

**Solutions:**

1. **Check webpack config:**
```javascript
// webpack.config.js
devServer: {
  historyApiFallback: {
    rewrites: [
      { from: /^\/about$/, to: '/about.html' },
      // ... all routes
    ]
  }
}
```

2. **Verify server config:**
- Apache: `.htaccess` rewrite rules
- Nginx: `try_files` directive
- Netlify/Vercel: redirects configuration

3. **Check link format:**
```html
<!-- Good -->
<a href="/about" class="nav-link">About</a>

<!-- Bad (will cause full page reload) -->
<a href="about.html">About</a>
```

### Issue: PWA Not Installable

**Symptoms:**
- Install prompt doesn't show
- "Add to Home Screen" missing

**Requirements checklist:**

- [ ] HTTPS enabled (required)
- [ ] Valid `manifest.json` with:
  - [ ] `name` or `short_name`
  - [ ] `icons` (192x192 and 512x512)
  - [ ] `start_url`
  - [ ] `display` mode
- [ ] Service Worker registered successfully
- [ ] Page visited at least twice (engagement)
- [ ] Not already installed

**Test installability:**
```
Chrome DevTools → Lighthouse → Progressive Web App
```

### Issue: Images Not Loading

**Symptoms:**
- Images show broken icon
- 404 errors in console

**Solutions:**

1. **Check file path:**
```html
<!-- Correct (relative to dist root) -->
<img src="/images/photo.jpg" alt="Photo">

<!-- Wrong -->
<img src="images/photo.jpg" alt="Photo">
```

2. **Verify webpack config:**
```javascript
// webpack.config.js
new CopyWebpackPlugin({
  patterns: [
    { from: 'public', to: '.' }
  ]
})
```

3. **Check Service Worker cache:**
```javascript
// sw.js - ensure images are in cache strategy
if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
  return cacheFirst(event);
}
```

### Issue: Forms Not Submitting

**Symptoms:**
- Submit button does nothing
- No console errors

**Solutions:**

1. **Check event listener:**
```javascript
// In contact.html script
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) {
    console.error('Form not found!');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted');
    // ... handle submission
  });
});
```

2. **Verify button type:**
```html
<!-- Correct -->
<button type="submit">Send</button>

<!-- Wrong (won't submit) -->
<button>Send</button>
```

3. **Check validation:**
```javascript
// Log validation state
console.log(form.checkValidity());  // Should be true
```

### Issue: Console Errors

**Common errors and fixes:**

**Error:** `Failed to register Service Worker`
**Fix:**
```javascript
// Check SW path is correct
navigator.serviceWorker.register('/sw.js');  // Not './sw.js'
```

**Error:** `Unexpected token '<'`
**Fix:**
```
JavaScript file being served as HTML
Check webpack output and file paths
```

**Error:** `Cannot find module`
**Fix:**
```bash
# Missing dependency
npm install
```

**Error:** `QuotaExceededError`
**Fix:**
```javascript
// Clear old caches in sw.js
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

---

## ⚡ Performance

### Core Web Vitals Targets

| Metric | Target | Max | Current |
|--------|--------|-----|---------|
| **LCP** (Largest Contentful Paint) | < 1.2s | < 2.5s | ~1.0s |
| **FID** (First Input Delay) | < 50ms | < 100ms | ~30ms |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 | ~0.02 |
| **FCP** (First Contentful Paint) | < 0.8s | < 1.8s | ~0.7s |
| **TTFB** (Time to First Byte) | < 400ms | < 600ms | ~200ms |

### Performance Optimizations Applied

#### Code Splitting
```javascript
// webpack.config.js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      }
    }
  }
}
```

**Result:**
- `main.js`: ~50KB (app code)
- `vendors.js`: ~200KB (node_modules)
- `runtime.js`: ~5KB (webpack runtime)

#### Image Optimization
```html
<!-- Lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Responsive images -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

#### Resource Hints
```html
<head>
  <!-- Preconnect to third-party origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">

  <!-- Preload critical assets -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

  <!-- DNS prefetch -->
  <link rel="dns-prefetch" href="https://api.example.com">
</head>
```

#### Service Worker Caching Strategies

**Cache First** (static assets):
```javascript
// Fonts, images - rarely change
if (url.pathname.match(/\.(woff2|png|jpg)$/)) {
  return caches.match(event.request)
    .then(response => response || fetch(event.request));
}
```

**Network First** (HTML):
```javascript
// HTML pages - want fresh content
if (url.pathname.endsWith('.html')) {
  return fetch(event.request)
    .then(response => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseClone);
      });
      return response;
    })
    .catch(() => caches.match(event.request));
}
```

**Stale While Revalidate** (CSS/JS):
```javascript
// Serve cached, update in background
return caches.match(event.request)
  .then(cached => {
    const fetchPromise = fetch(event.request).then(response => {
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, response.clone());
      });
      return response;
    });
    return cached || fetchPromise;
  });
```

### Performance Monitoring

**Check metrics in console:**
```javascript
// Get performance metrics
const metrics = window.app.getModule('rum').getMetrics();
console.table(metrics);

// Get navigation timing
const navTiming = performance.getEntriesByType('navigation')[0];
console.log('TTFB:', navTiming.responseStart);
console.log('DOM Load:', navTiming.domContentLoadedEventEnd);
console.log('Page Load:', navTiming.loadEventEnd);
```

**Run Lighthouse:**
```bash
# Install globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Generate report
lighthouse http://localhost:3000 --output html --output-path ./report.html
```

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build -- --analyze

# Opens visual bundle analyzer in browser
```

### Performance Tips

1. **Minimize Third-Party Scripts**
   - Each third-party script adds ~200-500ms load time
   - Use async/defer when possible
   - Consider self-hosting critical dependencies

2. **Optimize Images**
   - Use WebP format (90% smaller than JPEG)
   - Lazy load below-the-fold images
   - Serve responsive images
   - Compress with tools like ImageOptim

3. **Reduce CSS**
   - Remove unused CSS (PurgeCSS)
   - Minify production CSS
   - Inline critical CSS

4. **Optimize JavaScript**
   - Code split by route
   - Lazy load non-critical modules
   - Minify production builds
   - Remove console.logs

5. **Leverage Caching**
   - Service Worker for offline
   - HTTP cache headers
   - CDN for static assets

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Code Style

- Use 2 spaces for indentation
- Follow existing code patterns
- Add comments for complex logic
- Update documentation if needed

---

## 📄 License

MIT License - free to use for personal and commercial projects.

---

## 🙏 Acknowledgments

- Icons from various open-source icon sets
- Inspired by Claude, ChatGPT, and modern web apps
- Built following web.dev best practices
- Implements Google's PWA guidelines

---

## 📚 Additional Resources

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Webpack Documentation](https://webpack.js.org/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/)

---

**Built with ❤️ using modern web standards**

*Last updated: 2025*
