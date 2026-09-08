document.addEventListener('DOMContentLoaded', () => {
  const messages = {
    en: {success:'Thank you! Your message has been sent.', error:'Your message could not be sent. Please try again or email info@innoledge.com.'},
    fr: {success:'Merci ! Votre message a été envoyé.', error:'Votre message n’a pas pu être envoyé. Réessayez ou écrivez à info@innoledge.com.'},
    zh: {success:'谢谢！您的留言已发送。', error:'留言未能发送。请重试或发送邮件至 info@innoledge.com。'}
  };
  const language = document.documentElement.lang.split('-')[0];
  const text = messages[language] || messages.en;
  document.querySelectorAll('.contact-form').forEach(form => {
    let pending = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending || !form.reportValidity()) return;
      const data = new URLSearchParams(new FormData(form));
      const button = form.querySelector('[type="submit"]');
      const success = form.querySelector('.success-message');
      const error = form.querySelector('.error-message-general');
      success.style.display = error.style.display = 'none';
      pending = true; button.disabled = true; form.setAttribute('aria-busy','true');
      try {
        const response = await fetch(form.action, {method:'POST',body:data,headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error('Delivery failed');
        success.textContent = text.success; success.style.display='block'; form.reset();
      } catch {
        error.textContent = text.error; error.style.display='block';
      } finally {
        pending=false;button.disabled=false;form.removeAttribute('aria-busy');
      }
    });
  });
});
