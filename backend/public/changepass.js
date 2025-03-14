// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get the form element
    const form = document.getElementById('changePassFrm');
  
    // Add submit event listener
    form.addEventListener('submit', async function (event) {
      // Prevent default form submission
      event.preventDefault();
  
      // Get input values
      const mobileNumber = document.getElementById('mobile-number').value.trim();
      const newPassword = document.getElementById('new-password').value.trim();
  
      // Validate inputs (at least one field should be filled)
      if (!mobileNumber && !newPassword) {
        showPopup('Error', 'Please fill at least one field to update');
        return;
      }
  
      // Get userId from localStorage (assuming it was stored during login)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showPopup('Error', 'You are not logged in. Please log in first.');
        setTimeout(() => {
          window.location.href = 'login.html'; // Redirect to login page
        }, 2000); // Redirect after 2 seconds
        return;
      }
  
      // Create request data
      const requestData = {
        userId: userId,
      };
  
      // Add fields to request data if they exist
      if (mobileNumber) {
        requestData.mobileNumber = mobileNumber;
      }
  
      if (newPassword) {
        requestData.newPassword = newPassword;
      }
  
      try {
        // Send request to update details
        const response = await fetch('/api/auth/update-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include auth token
          },
          body: JSON.stringify(requestData),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Show success message
          showPopup('Success', data.message || 'Details updated successfully');
  
          // Clear form fields
          form.reset();
  
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            window.location.href = 'home.html';
          }, 2000);
        } else {
          // Show error message
          showPopup('Error', data.message || 'Failed to update details');
        }
      } catch (error) {
        console.error('Error updating details:', error);
        showPopup('Error', 'An error occurred. Please try again later.');
      }
    });
  });
  
  // Function to create and show a custom popup
  function showPopup(title, message) {
    // Check if a popup already exists
    let popup = document.getElementById('customPopup');
    if (!popup) {
      // Create the popup container
      popup = document.createElement('div');
      popup.id = 'customPopup';
      popup.className = 'popup-modal';
  
      // Create the popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'popup-content';
  
      // Create the title
      const popupTitle = document.createElement('h2');
      popupTitle.id = 'popupTitle';
      popupTitle.textContent = title;
  
      // Create the message
      const popupMessage = document.createElement('p');
      popupMessage.id = 'popupMessage';
      popupMessage.textContent = message;
  
      // Create the close button
      const closeBtn = document.createElement('span');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
  
      // Create the confirm button
      const confirmBtn = document.createElement('button');
      confirmBtn.id = 'popupConfirmBtn';
      confirmBtn.textContent = 'OK';
  
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
      closeBtn.addEventListener('click', () => hidePopup(popup));
      confirmBtn.addEventListener('click', () => hidePopup(popup));
  
      // Close the popup if the user clicks outside the modal
      window.addEventListener('click', (event) => {
        if (event.target === popup) {
          hidePopup(popup);
        }
      });
    } else {
      // Update the existing popup content
      document.getElementById('popupTitle').textContent = title;
      document.getElementById('popupMessage').textContent = message;
    }
  
    // Show the popup
    popup.style.display = 'flex';
  }
  
  // Function to hide the popup
  function hidePopup(popup) {
    popup.style.display = 'none';
  }