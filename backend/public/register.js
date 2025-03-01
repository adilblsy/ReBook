document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("number");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const whatsapp = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !whatsapp || !password) {
      alert("Please fill out all fields.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
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
