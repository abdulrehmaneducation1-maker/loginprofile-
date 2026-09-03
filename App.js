const DAILY_LIMIT = 4;

const cardSub = document.getElementById("cardSub");

// Google
const googleBtn = document.getElementById("googleBtn");

// Email + Password
const emailPasswordForm = document.getElementById("emailPasswordForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailSignInBtn = document.getElementById("emailSignInBtn");
const toggleSignUpBtn = document.getElementById("toggleSignUpBtn");
let isSignUpMode = false;

// Email link (passwordless) toggle
const useLinkBtn = document.getElementById("useLinkBtn");
const backToPasswordBtn = document.getElementById("backToPasswordBtn");
const backToPasswordRow = document.getElementById("backToPasswordRow");
const emailLinkForm = document.getElementById("emailLinkForm");
const linkEmailInput = document.getElementById("linkEmail");

// Phone
const phoneForm = document.getElementById("phoneForm");
const phoneInput = document.getElementById("phone");
const sendBtn = document.getElementById("sendBtn");
const codeForm = document.getElementById("codeForm");
const codeInput = document.getElementById("code");
const verifyBtn = document.getElementById("verifyBtn");

const statusMsg = document.getElementById("statusMsg");
const limitMsg = document.getElementById("limitMsg");

let confirmationResult = null;

function setStatus(text, type) {
  statusMsg.textContent = text;
  statusMsg.className = "status" + (type ? " " + type : "");
}

function redirectAfterSignIn() {
  // 👉 Change this to wherever your logged-in users should land.
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}

/* ---------------- Google ---------------- */

googleBtn.addEventListener("click", async () => {
  try {
    setStatus("Opening Google sign-in…", "");
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    setStatus(`Signed in as ${result.user.displayName}. Redirecting…`, "success");
    redirectAfterSignIn();
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Google sign-in failed.", "error");
  }
});

/* ---------------- Email + Password ---------------- */

toggleSignUpBtn.addEventListener("click", () => {
  isSignUpMode = !isSignUpMode;
  emailSignInBtn.textContent = isSignUpMode ? "Create Account" : "Sign In";
  toggleSignUpBtn.textContent = isSignUpMode ? "Sign in instead" : "Create an account instead";
  setStatus("", "");
});

emailPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return;

  emailSignInBtn.disabled = true;
  setStatus(isSignUpMode ? "Creating account…" : "Signing in…", "");

  try {
    const result = isSignUpMode
      ? await auth.createUserWithEmailAndPassword(email, password)
      : await auth.signInWithEmailAndPassword(email, password);

    setStatus(`Signed in as ${result.user.email}. Redirecting…`, "success");
    redirectAfterSignIn();
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Something went wrong. Please try again.", "error");
    emailSignInBtn.disabled = false;
  }
});

/* ---------------- Email link (passwordless) toggle ---------------- */

useLinkBtn.addEventListener("click", () => {
  emailPasswordForm.classList.add("hidden");
  toggleSignUpBtn.parentElement.classList.add("hidden");
  emailLinkForm.classList.remove("hidden");
  backToPasswordRow.classList.remove("hidden");
  setStatus("", "");
});

backToPasswordBtn.addEventListener("click", () => {
  emailLinkForm.classList.add("hidden");
  backToPasswordRow.classList.add("hidden");
  emailPasswordForm.classList.remove("hidden");
  toggleSignUpBtn.parentElement.classList.remove("hidden");
  setStatus("", "");
});

emailLinkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = linkEmailInput.value.trim();
  if (!email) return;

  const sendLinkBtn = document.getElementById("sendLinkBtn");
  sendLinkBtn.disabled = true;
  setStatus("Sending link…", "");

  try {
    await auth.sendSignInLinkToEmail(email, ACTION_CODE_SETTINGS);
    window.localStorage.setItem("emailForSignIn", email);
    setStatus("Check your email — we sent you a sign-in link.", "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Couldn't send the link. Please try again.", "error");
  } finally {
    sendLinkBtn.disabled = false;
  }
});

/* ---------------- Phone OTP (4/day cap) ---------------- */

function currentDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function refreshLimitDisplay() {
  try {
    const doc = await db.collection("otpUsage").doc(currentDayKey()).get();
    const count = doc.exists ? doc.data().count : 0;
    limitMsg.textContent = `${count}/${DAILY_LIMIT} phone codes sent today`;
  } catch (e) {
    limitMsg.textContent = "";
  }
}
refreshLimitDisplay();

// Atomically checks + increments today's cap so two requests
// can't both slip through at count 3/4.
async function tryConsumeDailyQuota() {
  const ref = db.collection("otpUsage").doc(currentDayKey());

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const count = doc.exists ? doc.data().count : 0;

    if (count >= DAILY_LIMIT) {
      return { allowed: false, count };
    }

    tx.set(ref, { count: count + 1 }, { merge: true });
    return { allowed: true, count: count + 1 };
  });
}

// Firebase Phone Auth requires this invisible reCAPTCHA to prove
// the request is coming from a real browser, not a bot/script.
const recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
  size: "invisible"
});

phoneForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = phoneInput.value.trim();
  if (!phone) return;

  sendBtn.disabled = true;
  setStatus("Checking availability…", "");

  try {
    const quota = await tryConsumeDailyQuota();

    if (!quota.allowed) {
      setStatus("Today's phone sign-in limit reached. Please try again tomorrow.", "error");
      sendBtn.disabled = false;
      return;
    }

    setStatus("Sending code…", "");
    confirmationResult = await auth.signInWithPhoneNumber(phone, recaptchaVerifier);

    setStatus("Code sent — check your SMS.", "success");
    refreshLimitDisplay();

    // Swap to step 2
    phoneForm.classList.add("hidden");
    codeForm.classList.remove("hidden");
    cardSub.textContent = `We texted a 6-digit code to ${phone}`;
    codeInput.focus();
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Couldn't send code. Check the number and try again.", "error");
    sendBtn.disabled = false;
    recaptchaVerifier.render().then((widgetId) => {
      if (window.grecaptcha) window.grecaptcha.reset(widgetId);
    });
  }
});

codeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = codeInput.value.trim();
  if (!code || !confirmationResult) return;

  verifyBtn.disabled = true;
  setStatus("Verifying…", "");

  try {
    const result = await confirmationResult.confirm(code);
    setStatus(`Signed in as ${result.user.phoneNumber}. Redirecting…`, "success");
    redirectAfterSignIn();
  } catch (err) {
    console.error(err);
    setStatus("Incorrect or expired code. Please try again.", "error");
    verifyBtn.disabled = false;
  }
});