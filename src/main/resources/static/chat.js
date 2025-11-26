// chat.js

let stompClient = null;
let username = null;

// Prompt user for username (replace this with a proper login later)
function askUsername() {
    username = prompt("Enter your username:");
    if (!username || username.trim() === "") {
        alert("Username is required!");
        askUsername();
    }
}

// Connect to WebSocket
function connect() {
    const socket = new SockJS('/ws-chat'); // Spring WebSocket endpoint
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);

        // Subscribe to user-specific topic
        stompClient.subscribe('/topic/public/' + username, function(messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });
    }, function(error) {
        console.error("WebSocket connection error:", error);
        setTimeout(connect, 5000); // Retry connection after 5s
    });
}

// Send a message
function sendMessage() {
    const toUser = document.getElementById('toUser').value.trim();
    const content = document.getElementById('messageInput').value.trim();

    if (toUser === "" || content === "") {
        alert("Friend username and message cannot be empty.");
        return;
    }

    const chatMessage = {
        fromUser: username,
        toUser: toUser,
        content: content
    };

    // Send to Spring WebSocket controller
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));

    // Clear input
    document.getElementById('messageInput').value = '';
}

// Display incoming message in chat area
function showMessage(message) {
    const chatArea = document.getElementById('chatArea');

    const messageElement = document.createElement('p');

    // Style differently if message is sent by current user
    if (message.fromUser === username) {
        messageElement.style.fontWeight = "bold";
        messageElement.style.color = "blue";
    } else {
        messageElement.style.color = "green";
    }

    messageElement.innerText = `${message.fromUser}: ${message.content}`;
    chatArea.appendChild(messageElement);

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Initialize chat on page load
window.onload = function() {
    askUsername();
    connect();

    // Optional: Press Enter to send message
    document.getElementById('messageInput').addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
};
