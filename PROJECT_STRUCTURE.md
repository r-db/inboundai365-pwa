# Project Structure

Complete overview of the PWA Template 2025 file structure and organization.

## Directory Structure

```
pwa_template/
├── config/                          # Configuration files
│   └── performance-budget.config.js # Performance budget settings
│
├── public/                          # Static public files
│   └── manifest.json               # PWA manifest
│
├── src/                            # Source files
│   ├── css/                        # Stylesheets
│   │   ├── design-tokens.css       # Design system variables
│   │   ├── main.css               # Main styles
│   │   └── view-transitions.css   # View Transitions animations
│   │
│   ├── js/                         # JavaScript modules
│   │   ├── performance/           # Performance monitoring
│   │   │   ├── cwv-optimizer.js  # Core Web Vitals optimizer
│   │   │   └── rum.js            # Real User Monitoring
│   │   │
│   │   ├── accessibility.js       # WCAG 2.2 AA compliance
│   │   ├── analytics.js          # Privacy-first analytics
│   │   ├── api-adapter.js        # HTTP client with retry logic
│   │   ├── app.js                # Main application entry point
│   │   ├── consent-manager.js    # GDPR consent management
│   │   ├── debugger.js           # Development debugger
│   │   ├── error-boundary.js     # Global error handling
│   │   ├── media-handler.js      # Media optimization
│   │   ├── navigation.js         # Navigation controller
│   │   ├── offline-queue.js      # Offline request queue
│   │   ├── security.js           # Security manager (CSP, XSS)
│   │   ├── speculation-rules.js  # Prefetching & prerendering
│   │   ├── state-manager.js      # Reactive state management
│   │   ├── storage-manager.js    # Unified storage API
│   │   └── view-transitions.js   # View Transitions API
│   │
│   ├── index.html                 # Main HTML template
│   ├── offline.html              # Offline fallback page
│   └── sw.js                     # Service Worker
│
├── scripts/                        # Build and utility scripts
│   └── analyze-bundle.js          # Bundle analysis script
│
├── tests/                          # Test files
│   ├── pwa.test.js               # Main test suite
│   └── setup.js                  # Test setup and mocks
│
├── dist/                           # Build output (generated)
│
├── node_modules/                   # Dependencies (generated)
│
├── .babelrc                        # Babel configuration
├── .env.example                    # Environment variables template
├── .eslintrc.json                 # ESLint configuration
├── .gitignore                     # Git ignore rules
├── .prettierrc.json               # Prettier configuration
├── CONTRIBUTING.md                 # Contribution guidelines
├── jest.config.js                 # Jest testing configuration
├── LICENSE                        # MIT License
├── package.json                   # NPM package configuration
├── postcss.config.js              # PostCSS configuration
├── PROJECT_STRUCTURE.md           # This file
├── README.md                      # Main documentation
├── SETUP.md                       # Setup and customization guide
├── webpack.config.js              # Webpack build configuration
└── workbox-config.js              # Workbox service worker config
```

## Core Modules

### Performance & Monitoring

#### `src/js/performance/rum.js`
Real User Monitoring collector that tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP) and sends data to analytics endpoint.

**Key Features:**
- Automatic metric collection
- Beacon API for reliability
- Connection-aware tracking
- Device capability detection

#### `src/js/performance/cwv-optimizer.js`
Automatically optimizes for Core Web Vitals with:
- LCP optimization (preloading, preconnect, fetchpriority)
- INP optimization (idle callbacks, passive listeners)
- CLS optimization (image dimensions, font loading)

### Navigation & UX

#### `src/js/view-transitions.js`
Implements View Transitions API for smooth page transitions with:
- Automatic link interception
- Fallback for unsupported browsers
- Custom transition types (slide, fade, zoom)
- Back/forward navigation support

#### `src/js/navigation.js`
Mobile-friendly navigation with:
- Hamburger menu toggle
- Keyboard accessibility
- Outside click detection
- View transition integration

#### `src/js/speculation-rules.js`
Intelligent prefetching and prerendering:
- Document-based rules
- Hover-triggered prefetching
- Connection-aware (respects save-data)
- Avoids destructive actions

### State & Data

#### `src/js/state-manager.js`
Lightweight reactive state management using Proxy:
- Reactive updates
- Subscription system
- Undo/redo support
- Path-based updates

#### `src/js/storage-manager.js`
Unified storage API supporting:
- localStorage
- sessionStorage
- IndexedDB
- Cache API
- TTL support
- Encryption (basic)
- Quota management

#### `src/js/offline-queue.js`
Offline request queue with:
- IndexedDB persistence
- Automatic retry
- Background sync support
- Failure handling

### Network & API

#### `src/js/api-adapter.js`
HTTP client with:
- Request/response interceptors
- Automatic retry with exponential backoff
- Request caching
- Timeout handling
- Error interceptors

### Security & Privacy

#### `src/js/security.js`
Security hardening:
- Content Security Policy
- Subresource Integrity checks
- HTML sanitization
- Input validation
- Clickjacking prevention

