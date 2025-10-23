# ⚡ Quick Start Guide - PWA Chatbot

Get your AI-powered chatbot running in 5 minutes!

## Prerequisites

- Node.js 16+ and npm 8+
- Python 3.9+
- OpenAI API key
- Docker & Docker Compose (for production)

---

## 🚀 For Production (Recommended)

### Step 1: Run Setup Script

```bash
./setup-api-keys.sh
```

This interactive script will:
- Generate a secure SECRET_KEY
- Prompt for your OpenAI API key
- Configure your domain
- Set up HTTPS settings

### Step 2: Deploy

```bash
./deploy.sh
```

That's it! Application runs at `http://localhost:5001`

### Step 3: Configure Reverse Proxy

See `DEPLOYMENT.md` for nginx/Caddy configuration with SSL.

---

## 🔧 For Development

### Step 1: Install Dependencies (2 minutes)

```bash
# Clone or download the repository
cd pwa_template

# Frontend dependencies
npm install

# Backend dependencies
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 2: Configure Environment (1 minute)

```bash
# Copy backend environment template
cp backend/.env.example backend/.env

# Edit and add your OpenAI API key
nano backend/.env
# Change: OPENAI_API_KEY=your-openai-api-key-here
```

### Step 3: Run Development Servers (2 minutes)

```bash
# Terminal 1: Frontend (port 4000)
npm run dev

# Terminal 2: Backend (port 5001)
cd backend
source venv/bin/activate
python run.py
```

Open `http://localhost:4000/contact` - Your chatbot is running! 🎉

---

## 📝 Get API Keys

### OpenAI (Required)
1. Visit https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)
4. Add to `.env.production` or `backend/.env`

### Anthropic/Claude (Optional)
1. Visit https://console.anthropic.com/
2. Create an API key
3. Add to environment file

---

## ✅ Verify Installation

### Check Health

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "openai": true,
    "claude": false
  }
}
```

### Test Chat

1. Open http://localhost:4000/contact
2. Type a message in the chat interface
3. You should see a response from GPT-4
4. Token counter in bottom-left shows usage

## What You Get

✅ Offline-first PWA
✅ Fast (optimized for Core Web Vitals)
✅ Installable
✅ Accessible (WCAG 2.2 AA)
✅ Secure
✅ Dark mode
✅ Mobile-friendly
✅ SEO-ready

## Common Customizations

### Add Your Logo

1. Save logo as `public/logo.svg` (512x512px, square)
2. Use an icon generator:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
3. Replace icons in `public/icons/`

### Add a New Page

1. Create `src/my-page.html` (copy from `index.html`)
2. Update content
3. Add to navigation:
```html
<li><a href="/my-page">My Page</a></li>
```

### Change Fonts

In `src/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

In `src/css/design-tokens.css`:
```css
:root {
  --font-family-base: 'Your Font', sans-serif;
}
```

### Add Contact Form

```html
<form id="contact">
  <input type="text" placeholder="Name" required>
  <input type="email" placeholder="Email" required>
  <textarea placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>
```

### Connect to API

```javascript
const api = window.app.getAPI();
const data = await api.get('/endpoint');
```

## Deployment

### Netlify (Recommended)

1. Push code to GitHub
2. Go to https://app.netlify.com/
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy!

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages

```bash
npm run build
# Push dist/ to gh-pages branch
```

## Testing Before Deploy

```bash
# Build production version
npm run build

# Serve locally
npm run serve

# Test at http://localhost:3000
```

### What to Check

- [ ] App installs (click install button)
- [ ] Works offline (DevTools → Network → Offline)
- [ ] All pages load
- [ ] Navigation works
- [ ] Forms work (if any)
- [ ] Dark mode works (click 🌓 button)

## Troubleshooting

### "npm install" fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Service Worker not updating
```bash
# In browser console
window.__PWA_DEBUG__.forceUpdate()
```

### Build errors
```bash
# Check Node version (should be 16+)
node --version

# Update if needed
nvm install 16
nvm use 16
```

## Next Steps

Once your PWA is running:

1. ✅ **Customize colors** - Make it yours
2. ✅ **Add content** - Replace placeholder text
3. ✅ **Add pages** - Create your structure
4. ✅ **Add features** - Forms, API integration, etc.
5. ✅ **Test** - On real devices
6. ✅ **Deploy** - Make it live!

## Additional Resources

- 📖 **Full Documentation**: See README.md
- 🛠 **Setup Guide**: See SETUP.md
- 🏗 **Project Structure**: See PROJECT_STRUCTURE.md
- 🤝 **Contributing**: See CONTRIBUTING.md

## Need Help?

- Check the README.md for detailed info
- Review existing GitHub issues
- Create a new issue if needed

## Performance Tips

✅ Keep images under 100KB
✅ Lazy load images
✅ Use WebP format
✅ Minimize JavaScript
✅ Test on slow connections

## SEO Tips

✅ Update meta descriptions
✅ Add relevant keywords
✅ Use semantic HTML
✅ Add alt text to images
✅ Create XML sitemap

## Security Checklist

✅ HTTPS only (required for PWA)
✅ Update dependencies regularly
✅ Don't commit secrets to git
✅ Use environment variables
✅ Enable CSP headers

## Before Going Live

- [ ] Update all placeholder content
- [ ] Test on iOS Safari & Android Chrome
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test offline functionality
- [ ] Verify PWA install works
- [ ] Check all forms work
- [ ] Test on slow 3G connection
- [ ] Verify analytics tracking
- [ ] Check GDPR compliance
- [ ] Update privacy policy
- [ ] Set up error monitoring

## Success Metrics

After launch, monitor:
- Lighthouse scores (aim for 90+)
- Core Web Vitals (green in Search Console)
- Install rate
- Return visitors
- Engagement metrics

## Congratulations! 🎉

You now have a production-ready PWA. Keep iterating and improving!

---

**Questions?** Open an issue on GitHub
**Love it?** Star the repository ⭐
**Want to contribute?** See CONTRIBUTING.md
