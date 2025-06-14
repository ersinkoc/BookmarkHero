// BookmarkHero Extension Options Script
class BookmarkHeroOptions {
  constructor() {
    this.settings = {
      apiUrl: 'http://localhost:3001/api',
      autoSave: false,
      defaultCollection: null,
      quickSaveEnabled: true,
      contextMenuEnabled: true,
      notificationsEnabled: true,
      duplicateWarnings: true
    };
    
    this.user = null;
    this.collections = [];
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.checkAuthentication();
    this.setupEventListeners();
    this.populateForm();
    this.checkWelcomeMode();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      if (result.settings) {
        this.settings = { ...this.settings, ...result.settings };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({ settings: this.settings });
      this.showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showToast('Error saving settings', 'error');
    }
  }

  async checkAuthentication() {
    try {
      const result = await chrome.storage.local.get(['authToken', 'user']);
      
      if (result.authToken && result.user) {
        this.user = result.user;
        this.showConnectedState();
        await this.loadCollections();
      } else {
        this.showDisconnectedState();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      this.showDisconnectedState();
    }
  }

  async loadCollections() {
    try {
      const result = await chrome.storage.local.get(['authToken']);
      
      const response = await fetch(`${this.settings.apiUrl}/collections`, {
        headers: {
          'Authorization': `Bearer ${result.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.collections = data.data.collections || [];
        this.populateCollectionSelect();
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  populateCollectionSelect() {
    const select = document.getElementById('default-collection');
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">No default collection</option>';
    
    this.collections.forEach(collection => {
      const option = document.createElement('option');
      option.value = collection.id;
      option.textContent = collection.name;
      if (collection.id === this.settings.defaultCollection) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    // Welcome section
    document.getElementById('connect-account')?.addEventListener('click', () => {
      this.openAuthPage();
    });
    
    document.getElementById('skip-setup')?.addEventListener('click', () => {
      this.hideWelcomeSection();
    });

    // Account management
    document.getElementById('connect-account-main')?.addEventListener('click', () => {
      this.openAuthPage();
    });
    
    document.getElementById('disconnect-account')?.addEventListener('click', () => {
      this.disconnectAccount();
    });

    // Settings form elements
    document.getElementById('api-url').addEventListener('change', (e) => {
      this.settings.apiUrl = e.target.value;
      this.saveSettings();
    });

    document.getElementById('auto-save').addEventListener('change', (e) => {
      this.settings.autoSave = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('default-collection').addEventListener('change', (e) => {
      this.settings.defaultCollection = e.target.value || null;
      this.saveSettings();
    });

    document.getElementById('quick-save-enabled').addEventListener('change', (e) => {
      this.settings.quickSaveEnabled = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('context-menu-enabled').addEventListener('change', (e) => {
      this.settings.contextMenuEnabled = e.target.checked;
      this.saveSettings();
      this.updateContextMenus();
    });

    document.getElementById('notifications-enabled').addEventListener('change', (e) => {
      this.settings.notificationsEnabled = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('duplicate-warnings').addEventListener('change', (e) => {
      this.settings.duplicateWarnings = e.target.checked;
      this.saveSettings();
    });

    // Action buttons
    document.getElementById('open-dashboard')?.addEventListener('click', () => {
      this.openDashboard();
    });

    document.getElementById('export-data').addEventListener('click', () => {
      this.exportExtensionData();
    });

    document.getElementById('clear-cache').addEventListener('click', () => {
      this.clearCache();
    });

    document.getElementById('reset-settings').addEventListener('click', () => {
      this.resetSettings();
    });

    // Toast close buttons
    document.querySelectorAll('.toast-close').forEach(button => {
      button.addEventListener('click', (e) => {
        e.target.closest('.toast').classList.add('hidden');
      });
    });
  }

  populateForm() {
    // Populate form with current settings
    document.getElementById('api-url').value = this.settings.apiUrl;
    document.getElementById('auto-save').checked = this.settings.autoSave;
    document.getElementById('quick-save-enabled').checked = this.settings.quickSaveEnabled;
    document.getElementById('context-menu-enabled').checked = this.settings.contextMenuEnabled;
    document.getElementById('notifications-enabled').checked = this.settings.notificationsEnabled;
    document.getElementById('duplicate-warnings').checked = this.settings.duplicateWarnings;
  }

  checkWelcomeMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === 'true') {
      document.getElementById('welcome-section').classList.remove('hidden');
    }
  }

  hideWelcomeSection() {
    document.getElementById('welcome-section').classList.add('hidden');
  }

  showConnectedState() {
    document.getElementById('account-connected').classList.remove('hidden');
    document.getElementById('account-disconnected').classList.add('hidden');
    
    if (this.user) {
      document.getElementById('user-name').textContent = this.user.name || 'Connected User';
      document.getElementById('user-email').textContent = this.user.email;
    }
  }

  showDisconnectedState() {
    document.getElementById('account-connected').classList.add('hidden');
    document.getElementById('account-disconnected').classList.remove('hidden');
  }

  openAuthPage() {
    const authUrl = this.settings.apiUrl.replace('/api', '') + '/auth/login?extension=true';
    chrome.tabs.create({ url: authUrl });
  }

  openDashboard() {
    const dashboardUrl = this.settings.apiUrl.replace('/api', '') + '/dashboard';
    chrome.tabs.create({ url: dashboardUrl });
  }

  async disconnectAccount() {
    if (!confirm('Are you sure you want to disconnect your account? This will clear all stored authentication data.')) {
      return;
    }

    try {
      // Clear authentication data
      await chrome.storage.local.remove(['authToken', 'refreshToken', 'user']);
      
      // Reset state
      this.user = null;
      this.collections = [];
      
      // Update UI
      this.showDisconnectedState();
      this.populateCollectionSelect();
      
      this.showToast('Account disconnected successfully', 'success');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      this.showToast('Error disconnecting account', 'error');
    }
  }

  async updateContextMenus() {
    try {
      // Send message to background script to update context menus
      await chrome.runtime.sendMessage({
        action: 'updateContextMenus',
        enabled: this.settings.contextMenuEnabled
      });
    } catch (error) {
      console.error('Error updating context menus:', error);
    }
  }

  async exportExtensionData() {
    try {
      const data = await chrome.storage.local.get();
      
      // Remove sensitive data
      const exportData = {
        settings: data.settings,
        user: data.user ? {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email
        } : null,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookmarkhero-extension-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast('Extension data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('Error exporting data', 'error');
    }
  }

  async clearCache() {
    if (!confirm('Are you sure you want to clear the cache? This will remove stored authentication tokens and you will need to sign in again.')) {
      return;
    }

    try {
      // Clear all stored data except settings
      const settings = this.settings;
      await chrome.storage.local.clear();
      await chrome.storage.local.set({ settings });

      // Reset state
      this.user = null;
      this.collections = [];
      
      // Update UI
      this.showDisconnectedState();
      this.populateCollectionSelect();

      this.showToast('Cache cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.showToast('Error clearing cache', 'error');
    }
  }

  async resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      // Reset to default settings
      this.settings = {
        apiUrl: 'http://localhost:3001/api',
        autoSave: false,
        defaultCollection: null,
        quickSaveEnabled: true,
        contextMenuEnabled: true,
        notificationsEnabled: true,
        duplicateWarnings: true
      };

      await this.saveSettings();
      this.populateForm();
      this.populateCollectionSelect();

      this.showToast('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting settings:', error);
      this.showToast('Error resetting settings', 'error');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById(`${type}-toast`);
    const textElement = toast.querySelector('.toast-text');
    
    textElement.textContent = message;
    toast.classList.remove('hidden');

    // Auto-hide after 4 seconds
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookmarkHeroOptions();
});