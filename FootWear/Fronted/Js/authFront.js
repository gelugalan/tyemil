document.addEventListener('DOMContentLoaded', () => {
  const bookContainer = document.querySelector('.book-container');
  const togglePageLinks = document.querySelectorAll('.toggle-page');

  togglePageLinks.forEach(link => {
    link.addEventListener('click', () => {
      bookContainer.classList.toggle('flipped');
    });
  });

  // Login form submission
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const response = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    const message = document.getElementById('login-message');
    if (result.success) {
      message.style.color = 'green';
      message.textContent = 'Login successful!';
      localStorage.setItem('user', JSON.stringify(result.user));

      setTimeout(() => {
        if (result.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {  
          window.location.href = 'index.html';
        }
      }, 1000);
    } else {
      message.style.color = 'red';
      message.textContent = result.error || 'Login failed';
    }
  });

  // Register form submission
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm-password').value;
    const message = document.getElementById('register-message');
    if (password !== confirm) {
      message.style.color = 'red';
      message.textContent = 'Passwords do not match!';
      return;
    }
    const response = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password ,email}),
    });
    const result = await response.json();
    if (result.success) {
      message.style.color = 'green';
      message.textContent = 'Registration successful! You can now login.';
      setTimeout(() => {
        bookContainer.classList.remove('flipped');
      }, 1200);
    } else {
      message.style.color = 'red';
      message.textContent = result.error || 'Registration failed';
    }
  });
});