// BookmarkHero Extension Background Service Worker
class BookmarkHeroBackground {
  constructor() {
    this.apiBase = 'http://localhost:3001/api'; // TODO: Make configurable
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupContextMenus();
    this.setupKeyboardShortcuts();
  }

  setupEventListeners() {
    // Extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Tab updates for detecting bookmarkable pages
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle authentication token expiration
    chrome.webRequest.onCompleted.addListener(
      (details) => this.handleApiResponse(details),
      { urls: [`${this.apiBase}/*`] }
    );
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'save-bookmark',
      title: 'Save to BookmarkHero',
      contexts: ['page', 'link'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });

    chrome.contextMenus.create({
      id: 'save-link',
      title: 'Save link to BookmarkHero',
      contexts: ['link'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  setupKeyboardShortcuts() {
    chrome.commands.onCommand.addListener((command) => {
      this.handleKeyboardShortcut(command);
    });
  }

  async handleInstallation(details) {
    console.log('BookmarkHero extension installed:', details.reason);
    
    if (details.reason === 'install') {
      // Set default settings
      await chrome.storage.local.set({
        settings: {
          apiUrl: 'http://localhost:3001/api',
          autoSave: false,
          defaultCollection: null,
          quickSaveEnabled: true,
          notificationsEnabled: true
        }
      });

      // Open welcome page
      chrome.tabs.create({
        url: chrome.runtime.getURL('options.html?welcome=true')
      });
    }
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    // Update extension badge based on bookmark status
    if (changeInfo.status === 'complete' && tab.url) {
      try {
        const isBookmarked = await this.checkIfBookmarked(tab.url);
        
        chrome.action.setBadgeText({
          tabId: tabId,
          text: isBookmarked ? '✓' : ''
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#10b981'
        });
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'saveBookmark':
          const result = await this.saveBookmark(request.data);
          sendResponse({ success: true, data: result });
          break;

        case 'checkBookmarkStatus':
          const isBookmarked = await this.checkIfBookmarked(request.url);
          sendResponse({ success: true, isBookmarked });
          break;

        case 'getPageMetadata':
          const metadata = await this.extractPageMetadata(sender.tab);
          sendResponse({ success: true, metadata });
          break;

        case 'refreshToken':
          const newToken = await this.refreshAuthToken();
          sendResponse({ success: true, token: newToken });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleContextMenuClick(info, tab) {
    try {
      let url, title;
      
      if (info.menuItemId === 'save-link') {
        url = info.linkUrl;
        title = info.selectionText || 'Linked page';
      } else {
        url = tab.url;
        title = tab.title;
      }

      // Check if user is authenticated
      const authData = await chrome.storage.local.get(['authToken', 'user']);
      
      if (!authData.authToken) {
        // Show login notification
        this.showNotification('Authentication Required', 
          'Please sign in to BookmarkHero to save bookmarks');
        return;
      }

      // Save bookmark
      const bookmark = await this.saveBookmark({
        url,
        title,
        description: info.selectionText || ''
      });

      this.showNotification('Bookmark Saved', 
        `"${title}" has been saved to BookmarkHero`);

    } catch (error) {
      console.error('Context menu save error:', error);
      this.showNotification('Save Failed', 
        'Failed to save bookmark. Please try again.');
    }
  }

  async handleKeyboardShortcut(command) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      switch (command) {
        case 'save-bookmark':
          await this.quickSaveBookmark(tab);
          break;
          
        case 'toggle-popup':
          // Open popup programmatically
          chrome.action.openPopup();
          break;
      }
    } catch (error) {
      console.error('Keyboard shortcut error:', error);
    }
  }

  async quickSaveBookmark(tab) {
    try {
      // Check authentication
      const authData = await chrome.storage.local.get(['authToken', 'user']);
      
      if (!authData.authToken) {
        this.showNotification('Authentication Required', 
          'Please sign in to BookmarkHero first');
        return;
      }

      // Check if already bookmarked
      const isBookmarked = await this.checkIfBookmarked(tab.url);
      
      if (isBookmarked) {
        this.showNotification('Already Bookmarked', 
          'This page is already in your bookmarks');
        return;
      }

      // Get page metadata
      const metadata = await this.extractPageMetadata(tab);

      // Save bookmark
      const bookmark = await this.saveBookmark({
        url: tab.url,
        title: metadata.title || tab.title,
        description: metadata.description || ''
      });

      this.showNotification('Quick Save Successful', 
        `"${bookmark.title}" saved to BookmarkHero`);

      // Update badge
      chrome.action.setBadgeText({
        tabId: tab.id,
        text: '✓'
      });

    } catch (error) {
      console.error('Quick save error:', error);
      this.showNotification('Save Failed', 
        'Failed to save bookmark. Please try again.');
    }
  }

  async saveBookmark(bookmarkData) {
    const authData = await chrome.storage.local.get(['authToken']);
    
    const response = await fetch(`${this.apiBase}/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookmarkData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        await this.refreshAuthToken();
        throw new Error('Authentication expired. Please try again.');
      }
      
      const error = await response.json();
      throw new Error(error.error || 'Failed to save bookmark');
    }

    const result = await response.json();
    return result.data.bookmark;
  }

  async checkIfBookmarked(url) {
    try {
      const authData = await chrome.storage.local.get(['authToken']);
      
      if (!authData.authToken) {
        return false;
      }

      const response = await fetch(
        `${this.apiBase}/bookmarks/search?q=${encodeURIComponent(url)}`,
        {
          headers: {
            'Authorization': `Bearer ${authData.authToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.data.bookmarks.some(bookmark => bookmark.url === url);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
    
    return false;
  }

  async extractPageMetadata(tab) {
    try {
      // Inject content script to extract metadata
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Extract metadata from page
          const getMetaContent = (name) => {
            const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            return meta ? meta.getAttribute('content') : null;
          };

          return {
            title: document.title,
            description: getMetaContent('description') || 
                        getMetaContent('og:description') || 
                        getMetaContent('twitter:description'),
            image: getMetaContent('og:image') || 
                   getMetaContent('twitter:image'),
            siteName: getMetaContent('og:site_name'),
            favicon: (() => {
              const link = document.querySelector('link[rel*="icon"]');
              return link ? new URL(link.href, window.location.origin).href : null;
            })()
          };
        }
      });

      return results[0]?.result || {};
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
    }
  }

  async refreshAuthToken() {
    try {
      const authData = await chrome.storage.local.get(['refreshToken']);
      
      if (!authData.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: authData.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update stored tokens
        await chrome.storage.local.set({
          authToken: data.data.tokens.accessToken,
          refreshToken: data.data.tokens.refreshToken
        });

        return data.data.tokens.accessToken;
      } else {
        // Refresh failed, clear auth data
        await chrome.storage.local.remove(['authToken', 'refreshToken', 'user']);
        throw new Error('Authentication expired. Please sign in again.');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  showNotification(title, message, type = 'basic') {
    chrome.notifications.create({
      type: type,
      iconUrl: 'icons/icon-48.png',
      title: title,
      message: message
    });
  }

  async handleApiResponse(details) {
    // Handle 401 responses to refresh tokens automatically
    if (details.statusCode === 401) {
      try {
        await this.refreshAuthToken();
      } catch (error) {
        console.error('Auto token refresh failed:', error);
      }
    }
  }
}

// Initialize background service worker
new BookmarkHeroBackground();