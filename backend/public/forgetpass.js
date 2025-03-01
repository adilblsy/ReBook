document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        // Add email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
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
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email }),
                credentials: "include"
            });

            const result = await response.json();
            console.log("Server response:", result);

            // Reset button state
            button.disabled = false;
            button.textContent = originalText;

            if (response.ok) {
                alert(result.message || "Reset link sent successfully. Please check your email.");
                window.location.href = `forgot2.html?email=${encodeURIComponent(email)}`; // Redirect to OTP page
            } else {
                alert(result.message || "Failed to send reset link. Please try again.");
            }
        } catch (error) {
            console.error("Error details:", error);
            alert("Something went wrong. Please try again later.");
            
            // Reset button state
            const button = form.querySelector("button");
            button.disabled = false;
            button.textContent = "Send";
        }
    });
});