/**
 * Innoledge.com2 - Main JavaScript
 * Core functionality for the static site
 */

(function() {
  'use strict';

  // DOM Ready function
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  // Initialize all functionality when DOM is ready
  ready(function() {
    initMobileMenu();
    initSmoothScrolling();
    initAccessibility();
    initFormValidation();
    initLazyLoading();
    initSourcingTabs();
  });

  /**
   * Mobile Menu Functionality
   */
  function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Toggle aria-expanded
      this.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle menu visibility
      navMenu.classList.toggle('mobile-menu-open');
      
      // Toggle hamburger animation
      this.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      document.body.classList.toggle('menu-open', !isExpanded);
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-menu-open')) {
        mobileToggle.click();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileToggle.contains(e.target) && 
          !navMenu.contains(e.target) && 
          navMenu.classList.contains('mobile-menu-open')) {
        mobileToggle.click();
      }
    });
  }

  /**
   * Smooth Scrolling for Anchor Links
   */
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just '#'
        if (href === '#') return;
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          // Calculate offset for fixed header
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update focus for accessibility
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /**
   * Accessibility Enhancements
   */
  function initAccessibility() {
    // Add focus-visible polyfill behavior
    function handleFirstTab(e) {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }

    window.addEventListener('keydown', handleFirstTab);

    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link visually-hidden';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('focus', function() {
      this.classList.remove('visually-hidden');
    });
    skipLink.addEventListener('blur', function() {
      this.classList.add('visually-hidden');
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Announce page changes for screen readers
    announcePageChange();
  }

  /**
   * Announce page changes to screen readers
   */
  function announcePageChange() {
    const pageTitle = document.title;
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = `Page loaded: ${pageTitle}`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Form Validation
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        if (!validateForm(this)) {
          e.preventDefault();
        }
      });

      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          validateField(this);
        });
        
        input.addEventListener('input', function() {
          clearFieldError(this);
        });
      });
    });
  }

  /**
   * Validate individual form field
   */
  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (required && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    }
    // Email validation
    else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }
    // Phone validation (basic)
    else if (type === 'tel' && value) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number.';
      }
    }

    showFieldError(field, isValid ? '' : errorMessage);
    return isValid;
  }

  /**
   * Validate entire form
   */
  function validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Show field error message
   */
  function showFieldError(field, message) {
    const errorElement = field.parentNode.querySelector('.error-message');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }

    // Add/remove error class
    field.classList.toggle('error', !!message);
    field.setAttribute('aria-invalid', !!message);
  }

  /**
   * Clear field error
   */
  function clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.error-message');
    
    if (errorElement && field.value.trim()) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');
    }
  }

  /**
   * Lazy Loading for Images
   */
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Utility Functions
   */
  
  // Debounce function for performance
  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  }

  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Sourcing Page Tabs Functionality
   */
  function initSourcingTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabImages = document.querySelectorAll('.tab-image');
    const singleImage = document.querySelector('.single-image');
    
    console.log('Tab images found:', tabImages.length, 'Images:', tabImages);
    tabImages.forEach(img => console.log('Tab image ID:', img.id));
    
    if (!tabButtons.length || !tabContents.length) return;

    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // Remove active class from all buttons, contents, and images
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabImages.forEach(image => image.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Show corresponding content
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('active');
        }
        
        // Show corresponding image
        const targetImage = document.getElementById(targetTab + '-image');
        console.log('Looking for image with id:', targetTab + '-image', 'Found:', targetImage);
        if (targetImage) {
          // Hide the default single image when a tab image is shown
          if (singleImage) {
            singleImage.style.display = 'none';
          }
          targetImage.classList.add('active');
          console.log('Activated image:', targetImage);
        } else {
          // Show the default single image if no tab-specific image
          if (singleImage) {
            singleImage.style.display = 'block';
          }
        }
      });
    });
  }

  // Expose utilities globally if needed
  window.InnoledgeUtils = {
    debounce,
    throttle,
    validateField,
    showFieldError,
    clearFieldError
  };

})();