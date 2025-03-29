// check if user used remember me -> direct him to dashboard
document.addEventListener("DOMContentLoaded", async () => {
  const accessToken = localStorage.getItem("access") || sessionStorage.getItem("access");

  if (accessToken) {
    const response = await fetch("/api/user-info/", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      window.location.href = "/dashboard/";
    } else {
      const refreshToken = localStorage.getItem("refresh") || sessionStorage.getItem("refresh");

      if (refreshToken) {
        const refreshResponse = await fetch("/api/token/refresh/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          const usingLocal = !!localStorage.getItem("refresh");
          const storage = usingLocal ? localStorage : sessionStorage;

          storage.setItem("access", data.access);

          window.location.href = "/dashboard/";
        } else {
          localStorage.clear();
          sessionStorage.clear();
        }
      }
    }
  }
});


// check if user logged in with google -> direct him to dashboard
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("logged_in")) {
    history.replaceState({}, document.title, "/");
    checkGoogleLogin();
  }
});

function checkGoogleLogin() {
  fetch("/api/google-login-success/")
    .then(res => res.json())
    .then(data => {
      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", data.username);
        localStorage.setItem("google_login", "true");

        window.location.href = "/dashboard/";
      }
    })
    .catch(err => {
      console.error("Google login error:", err);
    });
}


// for the login
document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;
  const remember = document.getElementById("remember-me").checked; 


  try {
    const response = await fetch("/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("access", data.access);
      storage.setItem("refresh", data.refresh);
      window.location.href = "/dashboard/";
    } else {
      setErrorMessage(data.message || "Invalid username/password")
    }
    
  }
   catch (err) {
      setErrorMessage("Login failed. Please check your credentials.")  
  }
});

function setErrorMessage(errorMessage) {
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = errorMessage;
  errorDiv.classList.remove("hidden");
  console.log(errorMessage)

  setTimeout(() => {
    errorDiv.classList.add("hidden");
  }, 5000);
}