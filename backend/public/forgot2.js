document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  if (!email) {
    showPopup("Error", "Invalid access. Please go back and enter your email.");
    setTimeout(() => {
      window.location.href = "forgotpass.html"; // Redirect back
    }, 2000); // Redirect after 2 seconds
    return;
  }

  // Display the email partially masked for security
  const emailParts = email.split("@");
  const username = emailParts[0];
  const maskedUsername = username.substring(0, 2) + "***" + username.substring(username.length - 2);
  const domain = emailParts[1];

  // Update the text if there's an element to display it
  const otpText = document.querySelector(".otp-gone");
  if (otpText) {
    otpText.innerHTML = `An OTP has been sent to<br>${maskedUsername}@${domain}`;
  }

  const form = document.querySelector("form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const otp = document.getElementById("otp").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();

    if (!otp || !newPassword) {
      showPopup("Error", "Please fill in all fields.");
      return;
    }

    // Add password validation
    if (newPassword.length < 8) {
      showPopup("Error", "Password must be at least 8 characters long.");
      return;
    }

    // Show loading indicator
    const button = form.querySelector("button");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Processing...";

    try {
      // CHANGED THE ENDPOINT TO MATCH THE BACKEND ROUTE
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
        credentials: "include",
      });

      // Reset button state
      button.disabled = false;
      button.textContent = originalText;

      const result = await response.json();
      console.log("Server Response:", result);

      if (response.ok) {
        showPopup("Success", result.message || "Password reset successful!");
        setTimeout(() => {
          window.location.href = "index.html"; // Redirect to login page
        }, 2000); // Redirect after 2 seconds
      } else {
        showPopup("Error", result.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Error details:", error);
      showPopup("Error", "Something went wrong. Please try again later.");

      // Reset button state
      button.disabled = false;
      button.textContent = "Change";
    }
  });

  // Resend OTP functionality
  const resendLink = document.querySelector(".resend");
  if (resendLink) {
    resendLink.addEventListener("click", async function (event) {
      event.preventDefault();

      // Disable the resend link temporarily
      resendLink.style.pointerEvents = "none";
      resendLink.style.opacity = "0.5";
      resendLink.textContent = "Sending...";

      try {
        // CHANGED THE ENDPOINT TO MATCH THE BACKEND ROUTE
        const response = await fetch("/api/auth/send-reset-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          showPopup("Success", result.message || "OTP resent successfully!");
        } else {
          showPopup("Error", result.message || "Failed to resend OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error details:", error);
        showPopup("Error", "Something went wrong. Please try again.");
      } finally {
        // Re-enable the resend link after 30 seconds (prevent spam)
        setTimeout(() => {
          resendLink.style.pointerEvents = "auto";
          resendLink.style.opacity = "1";
          resendLink.textContent = "Resend";
        }, 30000);
      }
    });
  }
});

// Function to create and show a custom popup
function showPopup(title, message) {
  // Check if a popup already exists
  let popup = document.getElementById("customPopup");
  if (!popup) {
    // Create the popup container
    popup = document.createElement("div");
    popup.id = "customPopup";
    popup.className = "popup-modal";

    // Create the popup content
    const popupContent = document.createElement("div");
    popupContent.className = "popup-content";

    // Create the title
    const popupTitle = document.createElement("h2");
    popupTitle.id = "popupTitle";
    popupTitle.textContent = title;

    // Create the message
    const popupMessage = document.createElement("p");
    popupMessage.id = "popupMessage";
    popupMessage.textContent = message;

    // Create the close button
    const closeBtn = document.createElement("span");
    closeBtn.className = "close-btn";
    closeBtn.innerHTML = "&times;";

    // Create the confirm button
    const confirmBtn = document.createElement("button");
    confirmBtn.id = "popupConfirmBtn";
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

    // Add event listeners for closing the popup
    closeBtn.addEventListener("click", () => hidePopup(popup));
    confirmBtn.addEventListener("click", () => hidePopup(popup));

    // Close the popup if the user clicks outside the modal
    window.addEventListener("click", (event) => {
      if (event.target === popup) {
        hidePopup(popup);
      }
    });
  } else {
    // Update the existing popup content
    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupMessage").textContent = message;
  }

  // Show the popup
  popup.style.display = "flex";
}

// Function to hide the popup
function hidePopup(popup) {
  popup.style.display = "none";
}