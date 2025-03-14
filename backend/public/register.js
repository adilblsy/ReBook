document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("number");
  const passwordInput = document.getElementById("password");

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const whatsapp = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !whatsapp || !password) {
      showCustomAlert("Error", "Please fill out all fields.");
      return;
    }

    if (password.length < 8) {
      showCustomAlert("Error", "Password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("pendingVerificationEmail", email);
        showCustomAlert("Success", "Registration successful. Please check your email for the OTP.");
        setTimeout(() => {
          window.location.href = "otp.html";
        }, 2000); // Redirect after 2 seconds
      } else {
        showCustomAlert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      showCustomAlert("Error", "Error connecting to the server.");
    }
  });
});