// in case href(the page loaded) from reset password
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') {
        const uidb64 = params.get('uidb64');
        const token = params.get('token');
        showResetPasswordForm(uidb64, token);
    } else {
        showLogin();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has("logged_in")) {
        localStorage.setItem("google_login_redirect", "true");
        checkGoogleLogin();
        history.replaceState({}, document.title, "/");  // מסיר את `?logged_in=true` מה-URL
    }
});


function goToHome() {
    window.location.href = '/';
}

function handleGoogleLoginSuccess(access, refresh, username) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("username", username);
    localStorage.setItem("google_login", "true");   // used for when logout (know if normal or by Google)

    const logoutUrl = document.getElementById("logout-url").getAttribute("data-url");

    document.getElementById("content-area").innerHTML = `
        <div style="text-align: center;">
            <h2 class="success-message">✅ שלום ${username}, ההתחברות בוצעה בהצלחה!</h2>
            <button id="logout-button" class="logout-button">Logout</button>
        </div>
    `;
    document.getElementById("logout-button").addEventListener("click", logout);
}


function checkGoogleLogin() {
    fetch("/api/google-login-success/")
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            handleGoogleLoginSuccess(data.access, data.refresh, data.username);
        }
    })
    .catch(error => console.error("Google Login Error:", error));
}



function showLogin() {
    document.getElementById('content-area').innerHTML = `
        <form id="login-form">
            <h2>Login</h2>
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
            <p id="error-message"></p>
        </form>
    `;

    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch("/api/login/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                username: username,  
                password: password
            })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))  
        .then(({ status, body }) => {
            console.log("Server Response:", status, body); 

            if (status === 200 && body.access) {  
                localStorage.setItem("access", body.access); 
                localStorage.setItem("refresh", body.refresh); 
                localStorage.setItem("username", username); 

                document.getElementById("content-area").innerHTML = `
                    <div style="text-align: center;">
                        <h2 class="success-message">✅ שלום ${username}, ההתחברות בוצעה בהצלחה!</h2>
                        <button id="logout-button" class="logout-button">Logout</button>
                    </div>
                `;

                document.getElementById("logout-button").addEventListener("click", logout);
            } else {
                document.getElementById("error-message").innerText = body.error || "Invalid credentials.";
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.getElementById("error-message").innerText = "Something went wrong. Please try again.";
        });
    });
}

function getCSRFToken() {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        const [name, value] = cookies[i].split("=");
        if (name === "csrftoken") {
            return value;
        }
    }
    return "";
}

function logout() {
    const isGoogleLogin = localStorage.getItem("google_login") === "true";

    if (isGoogleLogin) {
        console.log("🚨 Logging out from Google...");
        fetch("/accounts/logout/", { 
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()  // add the CSRF Token from the Coockies
            },
            credentials: "include"
        })
        .then(response => {
            if (response.ok) {
                console.log("✅ Google Logout Successful!");
                localStorage.clear(); 
                window.location.href = "/";
            } else {
                console.error("🚨 Google Logout Failed!");
            }
        })
        .catch(error => console.error("🚨 Error during Google Logout:", error));

    } else {
        localStorage.clear();
        showLogin();
    }
}


function showRegister() {
    document.getElementById('content-area').innerHTML = `
        <form id="register-form">
            <h2>Register</h2>
            <input type="text" id="new-username" placeholder="Choose Username" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="new-password" placeholder="Password" required>
            <p id="register-error-message"></p>
            <button type="submit">Create Account</button>
        </form>
    `;

    document.getElementById("register-form").addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("new-username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("new-password").value;

        fetch("/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) { 
                alert("A confirmation email has been sent to you, Please check your email and verify your account.");
                showLogin(); 
            } else {
                document.getElementById("register-error-message").innerText = data.error || "Registration failed.";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("register-error-message").innerText = "Something went wrong. Please try again.";
        });
    });
}

function showForgotPassword() {
    document.getElementById('content-area').innerHTML = `
        <form id="forgot-password-form">
            <h2>Forgot Password</h2>
            <input type="email" id="forgot-email" placeholder="Enter your email" required>
            <button type="submit">Send Reset Link</button>
            <p id="forgot-error-message"></p>
        </form>
    `;

    document.getElementById('forgot-password-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('forgot-email').value;

        fetch('/api/forgot-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Check email for reset link (this simulates email).');
                showLogin(); 
            } else {
                document.getElementById('forgot-error-message').innerText = data.error || 'Failed to process request.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('forgot-error-message').innerText = 'Something went wrong.';
        });
    });
}

function showResetPasswordForm(uidb64, token) {
    document.getElementById('content-area').innerHTML = `
        <form id="reset-password-form">
            <h2>Reset Password</h2>
            <input type="password" id="new-password" placeholder="Enter new password" required>
            <button type="submit">Reset</button>
            <p id="reset-error-message"></p>
        </form>
    `;

    document.getElementById('reset-password-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const newPassword = document.getElementById('new-password').value;

        fetch(`/api/reset-password/${uidb64}/${token}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Password reset successfully! Please login.");
                showLogin(); 
            } else {
                document.getElementById('reset-error-message').innerText = data.error || 'Failed to reset password.';
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('reset-error-message').innerText = "Something went wrong.";
        });
    });
}