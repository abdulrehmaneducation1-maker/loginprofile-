// Your real Firebase project config.
const firebaseConfig = {
  apiKey: "AIzaSyBmYXbywTg-iR1IKTjek4h7rAhVHf0pico",
  authDomain: "profile-login-31e65.firebaseapp.com",
  projectId: "profile-login-31e65",
  storageBucket: "profile-login-31e65.firebasestorage.app",
  messagingSenderId: "1078325199667",
  appId: "1:1078325199667:web:05d510c84b3e36b3723446"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// The page the emailed sign-in link will open. Must be added to
// Firebase Console → Authentication → Settings → Authorized domains.
const ACTION_CODE_SETTINGS = {
  url: window.location.origin + "/finish-login.html",
  handleCodeInApp: true
};