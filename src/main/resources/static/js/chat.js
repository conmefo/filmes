// This function runs when the HTML page is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // 1. Get the security token and username from the browser's local storage
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');

    // 2. SECURITY CHECK: If there is no token, the user is not logged in.
    //    Redirect them immediately to the login page.
    if (!token) {
        window.location.href = '/login.html';
        return; // Stop running the rest of the script
    }

    // 3. Find the HTML elements we need to work with
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');

    // 4. Display the logged-in user's name on the page
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    // 5. Add a click event listener to the logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Logout button clicked'); // For debugging

            // Remove the stored token and username
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');

            // Redirect the user to the login page
            window.location.href = '/login.html';
        });
    }

    // We will add WebSocket code here later.
    console.log('Chat page loaded successfully for user:', username);
});