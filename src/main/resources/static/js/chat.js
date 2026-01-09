document.addEventListener('DOMContentLoaded', () => {

    const fetchWithJwt = async (url, options = {}) => {
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
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('username');
                window.location.href = '/login.html';
                throw new Error('Unauthorized or Forbidden access');
            }

            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };


    const username = localStorage.getItem('username');
    if (!username) {
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
    let promptForFriend = "";

    usernameDisplay.textContent = username;

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        if (stompClient && stompClient.connected) {
            stompClient.disconnect();
        }
        window.location.href = '/login.html';
    });


    const fetchFriends = async () => {
        try {
            const response = await fetchWithJwt(`/api/friends/${username}/list`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(response.status, errorText);
                friendsList.innerHTML = `<li>Error loading friends: ${errorText}</li>`;
                return;
            }

            const apiResponse = await response.json();
            friendsList.innerHTML = '';

            if (apiResponse.result) {
                apiResponse.result.forEach(friend => {
                    const li = document.createElement('li');
                    li.className = 'friend-item';
                    li.textContent = friend;
                    li.dataset.friendName = friend;
                    li.addEventListener('click', () => startChatWithFriend(friend));
                    friendsList.appendChild(li);
                });
            } else {
                friendsList.innerHTML = '<li>No friends yet</li>';
            }
        } catch (error) {
            console.error(error);
            friendsList.innerHTML = '<li>Network error</li>';
        }
    };

    const fetchPending = async () => {
        try {
            const response = await fetchWithJwt(`/api/friends/${username}/pending`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(response.status, errorText);
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
                pendingRequestsList.innerHTML = '<li>No pending requests</li>';
            }
        } catch (error) {
            console.error(error);
            pendingRequestsList.innerHTML = '<li>Network error</li>';
        }
    };

    const handleRequest = async (sender, action) => {
        try {
            const response = await fetchWithJwt(`/api/friends/${action}`, {
                method: 'PUT',
                body: JSON.stringify({
                    userSendName: sender,
                    userReceivingName: username
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(response.status, errorText);
                return;
            }
            fetchFriends();
            fetchPending();
        } catch (error) {
            console.error(error);
        }
    };

    const searchUsers = async (query) => {
        if (!query.trim()) {
            searchResultsContainer.innerHTML = '';
            return;
        }
        try {
            const response = await fetchWithJwt(
                `/api/users/search?query=${encodeURIComponent(query)}&requesterUsername=${encodeURIComponent(username)}`
            );
            if (!response.ok) {
                const errorText = await response.text();
                console.error(errorText);
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
                            actionHtml = `<span class="status pending">Pending..</span>`;
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
                searchResultsContainer.innerHTML = '<div>No users found</div>';
            }
        } catch (error) {
            console.error(error);
            searchResultsContainer.innerHTML = '<div>Network errors</div>';
        }
    };

    const sendFriendRequest = async (recipient) => {
        try {
            const response = await fetchWithJwt('/api/friends/request', {
                method: 'POST',
                body: JSON.stringify({
                    userSendName: username,
                    userReceivingName: recipient
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(errorText);
                return;
            }
            const apiResponse = await response.json();
            if (apiResponse.result) {
                searchResultsContainer.innerHTML = '';
            }

        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyStylePrompt = async (friendName) => {
        try {
            const response = await fetchWithJwt(
                `/api/users/${encodeURIComponent(username)}/style?friend=${encodeURIComponent(friendName)}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(errorText);
                stylePromptInput.value = 'Error loading style';
                currentStylePrompt = "";
                return;
            }

            const apiResponse = await response.json();
            const prompt = apiResponse.result?.stylePrompt ?? "";

            currentStylePrompt = prompt;
            stylePromptInput.value = prompt;
        } catch (error) {
            console.error(error);
            stylePromptInput.value = 'Network error';
            currentStylePrompt = "";
        }
    };


    const saveStylePromptForFriend = async () => {
        if (!currentChatFriend) {
            return;
        }

        const newStyle = stylePromptInput.value.trim();

        try {
            const response = await fetchWithJwt(
                `/api/users/${encodeURIComponent(username)}/style?friend=${encodeURIComponent(currentChatFriend)}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ stylePrompt: newStyle })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(errorText);
                return;
            }

            currentStylePrompt = newStyle;
        } catch (error) {
            console.error(error);
        }
    };



    const connectWebSocket = () => {
        if (stompClient && stompClient.connected) {
            return;
        }

        const socket = new SockJS('/ws-chat');
        stompClient = Stomp.over(socket);

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        };

        stompClient.connect(headers, onConnected, onError);
    };

    const onConnected = () => {
        stompClient.subscribe(`/topic/public/${username}`, onMessageReceived);
        messageInput.disabled = false;
        sendButton.disabled = false;
        chatMessagesContainer.innerHTML = '<p class="system-message">WebSocket connected. Select a friend to chat</p>';
    };

    const onError = (error) => {
        console.error(error);
        chatMessagesContainer.innerHTML = '<p class="system-message error">Could not connect to chat. Please try again later</p>';
        messageInput.disabled = true;
        sendButton.disabled = true;
    };

    const onMessageReceived = (payload) => {
        const message = JSON.parse(payload.body);

        const isCurrentConversation =
            currentChatFriend &&
            (
                (message.fromUser === currentChatFriend && message.toUser === username) ||
                (message.fromUser === username && message.toUser === currentChatFriend)
            );

        if (isCurrentConversation) displayMessage(message);
    };


    const displayMessage = (message) => {
        const messageElement = document.createElement('p');
        messageElement.classList.add('chat-message');

        const senderClass = message.fromUser === username ? 'message-sent' : 'message-received';
        messageElement.classList.add(senderClass);

        messageElement.innerHTML = `
            <span class="message-content">${message.content}</span>
        `;

        console.log('Displaying message:', message.fromUser, message.content);
        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const sendMessage = () => {
        const messageContent = messageInput.value.trim();
        if (!messageContent || !currentChatFriend) return;

        const chatMessage = {
            fromUser: username,
            toUser: currentChatFriend,
            content: messageContent,
            timestamp: new Date().toISOString(),
            prompt: promptForFriend
        };

        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
        console.log('Sent message:', chatMessage);

        messageInput.value = '';
    };


    const startChatWithFriend = async (friendName) => {
        currentChatFriend = friendName;
        chatMessagesContainer.innerHTML = `<p class="system-message">Chatting with ${currentChatFriend}</p>`;
        messageInput.placeholder = `Type a message to ${currentChatFriend}...`;
        messageInput.disabled = false;
        sendButton.disabled = false;

        await fetchChatHistory(friendName);
        await fetchMyStylePrompt(friendName);
        await fetchPromptForFriend(friendName);

        document.querySelectorAll('.friend-item').forEach(item => item.classList.remove('selected-friend'));
        document.querySelector(`li[data-friend-name="${friendName}"]`).classList.add('selected-friend');
    };


    const fetchChatHistory = async (friendName) => {
        try {
            const response = await fetchWithJwt(`/api/chat/history?user1=${username}&user2=${friendName}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(response.status, errorText);
                chatMessagesContainer.innerHTML += `<p class="system-message error">Error ${errorText}</p>`;
                return;
            }
            const apiResponse = await response.json();
            if (apiResponse.result && apiResponse.result.length > 0) {
                apiResponse.result.forEach(message => displayMessage(message));
            } else {
                chatMessagesContainer.innerHTML += `<p class="system-message">No chat history found</p>`;
            }
        } catch (error) {
            console.error(error);
            chatMessagesContainer.innerHTML += `<p class="system-message error">Network error</p>`;
        }
    };

    const fetchPromptForFriend = async (friendName) => {
        try {
            const response = await fetchWithJwt(
                `/api/users/${encodeURIComponent(friendName)}/style?friend=${encodeURIComponent(username)}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(response.status, errorText);
                promptForFriend = "";
                return;
            }

            const apiResponse = await response.json();
            promptForFriend = apiResponse.result?.stylePrompt ?? "";
        } catch (error) {
            console.error(error);
            promptForFriend = "";
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
            handleRequest(sender, 'accept');
        } else if (target.classList.contains('reject-btn')) {
            handleRequest(sender, 'reject');
        }
    });

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    saveStyleButton.addEventListener('click', saveStylePromptForFriend);

    fetchFriends();
    fetchPending();
    connectWebSocket();
});