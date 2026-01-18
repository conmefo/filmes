# filmes

Filmes is a simple web application that allows users to send messages through an AI-based filter.
Messages are processed by an AI model (via OpenRouter) using a prompt provided by the chat partner.
This project is built for learning purposes, so the implementation focuses on simplicity and clarity.

---

## Tech Stack

Frontend:

* HTML
* CSS
* JavaScript

Backend:

* Java Spring Boot
* WebSocket
* JWT Authentication
* Custom Java-based data storage

AI:

* OpenRouter API

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/filmes.git
cd filmes
```

---

### Run the server

1. Open the project in VS Code
2. Locate the main Spring Boot application file
3. Click **Run** in VS Code

The server will start at:

```
http://localhost:8080
```

---

### Open the website

Open your browser and go to:

```
http://localhost:8080
```

---

## Share the app using Cloudflare Tunnel

To allow others to access your local server:

1. Open PowerShell
2. Run:

```bash
cloudflared tunnel --url http://localhost:8080
```

3. Copy the generated public URL
4. Send the link to your friend


<img width="1885" height="972" alt="image" src="https://github.com/user-attachments/assets/91c535db-fd09-4e72-a6ce-71cb04ec88d4" />

<img width="1827" height="928" alt="image" src="https://github.com/user-attachments/assets/7d083681-7b9e-4492-ad45-a38b4644a542" />



---

## Notes

* This is a beginner learning project
* All data handling is implemented manually in Java

---

