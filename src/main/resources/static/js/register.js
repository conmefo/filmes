document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");

    if (!registerForm) return;

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("registerUsername").value.trim();
        const password = document.getElementById("registerPassword").value;

        const requestBody = { username, password };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || `Registration failed (${response.status})`);
            }

            registerMessage.textContent = "User registered successfully!";
            registerMessage.style.color = "green";
            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 800);

        } catch (error) {
            registerMessage.textContent = error.message;
            registerMessage.style.color = "red";
        }
    });
});
