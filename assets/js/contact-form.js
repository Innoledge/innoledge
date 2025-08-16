/**
 * Contact Form Handler
 * Handles Formspree integration and form validation
 */

(function() {
  'use strict';

  // Form configuration
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/myzedzbl';
  
  // Initialize contact form when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
  });

  /**
   * Initialize contact form functionality
   */
  function initContactForm() {
    const contactForms = document.querySelectorAll('.contact-form');
    
    contactForms.forEach(form => {
      setupFormHandlers(form);
    });
  }

  /**
   * Setup form event handlers
   */
  function setupFormHandlers(form) {
    form.addEventListener('submit', handleFormSubmit);
    
    // Add validation attributes
    form.setAttribute('data-validate', 'true');
    
    // Setup real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (window.InnoledgeUtils && window.InnoledgeUtils.validateField) {
          window.InnoledgeUtils.validateField(this);
        }
      });
      
      input.addEventListener('input', function() {
        if (window.InnoledgeUtils && window.InnoledgeUtils.clearFieldError) {
          window.InnoledgeUtils.clearFieldError(this);
        }
      });
    });
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('.form-submit');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoading = submitButton.querySelector('.button-loading');
    const successMessage = form.querySelector('.success-message');
    const errorMessage = form.querySelector('.error-message-general');

    // Check for spam
    if (isSpamSubmission(form)) {
      console.log('Spam submission detected, blocking');
      return;
    }

    // Validate form
    if (!validateContactForm(form)) {
      return;
    }

    // Disable form and show loading state
    setFormLoading(form, true);
    
    try {
      // Prepare form data
      const formData = new FormData(form);
      
      // Add additional fields for Formspree
      formData.append('_subject', `New contact from innoledge-contact (${getLanguageFromForm(form)} version)`);
      
      // Submit to Formspree
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        showFormMessage(form, 'success', getSuccessMessage(form));
        showSuccessNotification(getSuccessMessage(form));
        form.reset();
        
        // Analytics tracking
        trackFormSubmission('success');
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
      } else {
        // Handle Formspree errors
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Unknown server error' };
        }
        
        console.error('Formspree Response Details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          data: errorData
        });
        
        const detailedError = `${errorData.error || 'Form submission failed'} (Status: ${response.status})`;
        throw new Error(detailedError);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      console.error('Form data being submitted:', Array.from(formData.entries()));
      console.error('Formspree endpoint:', FORMSPREE_ENDPOINT);
      
      // Show detailed error message in development
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let errorMessage;
      
      if (isDevelopment) {
        errorMessage = `${getErrorMessage(form)} (Debug: ${error.message})`;
      } else {
        // Show more helpful error messages
        if (error.message.includes('403')) {
          errorMessage = 'Form submission blocked. Please ensure you\'re visiting from the correct domain.';
        } else if (error.message.includes('422')) {
          errorMessage = 'Form validation failed. Please check all required fields.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many submissions. Please wait a moment and try again.';
        } else {
          errorMessage = getErrorMessage(form);
        }
      }
        
      showFormMessage(form, 'error', errorMessage);
      showErrorNotification(errorMessage);
      trackFormSubmission('error', error.message);
    } finally {
      setFormLoading(form, false);
    }
  }

  /**
   * Validate contact form
   */
  function validateContactForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (window.InnoledgeUtils && window.InnoledgeUtils.validateField) {
        if (!window.InnoledgeUtils.validateField(field)) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  /**
   * Set form loading state
   */
  function setFormLoading(form, isLoading) {
    const submitButton = form.querySelector('.form-submit');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoading = submitButton.querySelector('.button-loading');
    const inputs = form.querySelectorAll('input, textarea, button');

    // Disable/enable form elements
    inputs.forEach(input => {
      input.disabled = isLoading;
    });

    // Toggle button content
    if (buttonText && buttonLoading) {
      buttonText.style.display = isLoading ? 'none' : 'inline-flex';
      buttonLoading.style.display = isLoading ? 'inline-flex' : 'none';
    }

    // Add loading class to form
    form.classList.toggle('form-loading', isLoading);
  }

  /**
   * Show form message (success or error)
   */
  function showFormMessage(form, type, message) {
    const successElement = form.querySelector('.success-message');
    const errorElement = form.querySelector('.error-message-general');

    // Hide all messages first
    if (successElement) {
      successElement.style.display = 'none';
      successElement.textContent = '';
    }
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.textContent = '';
    }

    // Show appropriate message
    if (type === 'success' && successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
      successElement.setAttribute('role', 'status');
      successElement.focus();
    } else if (type === 'error' && errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      errorElement.setAttribute('role', 'alert');
      errorElement.focus();
    }
  }

  /**
   * Get language from form context
   */
  function getLanguageFromForm(form) {
    const htmlLang = document.documentElement.lang || 'en';
    const pathLang = window.location.pathname.split('/')[1];
    
    if (pathLang === 'fr') return 'French';
    if (pathLang === 'zh') return 'Chinese';
    return 'English';
  }

  /**
   * Get localized success message
   */
  function getSuccessMessage(form) {
    const lang = document.documentElement.lang || 'en';
    
    const messages = {
      'en': 'Thank you for your message! We will get back to you soon.',
      'fr': 'Merci pour votre message ! Nous vous répondrons bientôt.',
      'zh': '感谢您的留言！我们会尽快回复您。'
    };
    
    return messages[lang] || messages['en'];
  }

  /**
   * Get localized error message
   */
  function getErrorMessage(form) {
    const lang = document.documentElement.lang || 'en';
    
    const messages = {
      'en': 'There was an error sending your message. Please try again later.',
      'fr': 'Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer plus tard.',
      'zh': '发送消息时出错。请稍后重试。'
    };
    
    return messages[lang] || messages['en'];
  }

  /**
   * Track form submission for analytics
   */
  function trackFormSubmission(status, errorMessage = null) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        'form_name': 'contact_form',
        'form_status': status,
        'page_title': document.title,
        'page_location': window.location.href,
        'language': document.documentElement.lang || 'en'
      });
      
      if (status === 'error' && errorMessage) {
        gtag('event', 'exception', {
          'description': errorMessage,
          'fatal': false
        });
      }
    }

    // Custom analytics (if implemented)
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('Form Submitted', {
        formName: 'contact_form',
        status: status,
        language: document.documentElement.lang || 'en',
        error: errorMessage
      });
    }

    // Console logging for development
    console.log('Form submission tracked:', {
      status,
      language: document.documentElement.lang || 'en',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Honeypot spam protection
   */
  function addHoneypotField(form) {
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = '_gotcha';
    honeypot.style.display = 'none';
    honeypot.tabIndex = -1;
    honeypot.setAttribute('autocomplete', 'off');
    
    form.appendChild(honeypot);
  }

  /**
   * Prevent spam submissions
   */
  function isSpamSubmission(form) {
    const honeypot = form.querySelector('input[name="_gotcha"]');
    return honeypot && honeypot.value !== '';
  }

  // Initialize honeypot protection
  document.addEventListener('DOMContentLoaded', function() {
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach(addHoneypotField);
  });

  /**
   * Show prominent success notification
   */
  function showSuccessNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.success-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#28a745"/>
            <path d="M8 12l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="notification-message">
          <strong>Message Sent Successfully!</strong>
          <p>${message}</p>
        </div>
        <button class="notification-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Add close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.add('notification-hiding');
      setTimeout(() => notification.remove(), 300);
    });

    // Show notification with animation
    setTimeout(() => notification.classList.add('notification-visible'), 100);

    // Auto-hide after 7 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('notification-hiding');
        setTimeout(() => notification.remove(), 300);
      }
    }, 7000);

    // Focus for accessibility
    notification.focus();
  }

  /**
   * Show error notification
   */
  function showErrorNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.error-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#dc3545"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="notification-message">
          <strong>Message Failed to Send</strong>
          <p>${message}</p>
        </div>
        <button class="notification-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Add close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.add('notification-hiding');
      setTimeout(() => notification.remove(), 300);
    });

    // Show notification with animation
    setTimeout(() => notification.classList.add('notification-visible'), 100);

    // Auto-hide after 10 seconds (longer for errors)
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('notification-hiding');
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);

    // Focus for accessibility
    notification.focus();
  }

  // Expose utilities for external use
  window.ContactForm = {
    handleFormSubmit,
    validateContactForm,
    setFormLoading,
    showFormMessage,
    showSuccessNotification,
    trackFormSubmission
  };

})();