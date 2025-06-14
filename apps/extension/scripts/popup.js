// BookmarkHero Extension Popup Script
class BookmarkHeroPopup {
  constructor() {
    this.apiBase = 'http://localhost:3001/api'; // TODO: Make configurable
    this.currentTab = null;
    this.user = null;
    this.collections = [];
    
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    await this.checkAuthentication();
    this.setupEventListeners();
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      if (tab) {
        document.getElementById('page-title').textContent = tab.title || 'Untitled';
        document.getElementById('page-url').textContent = tab.url || '';
        document.getElementById('bookmark-title').value = tab.title || '';
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  async checkAuthentication() {
    try {
      const result = await chrome.storage.local.get(['authToken', 'user']);
      
      if (result.authToken && result.user) {
        this.user = result.user;
        await this.loadCollections();
        this.showMainSection();
      } else {
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      this.showAuthSection();
    }
  }

  async loadCollections() {
    try {
      const result = await chrome.storage.local.get(['authToken']);
      const response = await fetch(`${this.apiBase}/collections`, {
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
    const select = document.getElementById('collection-select');
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">No collection</option>';
    
    this.collections.forEach(collection => {
      const option = document.createElement('option');
      option.value = collection.id;
      option.textContent = collection.name;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    // Authentication
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-link').addEventListener('click', (e) => this.handleRegisterLink(e));
    document.getElementById('forgot-link').addEventListener('click', (e) => this.handleForgotLink(e));
    
    // Main actions
    document.getElementById('bookmark-form').addEventListener('submit', (e) => this.handleSaveBookmark(e));
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
    document.getElementById('open-dashboard').addEventListener('click', () => this.openDashboard());
    document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
    
    // Success actions
    document.getElementById('save-another').addEventListener('click', () => this.showMainSection());
    document.getElementById('view-bookmark').addEventListener('click', () => this.openDashboard());
    
    // Error handling
    document.querySelector('.error-close').addEventListener('click', () => this.hideError());
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    
    this.setLoading(loginBtn, true);
    
    try {
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store auth data
        await chrome.storage.local.set({
          authToken: data.data.tokens.accessToken,
          refreshToken: data.data.tokens.refreshToken,
          user: data.data.user
        });
        
        this.user = data.data.user;
        await this.loadCollections();
        this.showMainSection();
      } else {
        this.showError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Connection error. Please try again.');
    } finally {
      this.setLoading(loginBtn, false);
    }
  }

  async handleSaveBookmark(e) {
    e.preventDefault();
    
    if (!this.currentTab) {
      this.showError('Unable to get current page information');
      return;
    }
    
    const saveBtn = document.getElementById('save-btn');
    this.setLoading(saveBtn, true);
    
    try {
      const formData = {
        url: this.currentTab.url,
        title: document.getElementById('bookmark-title').value || this.currentTab.title,
        description: document.getElementById('bookmark-description').value,
        collectionIds: document.getElementById('collection-select').value ? 
          [document.getElementById('collection-select').value] : [],
        tagIds: [], // TODO: Implement tag parsing
        isFavorite: document.getElementById('favorite-checkbox').checked
      };
      
      // Parse tags from input
      const tagsInput = document.getElementById('tags-input').value;
      if (tagsInput.trim()) {
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        // TODO: Create tags if they don't exist and get their IDs
      }
      
      const result = await chrome.storage.local.get(['authToken']);
      const response = await fetch(`${this.apiBase}/bookmarks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${result.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        this.showSuccessSection();
        
        // Reset form
        document.getElementById('bookmark-form').reset();
        document.getElementById('bookmark-title').value = this.currentTab.title || '';
      } else {
        this.showError(data.error || 'Failed to save bookmark');
      }
    } catch (error) {
      console.error('Save bookmark error:', error);
      this.showError('Connection error. Please try again.');
    } finally {
      this.setLoading(saveBtn, false);
    }
  }

  async handleLogout() {
    try {
      // Clear stored data
      await chrome.storage.local.clear();
      
      // Reset state
      this.user = null;
      this.collections = [];
      
      // Show auth section
      this.showAuthSection();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  handleRegisterLink(e) {
    e.preventDefault();
    chrome.tabs.create({ url: `${this.apiBase.replace('/api', '')}/register` });
  }

  handleForgotLink(e) {
    e.preventDefault();
    chrome.tabs.create({ url: `${this.apiBase.replace('/api', '')}/forgot-password` });
  }

  openDashboard() {
    chrome.tabs.create({ url: `${this.apiBase.replace('/api', '')}/dashboard` });
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  showAuthSection() {
    this.hideAllSections();
    document.getElementById('auth-section').classList.remove('hidden');
  }

  showMainSection() {
    this.hideAllSections();
    document.getElementById('main-section').classList.remove('hidden');
  }

  showSuccessSection() {
    this.hideAllSections();
    document.getElementById('success-section').classList.remove('hidden');
  }

  hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.add('hidden');
    });
  }

  setLoading(button, loading) {
    const spinner = button.querySelector('.spinner');
    const text = button.querySelector('.btn-text');
    
    if (loading) {
      button.disabled = true;
      spinner.classList.remove('hidden');
      text.style.opacity = '0';
    } else {
      button.disabled = false;
      spinner.classList.add('hidden');
      text.style.opacity = '1';
    }
  }

  showError(message) {
    const errorToast = document.getElementById('error-message');
    const errorText = errorToast.querySelector('.error-text');
    
    errorText.textContent = message;
    errorToast.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  hideError() {
    document.getElementById('error-message').classList.add('hidden');
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookmarkHeroPopup();
});