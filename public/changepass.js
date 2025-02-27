// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const form = document.getElementById('changePassFrm');
    
    // Add submit event listener
    form.addEventListener('submit', async function(event) {
        // Prevent default form submission
        event.preventDefault();
        
        // Get input values
        const mobileNumber = document.getElementById('mobile-number').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        
        // Validate inputs (at least one field should be filled)
        if (!mobileNumber && !newPassword) {
            alert('Please fill at least one field to update');
            return;
        }
        
        // Get userId from localStorage (assuming it was stored during login)
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('You are not logged in. Please log in first.');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }
        
        // Create request data
        const requestData = {
            userId: userId
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success message
                alert(data.message || 'Details updated successfully');
                
                // Clear form fields
                form.reset();
                
                // Redirect to home page
                window.location.href = 'home.html';
            } else {
                // Show error message
                alert(data.message || 'Failed to update details');
            }
        } catch (error) {
            console.error('Error updating details:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});