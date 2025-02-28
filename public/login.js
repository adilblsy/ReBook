document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const invalidCredentialsDiv = document.getElementById('invalid-credentials');
    const togglePasswordIcon = document.getElementById('hide');

    // Toggle password visibility
    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordIcon.src = 'images/eye-open.webp';
            } else {
                passwordInput.type = 'password';
                togglePasswordIcon.src = 'images/eye-close.webp';
            }
        });
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        invalidCredentialsDiv.innerHTML = '';
        
        // Get form data
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Basic validation
        if (!email || !password) {
            displayErrorMessage("Please enter both email and password");
            return;
        }
        
        // Email validation
        if (!isValidEmail(email)) {
            displayErrorMessage("Please enter a valid email address");
            return;
        }
        
        try {
            // Send login request to API
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);

                // Store user details (including WhatsApp number)
                localStorage.setItem('user', JSON.stringify({
                    email: data.email,
                    name: data.name,
                    whatsapp: data.whatsapp // Ensure backend sends this
                }));

                // Redirect to home page
                window.location.href = 'home.html';
            } else {
                // Login failed
                displayErrorMessage(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error('Login error:', error);
            displayErrorMessage("Connection error. Please try again later.");
        }
    });
    
    // Helper function to display error messages
    function displayErrorMessage(message) {
        const errorElement = document.createElement('p');
        errorElement.id = 'invalid-msg';
        errorElement.textContent = message;
        invalidCredentialsDiv.appendChild(errorElement);
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
