document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("signup-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.message) {
        alert("A confirmation email has been sent to you.");
        window.location.href = "/login/";
      } else {
        document.getElementById("register-error-message").innerText = data.error || "Registration failed.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("register-error-message").innerText = "Something went wrong. Please try again.";
    }
  });
});
