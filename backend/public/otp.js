document.addEventListener('DOMContentLoaded', function() {
  const verificationForm = document.getElementById('otpForm');
  const otpInput = document.getElementById('otp');
  const resendButton = document.getElementById('resendOtp');
  const messageDiv = document.getElementById('message');
  
  // Get email from storage
  const email = localStorage.getItem('pendingVerificationEmail');
  
  if (!email) {
    // No pending verification, redirect to register
    window.location.href = 'register.html';
    return;
  }
  
  // Display email being verified
  const emailDisplay = document.getElementById('verifyingEmail');
  if (emailDisplay) {
    emailDisplay.textContent = email;
  }
  
  // Handle OTP verification
  verificationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const otp = otpInput.value.trim();
    
    if (!otp) {
      showMessage('Please enter the verification code', 'error');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('Email verified successfully!', 'success');
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        localStorage.removeItem('pendingVerificationEmail');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1500);
      } else {
        showMessage(data.message || 'Verification failed', 'error');
      }
    } catch (error) {
      console.error('Verification error:', error);
      showMessage('Connection error. Please try again.', 'error');
    }
  });
  
  // Handle OTP resend
  if (resendButton) {
    resendButton.addEventListener('click', async function() {
      try {
        resendButton.disabled = true;
        
        const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          showMessage('Verification code resent!', 'success');
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
          showMessage(data.message || 'Failed to resend code', 'error');
          resendButton.disabled = false;
        }
      } catch (error) {
        console.error('Resend error:', error);
        showMessage('Connection error. Please try again.', 'error');
        resendButton.disabled = false;
      }
    });
  }
  
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
  }
});
