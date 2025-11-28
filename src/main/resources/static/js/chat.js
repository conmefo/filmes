document.addEventListener('DOMContentLoaded', () => {

    // --- API HELPER FUNCTION (placed at the top for scope) ---
    // This function adds the JWT token to the Authorization header for protected API calls.
    const fetchWithAuth = async (url, options = {}) => {
        const token = localStorage.getItem('jwtToken'); // Get the JWT token from local storage

        // Initialize headers if not already present
        if (!options.headers) {
            options.headers = {};
        }

        // Add the Authorization header if a token exists
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        // Ensure Content-Type is set for requests with a body
        if (options.body && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, options);

            // If the server responds with 401 (Unauthorized) or 403 (Forbidden),
            // it means the token is invalid, expired, or missing on a protected route.
            // Redirect the user to the login page.
            if (response.status === 401 || response.status === 403) {
                console.warn('Authentication failed. Redirecting to login.');
                localStorage.removeItem('jwtToken'); // Clear invalid token
                localStorage.removeItem('username'); // Clear username
                window.location.href = '/login.html';
                // Important: Throw an error to stop further processing in the calling function
                throw new Error('Unauthorized or Forbidden access');
            }

            return response;
        } catch (error) {
            console.error('Network error or fetch failed:', error);
            // Re-throw the error so calling functions can handle it if needed
            throw error;
        }
    };


    // 1. Get username from local storage and check if logged in
    const username = localStorage.getItem('username');
    if (!username) {
        console.warn('No username found. Redirecting to login.');
        window.location.href = '/login.html'; // Redirect if not logged in
        return; // Stop further execution
    }

    // 2. Get all necessary HTML elements
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results');
    const pendingRequestsList = document.getElementById('pending-requests-list');
    const friendsList = document.getElementById('friends-list');

    // Chat related elements
    const chatMessagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const stylePromptInput = document.getElementById('style-prompt-input');
    const saveStyleButton = document.getElementById('save-style-button');


    // State variables for the chat
    let currentChatFriend = null; // Stores the username of the friend currently chatting with
    let stompClient = null; // WebSocket STOMP client


    // Set username display and handle logout
    usernameDisplay.textContent = username;
    logoutButton.addEventListener('click', () => {
        console.log('Logout button clicked. Clearing local storage and redirecting.');
        localStorage.removeItem('jwtToken'); // Clear the JWT token
        localStorage.removeItem('username'); // Clear the username
        // Disconnect WebSocket if connected
        if (stompClient && stompClient.connected) {
            stompClient.disconnect(() => console.log('WebSocket disconnected on logout.'));
        }
        window.location.href = '/login.html';
    });


    // --- API & DISPLAY FUNCTIONS ---

    // Fetches and displays the user's current friends
    const fetchAndDisplayFriends = async () => {
        console.log(`Fetching friend list for ${username}...`);
        try {
            const response = await fetchWithAuth(`/api/friends/${username}/list`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch friends. Status: ${response.status}, Error: ${errorText}`);
                friendsList.innerHTML = `<li>Error loading friends: ${errorText}</li>`;
                return;
            }
            const apiResponse = await response.json();
            friendsList.innerHTML = ''; // Clear current list

            if (apiResponse.result && apiResponse.result.length > 0) {
                apiResponse.result.forEach(friend => {
                    const li = document.createElement('li');
                    li.className = 'friend-item';
                    li.textContent = friend;
                    li.dataset.friendName = friend; // Store friend name for click events
                    li.addEventListener('click', () => startChatWithFriend(friend));
                    friendsList.appendChild(li);
                });
            } else {
                friendsList.innerHTML = '<li>No friends yet.</li>';
            }
        } catch (error) {
            console.error('Error in fetchAndDisplayFriends:', error);
            friendsList.innerHTML = '<li>Network error or failed to load friends.</li>';
        }
    };

    // Fetches and displays pending friend requests
    const fetchAndDisplayPendingRequests = async () => {
        console.log(`Fetching pending requests for ${username}...`);
        try {
            const response = await fetchWithAuth(`/api/friends/${username}/pending`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch pending requests. Status: ${response.status}, Error: ${errorText}`);
                pendingRequestsList.innerHTML = `<li>Error loading requests: ${errorText}</li>`;
                return;
            }
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
        } catch (error) {
            console.error('Error in fetchAndDisplayPendingRequests:', error);
            pendingRequestsList.innerHTML = '<li>Network error or failed to load requests.</li>';
        }
    };

    // Handles accepting or rejecting a friend request
    const handleRequestAction = async (sender, action) => {
        console.log(`Handling request action: ${action} from ${sender} by ${username}`);
        try {
            const response = await fetchWithAuth(`/api/friends/${action}`, {
                method: 'PUT',
                body: JSON.stringify({
                    userSendName: sender,
                    userReceivingName: username
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to ${action} request. Status: ${response.status}, Error: ${errorText}`);
                alert(`Failed to ${action} request: ${errorText}`);
                return;
            }
            const apiResponse = await response.json();
            console.log(`Request ${action} successful:`, apiResponse.result);
            alert(`Friend request ${action}ed successfully!`);

            // Refresh both lists after action
            fetchAndDisplayFriends();
            fetchAndDisplayPendingRequests();
        } catch (error) {
            console.error(`Error handling request action ${action}:`, error);
            alert(`Network error or failed to ${action} request.`);
        }
    };

    // Search for users to add as friends
    const searchUsers = async (query) => {
        if (!query.trim()) {
            searchResultsContainer.innerHTML = '';
            return;
        }
        console.log(`Searching for users with query: ${query}`);
        try {
            const response = await fetchWithAuth(
                `/api/users/search?query=${encodeURIComponent(query)}&requesterUsername=${encodeURIComponent(username)}`
            );
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to search users. Status: ${response.status}, Error: ${errorText}`);
                searchResultsContainer.innerHTML = `<div>Error searching: ${errorText}</div>`;
                return;
            }
            const apiResponse = await response.json(); // Assuming the backend returns an array of users
            const users = apiResponse.result; // ["cm102"]
            searchResultsContainer.innerHTML = '';
            if (users && users.length > 0) {
                users.forEach(u => {
                    if (u.username !== username) {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';

                        let actionHtml = '';

                        if (u.friendStatus === "NOT_FRIEND") {
                            actionHtml = `
                                <button class="send-request-btn" data-recipient="${u.username}">
                                    Send Request
                                </button>
                            `;
                        } else if (u.friendStatus === "PENDING") {
                            actionHtml = `<span class="status pending">Pending...</span>`;
                        } else if (u.friendStatus === "FRIEND") {
                            actionHtml = `<span class="status friend">Friend</span>`;
                        }

                        div.innerHTML = `
                            <span>${u.username}</span>
                            ${actionHtml}
                        `;

                        searchResultsContainer.appendChild(div);
                    }
                });


            } else {
                searchResultsContainer.innerHTML = '<div>No users found.</div>';
            }
        } catch (error) {
            console.error('Error in searchUsers:', error);
            searchResultsContainer.innerHTML = '<div>Network error or failed to search users.</div>';
        }
    };

    // Send a friend request
    const sendFriendRequest = async (recipient) => {
        console.log(`Sending friend request from ${username} to ${recipient}`);
        try {
            const response = await fetchWithAuth('/api/friends/request', {
                method: 'POST',
                body: JSON.stringify({
                    userSendName: username,
                    userReceivingName: recipient
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to send request. Status: ${response.status}, Error: ${errorText}`);
                alert(`Failed to send friend request: ${errorText}`);
                return;
            }
            const apiResponse = await response.json();
            if (apiResponse.result) {
                alert("Friend request sent!");
                searchResultsContainer.innerHTML = ''; // Clear results after sending
            } else {
                alert("Failed to send friend request. (Check if already sent/friend)");
            }

        } catch (error) {
            console.error('Error in sendFriendRequest:', error);
            alert('Network error or failed to send friend request.');
        }
    };

    // Fetches and displays the user's current AI style prompt
    const fetchAndDisplayStylePrompt = async () => {
        console.log(`Fetching style prompt for ${username}...`);
        try {
            // !!! IMPORTANT: You NEED to implement this backend endpoint !!!
            // Example: GET /api/users/${username}/style
            const response = await fetchWithAuth(`/api/users/${username}/style`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch style prompt. Status: ${response.status}, Error: ${errorText}`);
                stylePromptInput.value = 'Error loading style.';
                return;
            }
            const apiResponse = await response.json(); // Assuming { "stylePrompt": "..." }
            if (apiResponse.result && apiResponse.result.stylePrompt) {
                stylePromptInput.value = apiResponse.result.stylePrompt;
            } else {
                stylePromptInput.value = ''; // No style set yet
            }
        } catch (error) {
            console.error('Error in fetchAndDisplayStylePrompt:', error);
            stylePromptInput.value = 'Network error.';
        }
    };

    // Saves the user's AI style prompt
    const saveStylePrompt = async () => {
        const newStyle = stylePromptInput.value.trim();
        console.log(`Saving style prompt for ${username}: ${newStyle}`);
        try {
            // !!! IMPORTANT: You NEED to implement this backend endpoint !!!
            // Example: PUT /api/users/${username}/style
            const response = await fetchWithAuth(`/api/users/${username}/style`, {
                method: 'PUT',
                body: JSON.stringify({ stylePrompt: newStyle })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to save style prompt. Status: ${response.status}, Error: ${errorText}`);
                alert(`Failed to save style: ${errorText}`);
                return;
            }
            alert('AI style saved successfully!');
            // You might want to refresh current style or do other actions
        } catch (error) {
            console.error('Error in saveStylePrompt:', error);
            alert('Network error or failed to save style.');
        }
    };

    // --- WEBSOCKET CHAT FUNCTIONS ---

    const connectWebSocket = () => {
        if (stompClient && stompClient.connected) {
            console.log('WebSocket already connected.');
            return;
        }

        console.log('Attempting to connect WebSocket...');
        // Replace with your actual WebSocket endpoint
        const socket = new SockJS('/ws-chat'); // The endpoint you configured in Spring
        stompClient = Stomp.over(socket);

        // Pass the JWT token as a header during connection
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        };

        stompClient.connect(headers, onConnected, onError);
    };

    const onConnected = () => {
        console.log('Connected to WebSocket!');
        // Subscribe to a public topic for this user to receive direct messages
        stompClient.subscribe(`/topic/public/${username}`, onMessageReceived);

        // Enable chat input and send button
        messageInput.disabled = false;
        sendButton.disabled = false;
        chatMessagesContainer.innerHTML = '<p class="system-message">WebSocket connected. Select a friend to chat.</p>';
    };

    const onError = (error) => {
        console.error('Could not connect to WebSocket server:', error);
        chatMessagesContainer.innerHTML = '<p class="system-message error">Could not connect to chat. Please try again later.</p>';
        messageInput.disabled = true;
        sendButton.disabled = true;
    };

    const onMessageReceived = (payload) => {
        const message = JSON.parse(payload.body);
        console.log('Message received:', message);

        // Only display messages from the currently active chat friend
        if (currentChatFriend && (message.fromUser === currentChatFriend || message.toUser === currentChatFriend && message.fromUser === username)) {
            displayMessage(message);
        } else if (message.fromUser !== username) {
            // Optionally, show a notification for messages from other friends
            console.log(`New message from ${message.fromUser} (not current chat).`);
            // You could add a visual indicator next to the friend's name
        }
    };

    const displayMessage = (message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');

        const senderClass = message.fromUser === username ? 'message-sent' : 'message-received';
        messageElement.classList.add(senderClass);

        messageElement.innerHTML = `
            <span class="message-sender">${message.fromUser}:</span>
            <span class="message-content">${message.content}</span>
            <span class="message-time">${new Date(message.timestamp || Date.now()).toLocaleTimeString()}</span>
        `;
        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
    };

    const sendMessage = () => {
        const messageContent = messageInput.value.trim();
        if (messageContent && currentChatFriend) {
            const chatMessage = {
                fromUser: username,
                toUser: currentChatFriend,
                content: messageContent,
                timestamp: new Date().toISOString()
            };
            // Send to the Spring @MessageMapping endpoint
            stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
            messageInput.value = ''; // Clear input

            // Display your own message immediately without waiting for echo
            displayMessage(chatMessage);
        }
    };

    const startChatWithFriend = async (friendName) => {
        currentChatFriend = friendName;
        console.log(`Starting chat with: ${currentChatFriend}`);
        chatMessagesContainer.innerHTML = `<p class="system-message">Chatting with ${currentChatFriend}</p>`; // Clear previous chat
        messageInput.placeholder = `Type a message to ${currentChatFriend}...`;
        messageInput.disabled = false;
        sendButton.disabled = false;

        // Optionally, load chat history here
        await fetchChatHistory(friendName);

        // Highlight the selected friend in the list
        document.querySelectorAll('.friend-item').forEach(item => {
            item.classList.remove('selected-friend');
        });
        document.querySelector(`li[data-friend-name="${friendName}"]`).classList.add('selected-friend');
    };

    const fetchChatHistory = async (friendName) => {
        console.log(`Fetching chat history for ${username} with ${friendName}`);
        try {
            // !!! IMPORTANT: You NEED to implement this backend endpoint !!!
            // Example: GET /api/chat/history?user1={username}&user2={friendName}
            const response = await fetchWithAuth(`/api/chat/history?user1=${username}&user2=${friendName}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch chat history. Status: ${response.status}, Error: ${errorText}`);
                chatMessagesContainer.innerHTML += `<p class="system-message error">Error loading history: ${errorText}</p>`;
                return;
            }
            const apiResponse = await response.json(); // Assuming it returns a list of chat messages
            if (apiResponse.result && apiResponse.result.length > 0) {
                apiResponse.result.forEach(message => displayMessage(message));
            } else {
                chatMessagesContainer.innerHTML += `<p class="system-message">No chat history found.</p>`;
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            chatMessagesContainer.innerHTML += `<p class="system-message error">Network error loading history.</p>`;
        }
    };


    // --- EVENT LISTENERS ---

    searchButton.addEventListener('click', () => searchUsers(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchUsers(searchInput.value);
        }
    });

    searchResultsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('send-request-btn')) {
            const recipient = event.target.dataset.recipient;
            sendFriendRequest(recipient);
        }
    });

    pendingRequestsList.addEventListener('click', (event) => {
        const target = event.target;
        const sender = target.dataset.sender;
        if (target.classList.contains('accept-btn')) {
            handleRequestAction(sender, 'accept');
        } else if (target.classList.contains('reject-btn')) {
            handleRequestAction(sender, 'reject');
        }
    });

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    saveStyleButton.addEventListener('click', saveStylePrompt);


    // --- INITIALIZATION ---
    // These functions run when the page first loads
    fetchAndDisplayFriends();
    fetchAndDisplayPendingRequests();
    fetchAndDisplayStylePrompt(); // Load the user's current style
    connectWebSocket(); // Establish WebSocket connection


    console.log('Chat page loaded successfully for user:', username);
});