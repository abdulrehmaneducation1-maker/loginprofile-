```js
// Firebase Authentication
// Features:
// - Email + Password Sign In
// - Sign Up
// - Forgot Password
// - Continue with Google
// - Successful login -> home.html

const auth = firebase.auth();

const googleBtn = document.getElementById("googleBtn");

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");

const forgotPasswordBtn = document.getElementById("forgotPassword");
const signupBtn = document.getElementById("signupBtn");

const showPasswordBtn = document.getElementById("showPassword");
const statusMsg = document.getElementById("statusMsg");

let isSignUpMode = false;


// ---------------- STATUS ----------------

function setStatus(message, type = "") {
  if (!statusMsg) return;

  statusMsg.textContent = message;
  statusMsg.className = "status";

  if (type) {
    statusMsg.classList.add(type);
  }
}


// ---------------- REDIRECT ----------------

function redirectToHome() {
  window.location.replace("home.html");
}


// ---------------- SHOW / HIDE PASSWORD ----------------

if (showPasswordBtn) {
  showPasswordBtn.addEventListener("click", () => {

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      showPasswordBtn.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      showPasswordBtn.textContent = "Show";
    }

  });
}


// ---------------- SIGN IN / SIGN UP TOGGLE ----------------

signupBtn.addEventListener("click", () => {

  isSignUpMode = !isSignUpMode;

  if (isSignUpMode) {

    signInBtn.textContent = "Create Account";
    signupBtn.textContent = "Sign in instead";

    setStatus("");

  } else {

    signInBtn.textContent = "Sign In";
    signupBtn.textContent = "Sign Up";

    setStatus("");
  }

});


// ---------------- EMAIL + PASSWORD ----------------

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus("Please enter your email and password.", "error");
    return;
  }

  signInBtn.disabled = true;

  try {

    let result;

    if (isSignUpMode) {

      setStatus("Creating your account...");

      result = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      setStatus("Account created successfully. Opening Reportfy...", "success");

    } else {

      setStatus("Signing you in...");

      result = await auth.signInWithEmailAndPassword(
        email,
        password
      );

      setStatus("Login successful. Opening Reportfy...", "success");
    }

    // Successful authentication
    setTimeout(() => {
      redirectToHome();
    }, 500);

  } catch (error) {

    console.error(error);

    let message = "Something went wrong. Please try again.";

    switch (error.code) {

      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;

      case "auth/user-not-found":
        message = "No account was found with this email.";
        break;

      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Incorrect email or password.";
        break;

      case "auth/email-already-in-use":
        message = "An account with this email already exists.";
        break;

      case "auth/weak-password":
        message = "Password must be at least 6 characters.";
        break;

      case "auth/too-many-requests":
        message = "Too many attempts. Please try again later.";
        break;

      case "auth/network-request-failed":
        message = "Network error. Please check your internet connection.";
        break;

      default:
        message = error.message || message;
    }

    setStatus(message, "error");

    signInBtn.disabled = false;
  }

});


// ---------------- FORGOT PASSWORD ----------------

forgotPasswordBtn.addEventListener("click", async () => {

  const email = emailInput.value.trim();

  if (!email) {

    setStatus(
      "Enter your email address first, then click Forgot password.",
      "error"
    );

    emailInput.focus();

    return;
  }

  forgotPasswordBtn.disabled = true;

  try {

    await auth.sendPasswordResetEmail(email);

    setStatus(
      "Password reset email sent. Check your inbox.",
      "success"
    );

  } catch (error) {

    console.error(error);

    let message = "Unable to send password reset email.";

    switch (error.code) {

      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;

      case "auth/user-not-found":
        message = "No account was found with this email.";
        break;

      case "auth/too-many-requests":
        message = "Too many requests. Please try again later.";
        break;

      default:
        message = error.message || message;
    }

    setStatus(message, "error");

  } finally {

    forgotPasswordBtn.disabled = false;

  }

});


// ---------------- GOOGLE LOGIN ----------------

googleBtn.addEventListener("click", async () => {

  googleBtn.disabled = true;

  try {

    setStatus("Opening Google sign-in...");

    const provider = new firebase.auth.GoogleAuthProvider();

    // Optional: always show the Google account chooser
    provider.setCustomParameters({
      prompt: "select_account"
    });

    const result = await auth.signInWithPopup(provider);

    const user = result.user;

    setStatus(
      `Welcome ${user.displayName || user.email}. Opening Reportfy...`,
      "success"
    );

    setTimeout(() => {
      redirectToHome();
    }, 500);

  } catch (error) {

    console.error(error);

    let message = "Google sign-in failed.";

    switch (error.code) {

      case "auth/popup-closed-by-user":
        message = "Google sign-in was cancelled.";
        break;

      case "auth/popup-blocked":
        message = "Your browser blocked the Google sign-in popup.";
        break;

      case "auth/unauthorized-domain":
        message =
          "This website is not authorized in Firebase Authentication.";
        break;

      case "auth/account-exists-with-different-credential":
        message =
          "An account already exists with this email using another sign-in method.";
        break;

      default:
        message = error.message || message;
    }

    setStatus(message, "error");

    googleBtn.disabled = false;
  }

});
```
