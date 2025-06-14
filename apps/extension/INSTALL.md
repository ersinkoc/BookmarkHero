# 🚀 BookmarkHero Extension Installation Guide

## Quick Start

### 1. **Prerequisites**
- BookmarkHero API server running (default: `http://localhost:3001`)
- Chrome, Firefox, or Edge browser
- BookmarkHero user account

### 2. **Load Extension (Development)**

#### **Chrome/Edge**
1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to and select the `apps/extension` folder
5. Extension should appear in your toolbar

#### **Firefox** 
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `apps/extension/manifest.json`
4. Click "Open" to load the extension

### 3. **First Setup**
1. Click the BookmarkHero icon in your toolbar
2. Sign in with your BookmarkHero account
3. Extension will connect and sync your collections

### 4. **Configure Settings** (Optional)
1. Right-click extension icon → "Options"
2. Set custom API URL if using self-hosted instance
3. Adjust saving preferences and notifications
4. Customize keyboard shortcuts

## ✅ Testing Checklist

### **Basic Functionality**
- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Login form connects to API
- [ ] Settings page opens and saves preferences

### **Bookmark Saving**
- [ ] Save button works in popup
- [ ] Keyboard shortcut `Ctrl+Shift+S` saves bookmark
- [ ] Right-click context menu appears
- [ ] Floating button appears on scroll
- [ ] Saved bookmarks appear in dashboard

### **Authentication**
- [ ] Login with valid credentials works
- [ ] Invalid credentials show error
- [ ] Auto-refresh token when expired
- [ ] Logout clears stored data

### **Settings & Options**
- [ ] API URL can be changed
- [ ] Collections load in dropdown
- [ ] Toggle switches save settings
- [ ] Reset settings works
- [ ] Export data downloads JSON

### **Cross-Browser**
- [ ] Works in Chrome
- [ ] Works in Firefox  
- [ ] Works in Edge
- [ ] Consistent UI across browsers

## 🔧 Development Testing

### **API Integration**
```bash
# Ensure API is running
cd apps/api
npm run dev

# Test API endpoints
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@bookmark-hero.com","password":"Demo123!Pass"}'
```

### **Extension Console**
1. Right-click extension icon → "Inspect popup"
2. Check Console tab for errors
3. Monitor Network tab for API calls
4. Verify storage in Application tab

### **Background Script Debug**
1. Go to `chrome://extensions/`
2. Find BookmarkHero extension
3. Click "service worker" link
4. Check background script console

## 🐛 Common Issues

### **"Extension not loading"**
- Check manifest.json syntax
- Ensure all files are present
- Verify permissions in manifest
- Check browser console for errors

### **"API connection failed"**
- Verify API server is running
- Check API URL in settings
- Ensure CORS is configured
- Test API endpoints manually

### **"Authentication not working"**
- Clear extension storage
- Check credentials are correct
- Verify JWT_SECRET is set
- Test login via web interface

### **"Popup not opening"**
- Check popup.html loads correctly
- Verify popup.js has no errors
- Test in incognito mode
- Restart browser if needed

## 📦 Production Build

### **Package Extension**
```bash
cd apps/extension
npm run pack
# Creates extension.zip in parent directory
```

### **Chrome Web Store**
1. Create ZIP package
2. Create developer account
3. Upload extension package
4. Fill store listing details
5. Submit for review

### **Firefox Add-ons**
1. Create signed package
2. Upload to addons.mozilla.org
3. Complete listing information
4. Submit for review

## 🔒 Security Notes

- Extension uses minimal permissions
- Authentication tokens stored securely
- No data sent to third parties
- HTTPS recommended for production
- Regular security updates provided

## 📞 Support

Need help? Check these resources:

- **Documentation**: [README.md](README.md)
- **Issues**: Create GitHub issue with details
- **API Docs**: Check main BookmarkHero documentation
- **Browser Console**: Check for error messages

## 🎯 Next Steps

1. **Add Real Icons**: Replace placeholder icons with actual PNG files
2. **Test Thoroughly**: Use the testing checklist above
3. **Package for Distribution**: Create production build
4. **Submit to Stores**: Publish on Chrome Web Store and Firefox Add-ons
5. **Monitor Usage**: Set up analytics and error tracking