#### `src/js/consent-manager.js`
GDPR-compliant consent management:
- Granular consent (necessary, analytics, marketing, preferences)
- Consent versioning
- 6-month expiry
- Consent recording

#### `src/js/analytics.js`
Privacy-first analytics:
- Consent-based tracking
- Page views
- Core Web Vitals
- User engagement (scroll, clicks)
- Beacon API

### Error Handling

#### `src/js/error-boundary.js`
Comprehensive error handling:
- Global error capture
- Resource loading errors
- Network errors
- Unhandled promise rejections
- User notifications
- Error reporting

### Accessibility

#### `src/js/accessibility.js`
WCAG 2.2 AA compliance:
- Skip links
- ARIA live regions
- Keyboard navigation
- Focus management
- Reduced motion support
- Screen reader announcements
- Custom component enhancement

### Media

#### `src/js/media-handler.js`
Media optimization:
- Lazy loading with IntersectionObserver
- Media Session API
- Picture-in-Picture
- Responsive images

### Development

#### `src/js/debugger.js`
Development tools:
- Feature detection
- Performance monitoring
- Debug panel
- State inspection
- Storage management
- Test utilities

## Service Worker

#### `src/sw.js`
Advanced caching strategies:
- Precaching static assets
- Network-first for HTML
- Cache-first for assets
- Network-only for API
- Offline queue integration
- Background sync
- Push notifications

## Styles

#### `src/css/design-tokens.css`
Complete design system:
- Color palette (light/dark modes)
- Typography scale
- Spacing system
- Border radius
- Shadows
- Z-index scale
- Transitions
- Breakpoints

#### `src/css/main.css`
Main stylesheet:
- Reset & base styles
- Typography
- Layout
- Components (buttons, cards, forms)
- Notifications
- Utilities

#### `src/css/view-transitions.css`
View Transitions animations:
- Slide transitions
- Fade transitions
- Zoom transitions
- Back navigation
- Reduced motion support

## Build Configuration

#### `webpack.config.js`
Production-ready build:
- Code splitting
- Minification (Terser, CSSNano)
- Compression (Gzip, Brotli)
- Bundle analysis
- Source maps
- HMR for development

#### `.babelrc`
Modern JavaScript:
- ES6+ support
- Dynamic imports
- Runtime transformation

#### `postcss.config.js`
CSS processing:
- Autoprefixer

## Testing

#### `tests/pwa.test.js`
Comprehensive test suite:
- Service Worker
- Cache API
- IndexedDB
- Performance
- Manifest
- Accessibility
- State management
- Error handling

#### `jest.config.js`
Jest configuration:
- jsdom environment
- Coverage thresholds (70%)
- Setup files
- Module mapping

## Documentation

- **README.md** - Main documentation
- **SETUP.md** - Setup and customization guide
- **CONTRIBUTING.md** - Contribution guidelines
- **PROJECT_STRUCTURE.md** - This file
- **LICENSE** - MIT License

## Key Features Summary

### ⚡ Performance
- Core Web Vitals optimization
- Bundle optimization
- Lazy loading
- Prefetching/prerendering

### 📱 PWA
- Service Worker
- Offline support
- Installable
- App-like experience

### 🎨 UX
- View Transitions
- Dark mode
- Responsive design
- Smooth animations

### ♿ Accessibility
- WCAG 2.2 AA compliant
- Keyboard navigation
- Screen reader support
- Focus management

### 🔒 Security
- CSP
- SRI
- XSS protection
- Input sanitization

### 🍪 Privacy
- GDPR consent
- Privacy-first analytics
- No tracking without consent

### 🧩 Architecture
- Modular
- Maintainable
- Scalable
- Well-documented

## Getting Started

1. Read **README.md** for overview
2. Follow **SETUP.md** for customization
3. Review **CONTRIBUTING.md** before contributing
4. Run `npm install` to get started
5. Use `npm run dev` for development
6. Build with `npm run build`

## Module Dependencies

```
app.js
├── performance/
│   ├── rum.js
│   └── cwv-optimizer.js
├── view-transitions.js
├── navigation.js
├── state-manager.js
├── security.js
├── api-adapter.js
├── storage-manager.js
├── offline-queue.js
├── error-boundary.js
├── accessibility.js
├── consent-manager.js
├── analytics.js (depends on consent-manager)
├── speculation-rules.js
├── media-handler.js
└── debugger.js
```

## Build Output

After running `npm run build`, the `dist/` folder contains:

```
dist/
├── index.html              # Main page
├── offline.html           # Offline fallback
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── js/
│   ├── main.[hash].js     # Main bundle
│   ├── vendors.[hash].js  # Vendor dependencies
│   └── runtime.[hash].js  # Webpack runtime
├── css/
│   └── main.[hash].css    # Compiled styles
├── images/                # Optimized images
└── icons/                 # PWA icons
```

## Next Steps

- Customize colors in `design-tokens.css`
- Update copy in `index.html`
- Add your logo and generate icons
- Configure API endpoints
- Add your pages
- Test and deploy

---

For detailed setup instructions, see **SETUP.md**.
For contribution guidelines, see **CONTRIBUTING.md**.
