document.addEventListener("DOMContentLoaded", () => {
    // Use the form id from register.html (in your file it is "loginForm")
    const form = document.getElementById("loginForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("number");
    const passwordInput = document.getElementById("password");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!name || !email || !phone || !password) {
        alert("Please fill out all fields.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password })
        });
  
        const data = await response.json();
        if (response.ok) {
          // Save email for OTP verification and redirect to OTP page
          localStorage.setItem("pendingVerificationEmail", email);
          alert("Registration successful. Please check your email for the OTP.");
          window.location.href = "otp.html";
        } else {
          alert(data.message || "Registration failed.");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("Error connecting to the server.");
      }
    });
  });
  