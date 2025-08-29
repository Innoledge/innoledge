/**
 * Language Switcher Functionality
 * Handles language switching and URL mapping for multilingual site
 */

(function() {
  'use strict';

  // Language configuration
  const LANGUAGES = {
    'en': {
      code: 'en',
      name: 'English',
      flag: '/assets/images/flags/en.svg',
      display: 'EN'
    },
    'fr': {
      code: 'fr', 
      name: 'Français',
      flag: '/assets/images/flags/fr.svg',
      display: 'FR'
    },
    'zh': {
      code: 'zh',
      name: '中文',
      flag: '/assets/images/flags/zh.svg', 
      display: '中文'
    }
  };

  // Simple URL mapping - all languages use the same URL structure
  // No hardcoded mappings needed - we'll use pattern-based approach

  // Initialize language switcher when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initLanguageSwitcher();
    setCurrentLanguage();
    updateLanguageLinks();
  });

  /**
   * Initialize language switcher functionality
   */
  function initLanguageSwitcher() {
    const langToggle = document.querySelector('.lang-toggle');
    const langDropdown = document.querySelector('.lang-dropdown');
    
    if (!langToggle || !langDropdown) return;

    // Toggle dropdown on click
    langToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      
      // Close dropdown when clicking outside
      if (!isExpanded) {
        document.addEventListener('click', closeDropdown);
      }
    });

    // Handle keyboard navigation
    langToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.click();
        const firstOption = langDropdown.querySelector('.lang-option');
        if (firstOption) firstOption.focus();
      }
    });

    // Handle dropdown option navigation
    const langOptions = langDropdown.querySelectorAll('.lang-option');
    langOptions.forEach((option, index) => {
      option.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextOption = langOptions[index + 1] || langOptions[0];
          nextOption.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevOption = langOptions[index - 1] || langOptions[langOptions.length - 1];
          prevOption.focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown();
          langToggle.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    function closeDropdown() {
      langToggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', closeDropdown);
    }
  }

  /**
   * Detect and set current language based on URL
   */
  function setCurrentLanguage() {
    const currentPath = window.location.pathname;
    let currentLang = 'en'; // default

    // Handle GitHub Pages paths
    if (currentPath.startsWith('/innoledge/fr/')) {
      currentLang = 'fr';
    } else if (currentPath.startsWith('/innoledge/zh/')) {
      currentLang = 'zh';
    } else if (currentPath.startsWith('/innoledge/')) {
      currentLang = 'en';
    }
    // Handle local development paths
    else if (currentPath.startsWith('/fr/')) {
      currentLang = 'fr';
    } else if (currentPath.startsWith('/zh/')) {
      currentLang = 'zh';
    }

    // Update current language display
    const currentLangElement = document.querySelector('.current-lang');
    if (currentLangElement && LANGUAGES[currentLang]) {
      currentLangElement.textContent = LANGUAGES[currentLang].display;
    }

    // Update language options
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      const hreflang = option.getAttribute('hreflang');
      option.classList.toggle('current', hreflang === currentLang);
    });

    // Set document language
    document.documentElement.lang = currentLang;
  }

  /**
   * Update language links based on current page
   */
  function updateLanguageLinks() {
    const currentPath = window.location.pathname;
    const langOptions = document.querySelectorAll('.lang-option');

    langOptions.forEach(option => {
      const targetLang = option.getAttribute('hreflang');
      const mappedUrl = getTranslatedUrl(currentPath, targetLang);
      
      if (mappedUrl) {
        option.href = mappedUrl;
      }
    });
  }

  /**
   * Get translated URL for target language
   */
  function getTranslatedUrl(currentPath, targetLang) {
    // Normalize current path
    const normalizedPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
    
    // Get current language from path
    const currentLang = getCurrentLanguageFromPath(normalizedPath);
    
    if (currentLang === targetLang) {
      return normalizedPath; // Same language, return current path
    }

    // Construct URL based on pattern
    return constructTranslatedUrl(normalizedPath, currentLang, targetLang);
  }

  /**
   * Get current language from URL path
   */
  function getCurrentLanguageFromPath(path) {
    // Handle GitHub Pages paths
    if (path.startsWith('/innoledge/fr/')) return 'fr';
    if (path.startsWith('/innoledge/zh/')) return 'zh';
    if (path.startsWith('/innoledge/')) return 'en';
    
    // Handle local development paths
    if (path.startsWith('/fr/')) return 'fr';
    if (path.startsWith('/zh/')) return 'zh';
    return 'en';
  }

  /**
   * Construct translated URL using pattern-based approach
   */
  function constructTranslatedUrl(currentPath, currentLang, targetLang) {
    // Check if we're on GitHub Pages
    const isGitHubPages = currentPath.startsWith('/innoledge/');
    
    // Remove current language prefix to get the base path
    let basePath = currentPath;
    
    if (isGitHubPages) {
      // Handle GitHub Pages paths
      if (currentLang === 'fr' && basePath.startsWith('/innoledge/fr/')) {
        basePath = basePath.substring('/innoledge/fr'.length) || '/';
      } else if (currentLang === 'zh' && basePath.startsWith('/innoledge/zh/')) {
        basePath = basePath.substring('/innoledge/zh'.length) || '/';
      } else if (currentLang === 'en' && basePath.startsWith('/innoledge/')) {
        basePath = basePath.substring('/innoledge'.length) || '/';
      }
      
      // Add target language prefix for GitHub Pages
      if (targetLang === 'en') {
        return '/innoledge' + (basePath === '/' ? '/' : '/en' + basePath);
      } else {
        return '/innoledge/' + targetLang + (basePath === '/' ? '/' : basePath);
      }
    } else {
      // Handle local development paths
      if (currentLang === 'fr' && basePath.startsWith('/fr/')) {
        basePath = basePath.substring(3) || '/';
      } else if (currentLang === 'zh' && basePath.startsWith('/zh/')) {
        basePath = basePath.substring(3) || '/';
      } else if (currentLang === 'en' && basePath.startsWith('/en/')) {
        basePath = basePath.substring(3) || '/';
      }

      // Add target language prefix for local development
      if (targetLang === 'en') {
        return basePath === '/' ? '/' : '/en' + basePath;
      } else {
        return '/' + targetLang + (basePath === '/' ? '/' : basePath);
      }
    }
  }

  /**
   * Store user's language preference
   */
  function storeLanguagePreference(lang) {
    try {
      localStorage.setItem('innoledge_preferred_language', lang);
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Get user's stored language preference
   */
  function getStoredLanguagePreference() {
    try {
      return localStorage.getItem('innoledge_preferred_language');
    } catch (e) {
      return null;
    }
  }

  /**
   * Auto-redirect based on browser language (optional)
   */
  function autoRedirectBasedOnBrowserLanguage() {
    // Only redirect on homepage and if no stored preference
    const currentPath = window.location.pathname;
    const isHomepage = currentPath === '/' || currentPath === '/innoledge/';
    
    if (!isHomepage || getStoredLanguagePreference()) {
      return;
    }

    const browserLang = navigator.language || navigator.languages[0];
    let targetLang = 'en'; // default

    if (browserLang.startsWith('fr')) {
      targetLang = 'fr';
    } else if (browserLang.startsWith('zh')) {
      targetLang = 'zh';
    }

    if (targetLang !== 'en') {
      const targetUrl = getTranslatedUrl(currentPath, targetLang);
      if (targetUrl && targetUrl !== currentPath) {
        window.location.href = targetUrl;
      }
    }
  }

  // Language switcher click handlers
  document.addEventListener('click', function(e) {
    if (e.target.matches('.lang-option')) {
      const targetLang = e.target.getAttribute('hreflang');
      storeLanguagePreference(targetLang);
      
      // Analytics tracking (if implemented)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'language_switch', {
          'language': targetLang,
          'page_title': document.title
        });
      }
    }
  });

  // Expose utilities for external use
  window.LanguageSwitcher = {
    getCurrentLanguage: () => getCurrentLanguageFromPath(window.location.pathname),
    getTranslatedUrl,
    setCurrentLanguage,
    updateLanguageLinks,
    LANGUAGES
  };

})();