document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    const registerMessage = document.getElementById('registerMessage');
    const loginMessage = document.getElementById('loginMessage');

    // --- REGISTER FORM SUBMISSION (Corrected) ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        
        // This JSON body must match the fields in your `UserCreationRequest.java` DTO
        const requestBody = {
            username: username,
            password: password
            // Add other fields here if your DTO requires them (e.g., firstName, dob)
        };

        try {
            // Corrected URL: /api/register
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json(); // Always expect JSON from your backend

            if (!response.ok) {
                // If the server returned an error (4xx, 5xx), handle it
                throw new Error(data.message || 'Registration failed');
            }

            // Successfully registered
            registerMessage.textContent = 'User registered successfully!';
            registerMessage.style.color = 'green';
            registerForm.reset(); // Clear the form

        } catch (error) {
            registerMessage.textContent = error.message;
            registerMessage.style.color = 'red';
        }
    });
    
    // --- LOGIN FORM SUBMISSION (Corrected for JWT) ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        // This JSON body must match the fields in your `AuthenticationRequest.java` DTO
        const requestBody = {
            username: username,
            password: password
        };

        try {
            // Corrected URL: /auth/token
            const response = await fetch('/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json(); // Parse the ApiResponse JSON

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check credentials.');
            }

            // Navigate the JSON response to get the token
            // The path is `data.result.token` based on your `ApiResponse` structure
            const token = data.result.token;

            if (token) {
                loginMessage.textContent = 'Login successful!';
                loginMessage.style.color = 'green';
                
                // IMPORTANT: Save the JWT token to localStorage
                localStorage.setItem('jwtToken', token);
                localStorage.setItem('username', username); 

                // Redirect to the main chat page after a short delay
                setTimeout(() => {
                    window.location.href = '/index.html'; 
                }, 1000); // 1-second delay
                
            } else {
                throw new Error('Token not found in the server response.');
            }

        } catch (error) {
            loginMessage.textContent = error.message;
            loginMessage.style.color = 'red';
        }
    });
});