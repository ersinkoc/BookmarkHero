// BookmarkHero Extension Content Script
class BookmarkHeroContent {
  constructor() {
    this.isBookmarked = false;
    this.floatingButton = null;
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.checkIfCurrentPageBookmarked();
    this.setupFloatingButton();
    this.setupKeyboardListeners();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'getPageMetadata':
          sendResponse(this.extractPageMetadata());
          break;
        case 'highlightSelection':
          this.highlightSelectedText();
          break;
        case 'updateBookmarkStatus':
          this.updateBookmarkStatus(request.isBookmarked);
          break;
      }
    });
  }

  async checkIfCurrentPageBookmarked() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'checkBookmarkStatus',
        url: window.location.href
      });
      
      if (response.success) {
        this.updateBookmarkStatus(response.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  }

  setupFloatingButton() {
    // Create floating save button
    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'bookmarkhero-floating-btn';
    this.floatingButton.innerHTML = `
      <div class="bh-floating-button" title="Save to BookmarkHero">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
    `;

    // Add styles
    this.injectStyles();

    // Add click listener
    this.floatingButton.addEventListener('click', () => {
      this.handleQuickSave();
    });

    // Add to page
    document.body.appendChild(this.floatingButton);

    // Show/hide based on scroll
    this.setupScrollBehavior();
  }

  injectStyles() {
    if (document.getElementById('bookmarkhero-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'bookmarkhero-styles';
    styles.textContent = `
      #bookmarkhero-floating-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      #bookmarkhero-floating-btn.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .bh-floating-button {
        width: 50px;
        height: 50px;
        background: #3b82f6;
        color: white;
        border-radius: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }

      .bh-floating-button:hover {
        background: #2563eb;
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
      }

      .bh-floating-button.bookmarked {
        background: #10b981;
        border-color: #059669;
      }

      .bh-floating-button.bookmarked:hover {
        background: #059669;
      }

      .bh-floating-button.saving {
        background: #6b7280;
        cursor: not-allowed;
        animation: bh-pulse 1.5s infinite;
      }

      @keyframes bh-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      /* Selection highlight styles */
      .bh-highlight {
        background-color: rgba(59, 130, 246, 0.2) !important;
        border-radius: 2px;
        padding: 0 2px;
      }

      /* Toast notification */
      .bh-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: #1f2937;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000000;
        max-width: 300px;
        border-left: 4px solid #3b82f6;
        animation: bh-slide-in 0.3s ease;
      }

      .bh-toast.success {
        border-left-color: #10b981;
      }

      .bh-toast.error {
        border-left-color: #ef4444;
      }

      @keyframes bh-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        #bookmarkhero-floating-btn {
          bottom: 15px;
          right: 15px;
        }
        
        .bh-floating-button {
          width: 45px;
          height: 45px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  setupScrollBehavior() {
    let scrollTimeout;
    let isVisible = false;

    const showButton = () => {
      if (!isVisible) {
        this.floatingButton.classList.add('visible');
        isVisible = true;
      }
    };

    const hideButton = () => {
      if (isVisible) {
        this.floatingButton.classList.remove('visible');
        isVisible = false;
      }
    };

    // Show button after scrolling down a bit
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      
      if (window.scrollY > 100) {
        showButton();
        
        // Hide after no scrolling for 3 seconds
        scrollTimeout = setTimeout(() => {
          hideButton();
        }, 3000);
      } else {
        hideButton();
      }
    });

    // Show on mouse movement near the button area
    document.addEventListener('mousemove', (e) => {
      const buttonArea = {
        left: window.innerWidth - 100,
        top: window.innerHeight - 100,
        right: window.innerWidth,
        bottom: window.innerHeight
      };

      if (e.clientX > buttonArea.left && e.clientY > buttonArea.top) {
        showButton();
      }
    });
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+S (Cmd+Shift+S on Mac) for quick save
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.handleQuickSave();
      }
    });
  }

  async handleQuickSave() {
    if (this.isBookmarked) {
      this.showToast('Already bookmarked', 'This page is already in your bookmarks', 'success');
      return;
    }

    // Set saving state
    const button = this.floatingButton.querySelector('.bh-floating-button');
    button.classList.add('saving');

    try {
      const metadata = this.extractPageMetadata();
      
      const response = await chrome.runtime.sendMessage({
        action: 'saveBookmark',
        data: {
          url: window.location.href,
          title: metadata.title || document.title,
          description: metadata.description || this.getSelectedText(),
          favicon: metadata.favicon
        }
      });

      if (response.success) {
        this.updateBookmarkStatus(true);
        this.showToast('Bookmark saved!', 'Page saved to BookmarkHero', 'success');
      } else {
        throw new Error(response.error || 'Failed to save bookmark');
      }
    } catch (error) {
      console.error('Quick save error:', error);
      this.showToast('Save failed', error.message || 'Failed to save bookmark', 'error');
    } finally {
      // Remove saving state
      const button = this.floatingButton.querySelector('.bh-floating-button');
      button.classList.remove('saving');
    }
  }

  extractPageMetadata() {
    const getMetaContent = (name) => {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    const getFavicon = () => {
      const link = document.querySelector('link[rel*="icon"]');
      if (link) {
        return new URL(link.href, window.location.origin).href;
      }
      return `${window.location.origin}/favicon.ico`;
    };

    return {
      title: document.title,
      description: getMetaContent('description') || 
                  getMetaContent('og:description') || 
                  getMetaContent('twitter:description') ||
                  this.getFirstParagraph(),
      image: getMetaContent('og:image') || 
             getMetaContent('twitter:image'),
      siteName: getMetaContent('og:site_name') || 
                window.location.hostname,
      favicon: getFavicon(),
      url: window.location.href,
      domain: window.location.hostname,
      selectedText: this.getSelectedText()
    };
  }

  getFirstParagraph() {
    const paragraph = document.querySelector('p');
    if (paragraph && paragraph.textContent.length > 50) {
      return paragraph.textContent.substring(0, 200).trim() + '...';
    }
    return '';
  }

  getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
  }

  highlightSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'bh-highlight';
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // Fallback for complex selections
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
      
      selection.removeAllRanges();
    }
  }

  updateBookmarkStatus(isBookmarked) {
    this.isBookmarked = isBookmarked;
    
    const button = this.floatingButton?.querySelector('.bh-floating-button');
    if (button) {
      if (isBookmarked) {
        button.classList.add('bookmarked');
        button.title = 'Already bookmarked';
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      } else {
        button.classList.remove('bookmarked');
        button.title = 'Save to BookmarkHero';
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
    }
  }

  showToast(title, message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.bh-toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `bh-toast ${type}`;
    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 13px; opacity: 0.8;">${message}</div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'bh-slide-in 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BookmarkHeroContent();
  });
} else {
  new BookmarkHeroContent();
}