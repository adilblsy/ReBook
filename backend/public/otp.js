document.addEventListener('DOMContentLoaded', function () {
  const verificationForm = document.getElementById('otpForm');
  const otpInput = document.getElementById('otp');
  const resendButton = document.getElementById('resendOtp');

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

  // Get email from storage
  const email = localStorage.getItem('pendingVerificationEmail');

  if (!email) {
    // No pending verification, redirect to register
    showCustomAlert("Error", "No pending verification. Redirecting to register...");
    setTimeout(() => {
      window.location.href = 'register.html';
    }, 2000); // Redirect after 2 seconds
    return;
  }

  // Display email being verified
  const emailDisplay = document.getElementById('verifyingEmail');
  if (emailDisplay) {
    emailDisplay.textContent = email;
  }

  // Handle OTP verification
  verificationForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const otp = otpInput.value.trim();

    if (!otp) {
      showCustomAlert("Error", "Please enter the verification code");
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        showCustomAlert("Success", "Email verified successfully!");
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        localStorage.removeItem('pendingVerificationEmail');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 2000); // Redirect after 2 seconds
      } else {
        showCustomAlert("Error", data.message || "Verification failed");
      }
    } catch (error) {
      console.error('Verification error:', error);
      showCustomAlert("Error", "Connection error. Please try again.");
    }
  });

  // Handle OTP resend
  if (resendButton) {
    resendButton.addEventListener('click', async function () {
      try {
        resendButton.disabled = true;

        const response = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
          showCustomAlert("Success", "Verification code resent!");
          let countdown = 60;
          resendButton.textContent = `Resend (${countdown}s)`;
          const timer = setInterval(() => {
            countdown--;
            resendButton.textContent = `Resend (${countdown}s)`;
            if (countdown <= 0) {
              clearInterval(timer);
              resendButton.textContent = 'Resend Code';
              resendButton.disabled = false;
            }
          }, 1000);
        } else {
          showCustomAlert("Error", data.message || "Failed to resend code");
          resendButton.disabled = false;
        }
      } catch (error) {
        console.error('Resend error:', error);
        showCustomAlert("Error", "Connection error. Please try again.");
        resendButton.disabled = false;
      }
    });
  }
});