# PWA Template 2025 - Complete Setup Guide

This guide will help you set up and customize the PWA Template for your specific needs.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Customization](#customization)
3. [Adding Copy & Colors](#adding-copy--colors)
4. [Testing](#testing)
5. [Deployment](#deployment)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
API_BASE_URL=https://your-api.com
ANALYTICS_ID=your-analytics-id
```

### 3. Test Development Server

```bash
npm run dev
```

Open `http://localhost:3000` to verify everything works.

## Customization

### Changing App Name and Branding

#### 1. Update package.json

```json
{
  "name": "your-app-name",
  "description": "Your app description"
}
```

#### 2. Update manifest.json

```json
{
  "name": "Your App Name",
  "short_name": "YourApp",
  "description": "Your app description"
}
```

#### 3. Update HTML Files

In `src/index.html`:
```html
<title>Your App Name | Your Tagline</title>
<meta name="description" content="Your app description">
```

### Changing Colors

#### 1. Update Design Tokens

Edit `src/css/design-tokens.css`:

```css
:root {
  --color-primary: #YOUR_COLOR;      /* Main brand color */
  --color-secondary: #YOUR_COLOR;    /* Secondary brand color */
  --color-success: #YOUR_COLOR;      /* Success states */
  --color-danger: #YOUR_COLOR;       /* Error states */
  --color-warning: #YOUR_COLOR;      /* Warning states */
}
```

#### 2. Update Manifest Theme Color

In `public/manifest.json`:

```json
{
  "theme_color": "#YOUR_PRIMARY_COLOR",
  "background_color": "#YOUR_BACKGROUND_COLOR"
}
```

#### 3. Update Meta Theme Color

In `src/index.html`:

```html
<meta name="theme-color" content="#YOUR_PRIMARY_COLOR">
```

### Changing Copy (Text Content)

#### 1. Update Home Page

Edit `src/index.html`:

```html
<h1>Your Main Heading</h1>
<p class="lead">Your tagline or description</p>
```

#### 2. Update Features Section

```html
<div class="card">
  <h3>Your Feature Title</h3>
  <p>Your feature description</p>
</div>
```

#### 3. Update Navigation

```html
<ul id="nav-menu" class="nav-menu">
  <li><a href="/">Your Link 1</a></li>
  <li><a href="/page">Your Link 2</a></li>
</ul>
```

### Adding Your Logo

#### 1. Prepare Your Logo

- Create a square SVG or PNG (minimum 512x512px)
- Ensure transparent background for best results
- Save as `public/logo.svg` or `public/logo.png`

#### 2. Generate PWA Icons

```bash
# Install icon generator (if not using online tool)
npm install -g pwa-asset-generator

# Generate icons
pwa-asset-generator public/logo.svg public/icons \
  --background "#ffffff" \
  --splash-only false \
  --icon-only false
```

Or use online tools:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

#### 3. Update Logo in HTML

In `src/index.html`:

```html
<a href="/" class="logo">
  <img src="/logo.svg" alt="Your App Name" height="40">
</a>
```

Or use text logo:

```html
<a href="/" class="logo">Your App</a>
```

### Customizing Fonts

#### 1. Add Google Fonts

In `src/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;600;700&display=swap" rel="stylesheet">
```

#### 2. Update Font Variables

In `src/css/design-tokens.css`:

```css
:root {
  --font-family-base: 'Your Font', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Adding New Pages

#### 1. Create HTML File

Create `src/your-page.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Copy head from index.html -->
  <title>Page Title | Your App</title>
</head>
<body>
  <!-- Copy header from index.html -->

  <main id="main-content" tabindex="-1">
    <div class="container">
      <h1>Your Page Title</h1>
      <!-- Your content -->
    </div>
  </main>

  <!-- Copy footer from index.html -->
</body>
</html>
```

#### 2. Update Webpack Config

In `webpack.config.js`:

```javascript
new HtmlWebpackPlugin({
  template: './src/your-page.html',
  filename: 'your-page.html'
})
```

#### 3. Update Navigation

Add link to navigation menu.

#### 4. Update Service Worker

In `src/sw.js`, add to precache:

```javascript
const PRECACHE_ASSETS = [
  '/',
  '/your-page.html',
  // ...
];
```

## Adding Custom Features

### Adding Analytics

The template includes privacy-first analytics. To enable:

1. Get user consent via the consent manager
2. Configure in `src/js/analytics.js`
3. Add your analytics ID to `.env`

### Adding a Contact Form

```html
<form id="contact-form" class="contact-form">
  <div class="form-group">
    <label for="name" class="form-label">Name</label>
    <input type="text" id="name" name="name" class="form-input" required>
  </div>

  <div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input type="email" id="email" name="email" class="form-input" required>
  </div>

  <div class="form-group">
    <label for="message" class="form-label">Message</label>
    <textarea id="message" name="message" class="form-textarea" required></textarea>
  </div>

  <button type="submit" class="btn btn-primary">Send Message</button>
</form>
```

### Adding API Integration

```javascript
// In your page's script
const api = window.app.getAPI();

async function submitForm(data) {
  try {
    const response = await api.post('/contact', data);
    console.log('Success:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Testing

### Before Deploying

1. **Test Locally**
```bash
npm run build
npm run serve
```

2. **Run Lighthouse**
```bash
npm run test:lighthouse
```

3. **Test Offline**
- Open DevTools Network tab
- Select "Offline"
- Verify app still works

4. **Test on Real Devices**
- Use ngrok or similar for local testing
- Test on iOS Safari
- Test on Android Chrome

5. **Validate PWA**
- Use https://www.pwabuilder.com/
- Check all criteria are met

## Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Test Production Build

```bash
npm run serve
```

### 3. Deploy

Choose your platform and follow deployment instructions in README.md.

### 4. Post-Deployment Checks

- [ ] PWA installs correctly
- [ ] Service worker registers
- [ ] Offline mode works
- [ ] Icons display correctly
- [ ] Lighthouse score > 90
- [ ] All pages load
- [ ] Forms work
- [ ] Analytics tracking

## Troubleshooting

### Service Worker Not Updating

```javascript
// Force update
window.__PWA_DEBUG__.forceUpdate()
```

### Cache Issues

```javascript
// Clear all caches
window.__PWA_DEBUG__.clearStorage()
```

### Debugging

Press the debug button (🛠️) in the bottom-right corner to access the debug panel (development mode only).

## Support

For issues or questions:
- Check the README.md
- Review GitHub Issues
- Create a new issue if needed

## Next Steps

Once set up:
1. Customize colors and copy
2. Add your logo and icons
3. Create your pages
4. Test thoroughly
5. Deploy to production

Good luck with your PWA! 🚀
