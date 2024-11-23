document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
      showToast('Please fill in all fields');
      return;
    }
    
    // Make actual API call
    login(email, password);
});

async function login(email, password) {
    showToast('Logging in...');

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Login successful!');
            // Save the token in local storage
            localStorage.setItem('token', data.token);
            // Store authentication state
            localStorage.setItem('isAuthenticated', 'true');
            // Redirect to the dashboard
            window.location.href = 'employeeDashboard.html';
        } else {
            showToast(data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        showToast('An error occurred during login');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide toast after 8 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 8000);
}

// Get modal elements
const modal = document.getElementById('forgotPasswordModal');
const closeButton = document.querySelector('.close-button');
const forgotPasswordLink = document.querySelector('.forgot-password a');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Show modal when clicking "Forgot password?"
forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'block';
});

// Close modal when clicking the close button
closeButton.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle forgot password form submission
forgotPasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    
    showToast('Password reset link sent to your email');
    modal.style.display = 'none';
    
        console.log('Password reset requested for:', email);
});
