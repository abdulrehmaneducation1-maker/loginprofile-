const finishMsg = document.getElementById("finishMsg");
const confirmForm = document.getElementById("confirmEmailForm");
const confirmEmailInput = document.getElementById("confirmEmail");

async function completeSignIn(email) {
  try {
    const result = await auth.signInWithEmailLink(email, window.location.href);
    window.localStorage.removeItem("emailForSignIn");

    finishMsg.textContent = `Signed in as ${result.user.email}. Redirecting…`;

    // 👉 Change this to wherever your logged-in users should land.
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    console.error(err);
    finishMsg.textContent = "This link is invalid or expired. Please request a new one.";
  }
}

(function init() {
  if (!auth.isSignInWithEmailLink(window.location.href)) {
    finishMsg.textContent = "Invalid sign-in link.";
    return;
  }

  let email = window.localStorage.getItem("emailForSignIn");

  if (email) {
    completeSignIn(email);
  } else {
    finishMsg.textContent = "";
    confirmForm.classList.remove("hidden");

    confirmForm.addEventListener("submit", (e) => {
      e.preventDefault();
      completeSignIn(confirmEmailInput.value.trim());
    });
  }
})();