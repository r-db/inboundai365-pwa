# Installation Instructions

## System Requirements

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Operating System**: macOS, Linux, or Windows
- **Browser**: Modern browser with Service Worker support

## Step-by-Step Installation

### 1. Verify Prerequisites

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version
```

If you need to install or update Node.js:
- Download from: https://nodejs.org/
- Or use nvm: `nvm install 16`

### 2. Navigate to Project Directory

```bash
cd /Volumes/MM001/Documents/pwa_template
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Webpack and plugins
- Babel transpiler
- Testing frameworks
- Development tools

Expected output:
```
added XXX packages in XXs
```

### 4. Verify Installation

```bash
# Check if all dependencies are installed
npm list --depth=0
```

### 5. Start Development Server

```bash
npm run dev
```

Expected output:
```
webpack compiled successfully
```

### 6. Open in Browser

Navigate to: `http://localhost:3000`

You should see the PWA Template home page! 🎉

## Troubleshooting

### Issue: "npm install" fails

**Solution 1**: Clear npm cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2**: Update npm
```bash
npm install -g npm@latest
```

**Solution 3**: Use different registry
```bash
npm install --registry=https://registry.npmjs.org/
```

### Issue: Port 3000 already in use

**Solution**: Use a different port
```bash
PORT=3001 npm run dev
```

Or kill the process using port 3000:
```bash
# On macOS/Linux
lsof -ti:3000 | xargs kill

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Module not found errors

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission errors

**Solution**: Fix permissions
```bash
# On macOS/Linux
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
```

### Issue: Webpack compilation errors

**Solution 1**: Clear webpack cache
```bash
rm -rf node_modules/.cache
npm run dev
```

**Solution 2**: Update webpack
```bash
npm update webpack webpack-cli webpack-dev-server
```

## Post-Installation Steps

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file with your settings.

### 2. Test Build Process

```bash
npm run build
```

This creates a production build in `dist/` folder.

### 3. Test Production Build

```bash
npm run serve
```

Opens production build at `http://localhost:3000`

### 4. Run Tests

```bash
npm test
```

All tests should pass ✅

## Development Workflow

### Starting Development

```bash
npm run dev
```

- Hot reload enabled
- Source maps enabled
- Debug tools enabled

### Building for Production

```bash
npm run build
```

- Minification enabled
- Compression enabled
- Source maps for debugging

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Linting Code

```bash
npm run lint
```

### Formatting Code

```bash
npm run format
```

### Analyzing Bundle

```bash
npm run analyze
```

Opens bundle analysis in browser.

## IDE Setup

### Visual Studio Code

Recommended extensions:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-js-debug"
  ]
}
```

### WebStorm/IntelliJ

1. Enable ESLint: Settings → Languages → JavaScript → ESLint
2. Enable Prettier: Settings → Languages → JavaScript → Prettier
3. Set Node interpreter: Settings → Languages → Node.js

## Browser Setup

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Application tab
3. Check:
   - Service Workers
   - Cache Storage
   - IndexedDB
   - Manifest

### Firefox DevTools

1. Open DevTools (F12)
2. Go to Storage tab
3. Check service worker registration

## Verification Checklist

After installation, verify:

- [ ] `npm run dev` starts successfully
- [ ] Browser opens at http://localhost:3000
- [ ] PWA template loads without errors
- [ ] Service Worker registers (check DevTools)
- [ ] Cache Storage populated
- [ ] Dark mode toggle works
- [ ] Navigation menu works
- [ ] No console errors

## Next Steps

1. ✅ Read **QUICKSTART.md** for 5-minute setup
2. ✅ Read **SETUP.md** for customization
3. ✅ Read **README.md** for full documentation
4. ✅ Start customizing your PWA!

## Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Read the full documentation
3. Search existing GitHub issues
4. Create a new issue with:
   - Error message
   - Node/npm versions
   - Operating system
   - Steps to reproduce

## System-Specific Notes

### macOS

- Use Terminal or iTerm2
- May need to allow localhost in firewall
- Use Safari for iOS PWA testing

### Linux

- May need to install build tools:
  ```bash
  sudo apt-get install build-essential
  ```

### Windows

- Use Command Prompt or PowerShell
- May need to enable Developer Mode
- Some scripts may need adjustment for Windows paths

## Success! 🎉

You should now have:
- ✅ All dependencies installed
- ✅ Development server running
- ✅ PWA template loaded in browser
- ✅ No errors in console

**Ready to start building!** 🚀

For next steps, see **QUICKSTART.md**
