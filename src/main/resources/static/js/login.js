document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        const requestBody = { username, password };

        try {
            const response = await fetch("/auth/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || `Login failed (${response.status})`);
            }

            const token = data?.result?.token;

            if (!token) throw new Error("Token not found in response.");

            localStorage.setItem("jwtToken", token);
            localStorage.setItem("username", username);

            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";

            setTimeout(() => {
                window.location.href = "/index.html";
            }, 800);

        } catch (error) {
            loginMessage.textContent = error.message;
            loginMessage.style.color = "red";
        }
    });
});
