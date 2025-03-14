document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
  
      const email = document.getElementById("email").value.trim();
  
      if (!email) {
        showPopup("Error", "Please enter your email.");
        return;
      }
  
      // Add email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showPopup("Error", "Please enter a valid email address.");
        return;
      }
  
      try {
        // Show loading indicator
        const button = form.querySelector("button");
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Sending...";
  
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
        console.log("Server response:", result);
  
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
  
        if (response.ok) {
          showPopup("Success", result.message || "Reset link sent successfully. Please check your email.");
          setTimeout(() => {
            window.location.href = `forgot2.html?email=${encodeURIComponent(email)}`; // Redirect to OTP page
          }, 2000); // Redirect after 2 seconds
        } else {
          showPopup("Error", result.message || "Failed to send reset link. Please try again.");
        }
      } catch (error) {
        console.error("Error details:", error);
        showPopup("Error", "Something went wrong. Please try again later.");
  
        // Reset button state
        const button = form.querySelector("button");
        button.disabled = false;
        button.textContent = "Send";
      }
    });
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