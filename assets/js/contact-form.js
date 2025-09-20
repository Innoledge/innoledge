/**
 * Contact Form Handler - Simplified Formspree Implementation
 * Based on official Formspree documentation for reliable form submissions
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
      addHoneypotField(form);
    });
  }

  /**
   * Setup form event handlers
   */
  function setupFormHandlers(form) {
    form.addEventListener('submit', handleFormSubmit);

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
   * Handle form submission with hybrid approach
   * Try AJAX first, fallback to HTML submission if AJAX fails
   */
  async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const status = form.querySelector('.success-message') || form.querySelector('.error-message-general');

    // Check for spam
    if (isSpamSubmission(form)) {
      console.log('Spam submission detected, blocking');
      return;
    }

    // Validate form
    if (!validateContactForm(form)) {
      return;
    }

    // Show loading state
    setFormLoading(form, true);

    // Prepare form data - convert to URLSearchParams for Formspree compatibility
    const formData = new FormData(form);
    const urlParams = new URLSearchParams();

    // Convert FormData to URLSearchParams (handles files properly)
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        urlParams.append(key, value);
      } else {
        // Handle File objects (convert to filename)
        urlParams.append(key, value.name || value.toString());
      }
    }

    // Log form data for debugging
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form action:', form.action);
    console.log('Original FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: "${value}" (type: ${typeof value})`);
    }
    console.log('URLSearchParams data:', urlParams.toString());

    try {
      // Try AJAX submission first with proper URL-encoded format
      console.log('Attempting AJAX submission with URLSearchParams...');
      const response = await fetch(form.action, {
        method: form.method,
        body: urlParams.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        // AJAX Success
        console.log('✅ AJAX submission successful!');
        console.log('Response body:', await response.clone().text());
        showFormMessage(form, 'success', getSuccessMessage(form));
        showSuccessNotification(getSuccessMessage(form));
        form.reset();
        trackFormSubmission('success', 'AJAX');

        if (status) {
          status.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

      } else if (response.status === 400 || response.status === 403) {
        // AJAX blocked (likely free tier), fallback to HTML submission
        console.log('❌ AJAX submission blocked (status: ' + response.status + '), falling back to HTML submission');
        const errorText = await response.clone().text();
        console.log('Error response body:', errorText);
        setFormLoading(form, false);
        fallbackToHtmlSubmission(form);
        return;

      } else {
        // Other AJAX errors
        console.log('❌ AJAX submission failed with status:', response.status);
        const responseText = await response.clone().text();
        console.log('Error response body:', responseText);

        try {
          const data = await response.json();
          let errorMsg = getErrorMessage(form);
          if (data.errors) {
            errorMsg = data.errors.map(error => error.message).join(", ");
          }
          console.error('Parsed error response:', data);
          showFormMessage(form, 'error', errorMsg);
          showErrorNotification(errorMsg);
          trackFormSubmission('error', errorMsg);
        } catch (e) {
          console.log('Failed to parse error response, falling back to HTML submission');
          setFormLoading(form, false);
          fallbackToHtmlSubmission(form);
        }
      }

    } catch (error) {
      // Network error or AJAX completely blocked, fallback to HTML submission
      console.log('AJAX submission failed (' + error.message + '), falling back to HTML submission');
      setFormLoading(form, false);
      fallbackToHtmlSubmission(form);
      return;

    } finally {
      setFormLoading(form, false);
    }
  }

  /**
   * Fallback to standard HTML form submission
   */
  function fallbackToHtmlSubmission(form) {
    console.log('Executing HTML form submission fallback');

    // Remove the event listener temporarily to allow normal form submission
    form.removeEventListener('submit', handleFormSubmit);

    // Add a small delay to ensure the loading state is reset
    setTimeout(() => {
      // Create a new submit event without preventDefault
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

      // Revert to normal form submission behavior
      form.submit();

      // Re-add event listener for future submissions
      setTimeout(() => {
        form.addEventListener('submit', handleFormSubmit);
      }, 1000);

    }, 100);

    trackFormSubmission('fallback', 'HTML submission used');
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
      } else {
        // Basic validation if utils not available
        if (!field.value.trim()) {
          isValid = false;
          const errorElement = field.parentNode.querySelector('.error-message');
          if (errorElement) {
            errorElement.textContent = 'This field is required';
            errorElement.style.display = 'block';
          }
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