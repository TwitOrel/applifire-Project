document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-password-form");
    const errorDisplay = document.getElementById("reset-error-message");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const username = document.getElementById("reset-username").value.trim();
      const email = document.getElementById("reset-email").value.trim();
  
      errorDisplay.innerText = "";
  
      if (!username || !email) {
        errorDisplay.innerText = "Please fill in both fields.";
        return;
      }
      console.log(JSON.stringify({ username, email }))
      fetch("/api/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message) {
            alert(data.message);
            window.location.href = "/login/";
          } else {
            errorDisplay.innerText = data.error || "Something went wrong.";
          }
        })
        .catch((err) => {
          console.error(err);
          errorDisplay.innerText = "Failed to send reset request.";
        });
    });
  });
  