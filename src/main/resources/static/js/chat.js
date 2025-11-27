document.addEventListener('DOMContentLoaded', () => {
    // 1. Get username from local storage and check if logged in
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html'; // Redirect if not logged in
        return;
    }

    // 2. Get all necessary HTML elements
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results');
    const pendingRequestsList = document.getElementById('pending-requests-list');
    const friendsList = document.getElementById('friends-list');

    // Set username and handle logout
    usernameDisplay.textContent = username;
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    });
    
    // --- API HELPER FUNCTIONS ---

    // Fetches and displays the user's current friends
    const fetchAndDisplayFriends = async () => {
        const response = await fetch(`/api/friends/${username}/list`);
        const apiResponse = await response.json();
        friendsList.innerHTML = ''; // Clear current list
        if (apiResponse.result && apiResponse.result.length > 0) {
            apiResponse.result.forEach(friend => {
                const li = document.createElement('li');
                li.className = 'friend-item';
                li.textContent = friend;
                li.dataset.friendName = friend; // Store friend name for click events
                friendsList.appendChild(li);
            });
        } else {
            friendsList.innerHTML = '<li>No friends yet.</li>';
        }
    };
    
    // Fetches and displays pending friend requests
    const fetchAndDisplayPendingRequests = async () => {
        const response = await fetch(`/api/friends/${username}/pending`);
        const apiResponse = await response.json();
        pendingRequestsList.innerHTML = ''; // Clear current list
        if (apiResponse.result && apiResponse.result.length > 0) {
            apiResponse.result.forEach(request => {
                const li = document.createElement('li');
                li.className = 'request-item';
                li.innerHTML = `
                    <span>${request.userSendName}</span>
                    <div class="request-actions">
                        <button class="accept-btn" data-sender="${request.userSendName}">Accept</button>
                        <button class="reject-btn" data-sender="${request.userSendName}">Reject</button>
                    </div>
                `;
                pendingRequestsList.appendChild(li);
            });
        } else {
            pendingRequestsList.innerHTML = '<li>No pending requests.</li>';
        }
    };
    
    // Handles accepting or rejecting a friend request
    const handleRequestAction = async (sender, action) => {
        await fetch(`/api/friends/${action}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userSendName: sender,
                userReceivingName: username
            })
        });
        // Refresh both lists after action
        fetchAndDisplayFriends();
        fetchAndDisplayPendingRequests();
    };
    
    // Search for users to add as friends
    // **NOTE:** You need to create this endpoint on your backend!
    const searchUsers = async (query) => {
        if (!query) return;
        // This is a placeholder for the endpoint you need to create
        // For example: GET /api/users/search/{query}
        // const response = await fetch(`/api/users/search/${query}`);
        // const users = await response.json();
        
        // --- MOCKUP for demonstration ---
        const users = [{ username: query }]; // Replace with actual API call
        // --- END MOCKUP ---
        
        searchResultsContainer.innerHTML = ''; // Clear previous results
        users.forEach(user => {
            if (user.username !== username) { // Don't show yourself in search results
                 const div = document.createElement('div');
                 div.className = 'search-result-item';
                 div.innerHTML = `
                    <span>${user.username}</span>
                    <button class="send-request-btn" data-recipient="${user.username}">Send Request</button>
                 `;
                 searchResultsContainer.appendChild(div);
            }
        });
    };
    
    // Send a friend request
    const sendFriendRequest = async (recipient) => {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userSendName: username,
                userReceivingName: recipient
            })
        });
        const apiResponse = await response.json();
        alert(apiResponse.result ? "Friend request sent!" : "Failed to send request.");
        searchResultsContainer.innerHTML = ''; // Clear results after sending
    };

    // --- EVENT LISTENERS ---

    // Event listener for search button
    searchButton.addEventListener('click', () => {
        searchUsers(searchInput.value);
    });
    
    // Event listener for clicks inside the search results (for "Send Request" buttons)
    searchResultsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('send-request-btn')) {
            const recipient = event.target.dataset.recipient;
            sendFriendRequest(recipient);
        }
    });

    // Event listener for clicks on pending requests (Accept/Reject)
    pendingRequestsList.addEventListener('click', (event) => {
        const target = event.target;
        const sender = target.dataset.sender;
        if (target.classList.contains('accept-btn')) {
            handleRequestAction(sender, 'accept');
        } else if (target.classList.contains('reject-btn')) {
            handleRequestAction(sender, 'reject');
        }
    });
    
    // --- INITIALIZATION ---
    
    // Load friends and requests when the page loads
    fetchAndDisplayFriends();
    fetchAndDisplayPendingRequests();

    console.log('Chat page loaded successfully for user:', username);
});