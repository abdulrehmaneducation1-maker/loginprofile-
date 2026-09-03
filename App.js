// ======================================================
// REPORTFY - FIREBASE AUTHENTICATION
// ======================================================
// Features:
// - Email + Password Sign In
// - Sign Up
// - Forgot Password
// - Continue with Google
// - Successful login -> home.html
// ======================================================


// Firebase config.js already creates:
// const auth = firebase.auth();
//
// DO NOT write "const auth = firebase.auth();" again here.


// ---------------- ELEMENTS ----------------

const googleBtn = document.getElementById("googleBtn");

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");

const forgotPasswordBtn =
  document.getElementById("forgotPassword");

const signupBtn =
  document.getElementById("signupBtn");

const showPasswordBtn =
  document.getElementById("showPassword");

const statusMsg =
  document.getElementById("statusMsg");


// ---------------- STATE ----------------

let isSignUpMode = false;


// ======================================================
// STATUS MESSAGE
// ======================================================

function setStatus(message, type = "") {

  if (!statusMsg) return;

  statusMsg.textContent = message;

  statusMsg.className = "status";

  if (type) {
    statusMsg.classList.add(type);
  }
}


// ======================================================
// REDIRECT TO HOME
// ======================================================

function redirectToHome() {

  window.location.replace("home.html");

}


// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================

if (showPasswordBtn && passwordInput) {

  showPasswordBtn.addEventListener("click", function () {

    if (passwordInput.type === "password") {

      passwordInput.type = "text";

      showPasswordBtn.textContent = "Hide";

    } else {

      passwordInput.type = "password";

      showPasswordBtn.textContent = "Show";

    }

  });

}


// ======================================================
// SIGN UP / SIGN IN TOGGLE
// ======================================================

if (signupBtn) {

  signupBtn.addEventListener("click", function () {

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

}


// ======================================================
// EMAIL + PASSWORD LOGIN / SIGN UP
// ======================================================

if (loginForm) {

  loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    // ---------------- VALIDATION ----------------

    if (!email || !password) {

      setStatus(
        "Please enter your email and password.",
        "error"
      );

      return;

    }


    // ---------------- DISABLE BUTTON ----------------

    signInBtn.disabled = true;


    try {

      // ==================================================
      // SIGN UP
      // ==================================================

      if (isSignUpMode) {

        setStatus(
          "Creating your account..."
        );


        await auth.createUserWithEmailAndPassword(
          email,
          password
        );


        setStatus(
          "Account created successfully. Opening Reportfy...",
          "success"
        );


        setTimeout(function () {

          redirectToHome();

        }, 500);


        return;
      }


      // ==================================================
      // SIGN IN
      // ==================================================

      setStatus(
        "Signing you in..."
      );


      await auth.signInWithEmailAndPassword(
        email,
        password
      );


      setStatus(
        "Login successful. Opening Reportfy...",
        "success"
      );


      setTimeout(function () {

        redirectToHome();

      }, 500);


    } catch (error) {

      console.error(
        "Firebase Authentication Error:",
        error
      );


      let message =
        "Something went wrong. Please try again.";


      switch (error.code) {


        case "auth/invalid-email":

          message =
            "Please enter a valid email address.";

          break;


        case "auth/user-not-found":

          message =
            "No account was found with this email.";

          break;


        case "auth/wrong-password":

        case "auth/invalid-credential":

          message =
            "Incorrect email or password.";

          break;


        case "auth/email-already-in-use":

          message =
            "An account with this email already exists.";

          break;


        case "auth/weak-password":

          message =
            "Password must be at least 6 characters.";

          break;


        case "auth/too-many-requests":

          message =
            "Too many attempts. Please try again later.";

          break;


        case "auth/network-request-failed":

          message =
            "Network error. Please check your internet connection.";

          break;


        case "auth/operation-not-allowed":

          message =
            "Email/password authentication is not enabled in Firebase.";

          break;


        default:

          message =
            error.message || message;

      }


      setStatus(
        message,
        "error"
      );


      signInBtn.disabled = false;

    }

  });

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

if (forgotPasswordBtn) {

  forgotPasswordBtn.addEventListener("click", async function () {


    const email =
      emailInput.value.trim();


    // ---------------- EMAIL REQUIRED ----------------

    if (!email) {

      setStatus(
        "Enter your email address first, then click Forgot password.",
        "error"
      );

      emailInput.focus();

      return;

    }


    // ---------------- DISABLE BUTTON ----------------

    forgotPasswordBtn.disabled = true;


    try {

      setStatus(
        "Sending password reset email..."
      );


      await auth.sendPasswordResetEmail(
        email
      );


      setStatus(
        "Password reset email sent. Check your inbox.",
        "success"
      );


    } catch (error) {

      console.error(
        "Password Reset Error:",
        error
      );


      let message =
        "Unable to send password reset email.";


      switch (error.code) {


        case "auth/invalid-email":

          message =
            "Please enter a valid email address.";

          break;


        case "auth/user-not-found":

          message =
            "No account was found with this email.";

          break;


        case "auth/too-many-requests":

          message =
            "Too many requests. Please try again later.";

          break;


        case "auth/network-request-failed":

          message =
            "Network error. Please check your internet connection.";

          break;


        default:

          message =
            error.message || message;

      }


      setStatus(
        message,
        "error"
      );


    } finally {

      forgotPasswordBtn.disabled = false;

    }

  });

}


// ======================================================
// GOOGLE LOGIN
// ======================================================

if (googleBtn) {

  googleBtn.addEventListener("click", async function () {


    googleBtn.disabled = true;


    try {

      setStatus(
        "Opening Google sign-in..."
      );


      // Create Google provider

      const provider =
        new firebase.auth.GoogleAuthProvider();


      // Always show Google account selection

      provider.setCustomParameters({

        prompt: "select_account"

      });


      // Open Google login

      const result =
        await auth.signInWithPopup(
          provider
        );


      const user =
        result.user;


      setStatus(

        `Welcome ${
          user.displayName || user.email
        }. Opening Reportfy...`,

        "success"

      );


      setTimeout(function () {

        redirectToHome();

      }, 500);


    } catch (error) {

      console.error(
        "Google Sign-In Error:",
        error
      );


      let message =
        "Google sign-in failed.";


      switch (error.code) {


        case "auth/popup-closed-by-user":

          message =
            "Google sign-in was cancelled.";

          break;


        case "auth/popup-blocked":

          message =
            "Your browser blocked the Google sign-in popup.";

          break;


        case "auth/unauthorized-domain":

          message =
            "This website is not authorized in Firebase Authentication.";

          break;


        case "auth/account-exists-with-different-credential":

          message =
            "An account already exists with this email using another sign-in method.";

          break;


        case "auth/operation-not-allowed":

          message =
            "Google sign-in is not enabled in Firebase.";

          break;


        case "auth/network-request-failed":

          message =
            "Network error. Please check your internet connection.";

          break;


        default:

          message =
            error.message || message;

      }


      setStatus(
        message,
        "error"
      );


      googleBtn.disabled = false;

    }

  });

}
