document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("new-password-form");
    const errorDisplay = document.getElementById("reset-error-message");
  
    const params = new URLSearchParams(window.location.search);
    const uidb64 = params.get("uidb64");
    const token = params.get("token");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const password = document.getElementById("new-password").value.trim();
      const confirm = document.getElementById("confirm-password").value.trim();
  
      errorDisplay.innerText = "";
  
      if (password !== confirm) {
        errorDisplay.innerText = "Passwords do not match.";
        return;
      }
  
      fetch("/api/set-new-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uidb64, token, password }),
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
        .catch(() => {
          errorDisplay.innerText = "Failed to reset password.";
        });
    });
  });
  