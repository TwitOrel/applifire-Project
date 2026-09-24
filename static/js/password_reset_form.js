document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("forgot-password-form");
    const errorDisplay = document.getElementById("forgot-error-message");
  
    if (!form) return;
  
    form.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const username = document.getElementById("forgot-username")?.value.trim();
      const email = document.getElementById("forgot-email")?.value.trim();
  
      errorDisplay.innerText = "";
  
      if (!username || !email) {
        errorDisplay.innerText = "Please fill in both username and email.";
        return;
      }
  
      fetch("/api/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Request failed");
          return response.json();
        })
        .then((data) => {
          if (data.message) {
            alert("Check your email for the reset link!");
              window.location.href = "/login/";
          } else {
            errorDisplay.innerText = data.error || "Something went wrong.";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          errorDisplay.innerText = "Failed to process request.";
        });
    });
  });
  