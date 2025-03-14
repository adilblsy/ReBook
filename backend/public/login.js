document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('hide');
  
    // Dynamically create the custom alert popup
    const popup = document.createElement("div");
    popup.id = "customAlertPopup";
    popup.className = "popup-modal";
  
    const popupContent = document.createElement("div");
    popupContent.className = "popup-content";
  
    const closeBtn = document.createElement("span");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = "&times;";
  
    const popupTitle = document.createElement("h2");
    popupTitle.id = "customAlertTitle";
  
    const popupMessage = document.createElement("p");
    popupMessage.id = "customAlertMessage";
  
    const confirmBtn = document.createElement("button");
    confirmBtn.id = "customAlertConfirmBtn";
    confirmBtn.textContent = "OK";
  
    // Append elements to the popup content
    popupContent.appendChild(closeBtn);
    popupContent.appendChild(popupTitle);
    popupContent.appendChild(popupMessage);
    popupContent.appendChild(confirmBtn);
  
    // Append the popup content to the popup container
    popup.appendChild(popupContent);
  
    // Append the popup to the body
    document.body.appendChild(popup);
  
    // Function to show the custom alert popup
    function showCustomAlert(title, message) {
      popupTitle.textContent = title;
      popupMessage.textContent = message;
      popup.style.display = "flex";
    }
  
    // Function to hide the custom alert popup
    function hideCustomAlert() {
      popup.style.display = "none";
    }
  
    // Event listeners for closing the popup
    closeBtn.addEventListener("click", hideCustomAlert);
    confirmBtn.addEventListener("click", hideCustomAlert);
  
    // Close the popup if the user clicks outside the modal
    window.addEventListener("click", (event) => {
      if (event.target === popup) {
        hideCustomAlert();
      }
    });
  
    // Toggle password visibility
    if (togglePasswordIcon) {
      togglePasswordIcon.addEventListener('click', function () {
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
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      // Get form data
      const email = emailInput.value.trim();
      const password = passwordInput.value;
  
      // Basic validation
      if (!email || !password) {
        showCustomAlert("Error", "Please enter credentials");
        return;
      }
  
      // Email validation
      if (!isValidEmail(email)) {
        showCustomAlert("Error", "Please enter a valid email address");
        return;
      }
  
      try {
        // Send login request to API
        const response = await fetch('/api/auth/login', {
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
          showCustomAlert("Error", data.message || "Invalid credentials");
        }
      } catch (error) {
        console.error('Login error:', error);
        showCustomAlert("Error", "Connection error. Please try again later.");
      }
    });
  
    // Helper function to validate email format
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  });