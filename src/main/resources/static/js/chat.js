document.addEventListener('DOMContentLoaded', () => {

    const fetchWithAuth = async (url, options = {}) => {
        const token = localStorage.getItem('jwtToken'); 

        if (!options.headers) {
            options.headers = {};
        }

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (options.body && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, options);

            if (response.status === 401 || response.status === 403) {
                console.warn('Authentication failed. Redirecting to login.');
                localStorage.removeItem('jwtToken'); 
                localStorage.removeItem('username'); 
                window.location.href = '/login.html';
                throw new Error('Unauthorized or Forbidden access');
            }

            return response;
        } catch (error) {
            console.error('Network error or fetch failed:', error);
            throw error;
        }
    };


    const username = localStorage.getItem('username');
    if (!username) {
        console.warn('No username found. Redirecting to login.');
        window.location.href = '/login.html'; 
        return;
    }


    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results');
    const pendingRequestsList = document.getElementById('pending-requests-list');
    const friendsList = document.getElementById('friends-list');

    const chatMessagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const stylePromptInput = document.getElementById('style-prompt-input');
    const saveStyleButton = document.getElementById('save-style-button');


    let currentChatFriend = null; 
    let stompClient = null;


    usernameDisplay.textContent = username;
    logoutButton.addEventListener('click', () => {
        console.log('Logout button clicked. Clearing local storage and redirecting.');
        localStorage.removeItem('jwtToken'); 
        localStorage.removeItem('username'); 
        if (stompClient && stompClient.connected) {
            stompClient.disconnect(() => console.log('WebSocket disconnected on logout.'));
        }
        window.location.href = '/login.html';
    });


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
            friendsList.innerHTML = ''; 

            if (apiResponse.result && apiResponse.result.length > 0) {
                apiResponse.result.forEach(friend => {
                    const li = document.createElement('li');
                    li.className = 'friend-item';
                    li.textContent = friend;
                    li.dataset.friendName = friend; 
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
            pendingRequestsList.innerHTML = ''; 

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

            fetchAndDisplayFriends();
            fetchAndDisplayPendingRequests();
        } catch (error) {
            console.error(`Error handling request action ${action}:`, error);
            alert(`Network error or failed to ${action} request.`);
        }
    };

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
            const apiResponse = await response.json(); 
            const users = apiResponse.result; 
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
                searchResultsContainer.innerHTML = '';
            } else {
                alert("Failed to send friend request. (Check if already sent/friend)");
            }

        } catch (error) {
            console.error('Error in sendFriendRequest:', error);
            alert('Network error or failed to send friend request.');
        }
    };

    const fetchAndDisplayStylePrompt = async () => {
        console.log(`Fetching style prompt for ${username}...`);
        try {
            const response = await fetchWithAuth(`/api/users/${username}/style`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch style prompt. Status: ${response.status}, Error: ${errorText}`);
                stylePromptInput.value = 'Error loading style.';
                return;
            }
            const apiResponse = await response.json(); 
            if (apiResponse.result && apiResponse.result.stylePrompt) {
                stylePromptInput.value = apiResponse.result.stylePrompt;
            } else {
                stylePromptInput.value = ''; 
            }
        } catch (error) {
            console.error('Error in fetchAndDisplayStylePrompt:', error);
            stylePromptInput.value = 'Network error.';
        }
    };

    const saveStylePrompt = async () => {
        const newStyle = stylePromptInput.value.trim();
        console.log(`Saving style prompt for ${username}: ${newStyle}`);
        try {
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
        } catch (error) {
            console.error('Error in saveStylePrompt:', error);
            alert('Network error or failed to save style.');
        }
    };


    const connectWebSocket = () => {
        if (stompClient && stompClient.connected) {
            console.log('WebSocket already connected.');
            return;
        }

        console.log('Attempting to connect WebSocket...');
        const socket = new SockJS('/ws-chat'); 
        stompClient = Stomp.over(socket);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        };

        stompClient.connect(headers, onConnected, onError);
    };

    const onConnected = () => {
        console.log('Connected to WebSocket!');
        stompClient.subscribe(`/topic/public/${username}`, onMessageReceived);
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
        if (currentChatFriend && (message.fromUser === currentChatFriend && message.fromUser === username)) {
            displayMessage(message);
        } else if (message.fromUser !== username) {
            console.log(`New message from ${message.fromUser} (not current chat).`);
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

        console.log('Displaying message:', message.fromUser, message.content);
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
            
            stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
            console.log('Sent message:', chatMessage);
            messageInput.value = ''; 

            
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
        await fetchChatHistory(friendName);
        console.log(`Chat history loaded for ${username} with ${friendName}`);
        document.querySelectorAll('.friend-item').forEach(item => {
            item.classList.remove('selected-friend');
        });
        document.querySelector(`li[data-friend-name="${friendName}"]`).classList.add('selected-friend');
    };

    const fetchChatHistory = async (friendName) => {
        console.log(`Fetching chat history for ${username} with ${friendName}`);
        try {
            const response = await fetchWithAuth(`/api/chat/history?user1=${username}&user2=${friendName}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch chat history. Status: ${response.status}, Error: ${errorText}`);
                chatMessagesContainer.innerHTML += `<p class="system-message error">Error loading history: ${errorText}</p>`;
                return;
            }
            const apiResponse = await response.json(); 
            if (apiResponse.result && apiResponse.result.length > 0) {
                console.log('Displaying chat history messages');
                apiResponse.result.forEach(message => displayMessage(message));
            } else {
                chatMessagesContainer.innerHTML += `<p class="system-message">No chat history found.</p>`;
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            chatMessagesContainer.innerHTML += `<p class="system-message error">Network error loading history.</p>`;
        }
    };



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


    fetchAndDisplayFriends();
    fetchAndDisplayPendingRequests();
   // fetchAndDisplayStylePrompt(); 
    connectWebSocket(); 


    console.log('Chat page loaded successfully for user:', username);
});