// /public/js/form-handler.js

document.addEventListener('submit', async (e) => {
  // Only intercept forms that have the 'data-ajax' attribute
  const form = e.target;
  if (!form.hasAttribute('data-ajax')) return;

  e.preventDefault();

  const url = form.getAttribute('action') || window.location.pathname;
  const method = form.getAttribute('method') || 'POST';
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // 1. Clear all existing errors in this form
  form.querySelectorAll('.error-msg').forEach(span => span.innerText = '');

  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 400 && Array.isArray(result.message)) {
        
        // 2. Loop through errors sent by NestJS
        result.message.forEach(errorString => {
          // Dynamically match field name from the NestJS DTO error message
          // Example: "Phone number is invalid" matches the input name="phone"
          const matchedInput = Array.from(form.elements).find(input => {
            return input.name && errorString.toLowerCase().includes(input.name.toLowerCase());
          });

          if (matchedInput) {
            const errorSpan = form.querySelector(`#${matchedInput.name}Error`);
            if (errorSpan) {
              errorSpan.innerText = errorString;
            }
          }
        });

      } else {
        alert(result.message || 'An error occurred');
      }
    } else {
      alert('Action completed successfully!');
      if (form.hasAttribute('data-redirect')) {
        window.location.href = form.getAttribute('data-redirect');
      }
    }
  } catch (error) {
    console.error('Submission error:', error);
  }
});