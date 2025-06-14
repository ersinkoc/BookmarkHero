# 🔖 BookmarkHero Browser Extension

A powerful browser extension for [BookmarkHero](https://github.com/bookmarkhero/bookmarkhero) that lets you save, organize, and access your bookmarks directly from your browser.

## ✨ Features

### 🚀 **Quick Save**
- **One-click saving** from browser toolbar
- **Floating save button** on web pages
- **Keyboard shortcuts** (`Ctrl+Shift+S`)
- **Context menu integration** - right-click to save

### 🎯 **Smart Organization**
- **Auto-detect metadata** (title, description, favicon)
- **Tag suggestions** based on page content
- **Collection assignment** with default options
- **Duplicate detection** to prevent duplicates

### 🔄 **Real-time Sync**
- **Cross-device synchronization** with BookmarkHero account
- **Automatic authentication** with refresh tokens
- **Offline support** with sync when reconnected

### ⚙️ **Customizable Settings**
- **Configurable API endpoint** for self-hosted instances
- **Flexible saving preferences** and defaults
- **Notification controls** and privacy settings
- **Keyboard shortcut customization**

## 🛠️ Installation

### Chrome Web Store (Coming Soon)
1. Visit the [BookmarkHero Chrome Extension](https://chrome.google.com/webstore) page
2. Click "Add to Chrome"
3. Follow the setup wizard

### Manual Installation (Development)
1. **Download the extension**:
   ```bash
   git clone https://github.com/bookmarkhero/bookmarkhero.git
   cd bookmarkhero/apps/extension
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `apps/extension` folder

3. **Load in Firefox**:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the extension folder

## 🚀 Quick Start

### 1. **Connect Your Account**
- Click the BookmarkHero icon in your browser toolbar
- Sign in with your BookmarkHero account
- Or create a new account if you don't have one

### 2. **Configure Settings**
- Right-click the extension icon → "Options"
- Set your BookmarkHero API URL (default: `http://localhost:3001/api`)
- Customize saving preferences and shortcuts

### 3. **Start Saving Bookmarks**
- **Toolbar button**: Click the BookmarkHero icon
- **Keyboard shortcut**: Press `Ctrl+Shift+S` (`Cmd+Shift+S` on Mac)
- **Right-click menu**: "Save to BookmarkHero"
- **Floating button**: Appears when scrolling on web pages

## 🎮 Usage

### **Popup Interface**
- **Quick save** current page with title and description
- **Add tags** separated by commas
- **Choose collection** from dropdown
- **Mark as favorite** with checkbox
- **View in dashboard** link

### **Context Menu**
- **Save page**: Right-click anywhere → "Save to BookmarkHero"
- **Save link**: Right-click on links → "Save link to BookmarkHero"

### **Keyboard Shortcuts**
- `Ctrl+Shift+S` (`Cmd+Shift+S`): Quick save current page
- `Ctrl+Shift+B` (`Cmd+Shift+B`): Open extension popup

### **Floating Button**
- Appears automatically when scrolling
- One-click saving with auto-detected metadata
- Visual feedback for saved/unsaved pages

## ⚙️ Configuration

### **API Settings**
```javascript
// Default configuration
{
  "apiUrl": "http://localhost:3001/api",
  "autoSave": false,
  "defaultCollection": null,
  "quickSaveEnabled": true,
  "notificationsEnabled": true
}
```

### **Self-Hosted Setup**
1. Update API URL in extension settings
2. Ensure CORS is configured for your domain
3. Set up SSL certificates for HTTPS (recommended)

### **Authentication**
- Uses JWT tokens with automatic refresh
- Secure token storage in browser's local storage
- Automatic re-authentication on token expiry

## 🔧 Development

### **Project Structure**
```
apps/extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html             # Popup interface
├── options.html           # Settings page
├── background.js          # Service worker
├── content.js             # Content script
├── scripts/
│   ├── popup.js          # Popup functionality
│   └── options.js        # Settings functionality
├── styles/
│   ├── popup.css         # Popup styles
│   └── options.css       # Settings styles
└── icons/                # Extension icons
```

### **Key Files**

#### **`manifest.json`**
- Manifest V3 configuration
- Permissions and host permissions
- Background service worker registration
- Content script injection rules

#### **`background.js`**
- Context menu management
- Keyboard shortcut handling
- API communication
- Authentication token management
- Bookmark status tracking

#### **`content.js`**
- Floating save button injection
- Page metadata extraction
- User interaction handling
- Visual feedback and notifications

#### **`popup.js`**
- Main extension interface
- Form handling and validation
- Real-time page information display
- Collection and tag management

### **API Integration**
```javascript
// Example API call
const response = await fetch(`${apiUrl}/bookmarks`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: currentTab.url,
    title: pageTitle,
    description: pageDescription,
    collectionIds: selectedCollections,
    tagIds: selectedTags
  })
});
```

### **Build Process**
```bash
# Package for distribution
npm run pack

# Development mode
npm run dev
```

## 🔒 Security & Privacy

### **Data Protection**
- **Local storage only** for authentication tokens
- **No analytics tracking** or data collection
- **Secure API communication** with HTTPS
- **Minimal permissions** requested

### **Permissions Used**
- `activeTab`: Access current tab information
- `storage`: Store settings and auth tokens
- `contextMenus`: Add save options to right-click menu
- `tabs`: Create new tabs for dashboard access

### **Security Features**
- **Token rotation** with refresh mechanism
- **Automatic logout** on token expiry
- **HTTPS enforcement** for production APIs
- **Input sanitization** for all user data

## 🐛 Troubleshooting

### **Common Issues**

#### **"Connection Error"**
- Check BookmarkHero API server is running
- Verify API URL in extension settings
- Ensure CORS is properly configured

#### **"Authentication Failed"**
- Check username/password are correct
- Clear extension cache in settings
- Re-connect your account

#### **"Extension Not Working"**
- Refresh the browser tab
- Disable and re-enable the extension
- Check browser console for errors

#### **"Keyboard Shortcuts Not Working"**
- Check Chrome shortcuts: `chrome://extensions/shortcuts`
- Ensure no conflicts with other extensions
- Try alternative shortcuts

### **Debug Mode**
1. Open browser developer tools
2. Check Console tab for error messages
3. Inspect Network tab for API calls
4. Report issues with error details

## 📋 Browser Compatibility

### **Supported Browsers**
- ✅ **Chrome** 88+ (Manifest V3)
- ✅ **Edge** 88+ (Chromium-based)
- ✅ **Firefox** 109+ (Manifest V3 support)
- ✅ **Opera** 74+ (Chromium-based)

### **Feature Support**
| Feature | Chrome | Firefox | Edge | Opera |
|---------|--------|---------|------|-------|
| Manifest V3 | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Context Menus | ✅ | ✅ | ✅ | ✅ |
| Keyboard Shortcuts | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in multiple browsers
5. Submit a pull request

### **Code Style**
- Use modern JavaScript (ES2020+)
- Follow existing code patterns
- Add comments for complex logic
- Test all functionality thoroughly

### **Testing Checklist**
- [ ] Popup interface works correctly
- [ ] Settings page saves properly
- [ ] Background script handles events
- [ ] Content script injections work
- [ ] Authentication flow complete
- [ ] API integration functional
- [ ] Cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern browser extension APIs
- Designed for the BookmarkHero ecosystem
- Community-driven development approach
- Open source and privacy-focused

---

**📧 Support**: [support@bookmarkhero.com](mailto:support@bookmarkhero.com)  
**🐛 Issues**: [GitHub Issues](https://github.com/bookmarkhero/bookmarkhero/issues)  
**📚 Documentation**: [docs.bookmarkhero.com](https://docs.bookmarkhero.com)