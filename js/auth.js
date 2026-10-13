
"use strict";

(() => {
  const $ = id => document.getElementById(id);

  const authArea = $("authArea");
  const forgotArea = $("forgotArea");
  const verifyArea = $("verifyArea");
  const popupBackdrop = $("popupBackdrop");
  const popupBox = $("popupBox");

  const actionIds = [
    "loginBtn",
    "signupBtn",
    "resetBtn",
    "resendBtn",
    "checkBtn"
  ];

  let busy = false;
  let lastFocusedElement = null;

  $("year").textContent = new Date().getFullYear();

  // ----------------------------------------
  // POPUP NOTIFICATIONS
  // ----------------------------------------

  const popupIcons = {
    error: "fa-exclamation-circle",
    success: "fa-check-circle",
    info: "fa-info-circle"
  };

  function showPopup(type, title, message) {
    lastFocusedElement = document.activeElement;

    popupBox.className = "popup " + type;

    $("popupIcon").innerHTML =
      `<i class="fas ${popupIcons[type] || popupIcons.info}"></i>`;

    $("popupTitle").textContent = title;
    $("popupText").textContent = message;

    popupBackdrop.hidden = false;
    $("popupClose").focus();
  }

  function closePopup() {
    if (popupBackdrop.hidden) return;

    popupBackdrop.hidden = true;

    if (lastFocusedElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus();
    }
  }

  $("popupClose").addEventListener("click", closePopup);

  popupBackdrop.addEventListener("click", event => {
    if (event.target === popupBackdrop) {
      closePopup();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !popupBackdrop.hidden) {
      closePopup();
    }
  });

  // ----------------------------------------
  // FORM NAVIGATION
  // ----------------------------------------

  function showView(view) {
    closePopup();

    [authArea, forgotArea, verifyArea].forEach(section => {
      section.classList.remove("active");
    });

    view.classList.add("active");
  }

  function showLogin() {
    showView(authArea);

    $("loginTab").classList.add("active");
    $("signupTab").classList.remove("active");

    $("loginTab").setAttribute("aria-selected", "true");
    $("signupTab").setAttribute("aria-selected", "false");

    $("loginForm").classList.add("active");
    $("signupForm").classList.remove("active");
  }

  function showSignup() {
    showView(authArea);

    $("signupTab").classList.add("active");
    $("loginTab").classList.remove("active");

    $("signupTab").setAttribute("aria-selected", "true");
    $("loginTab").setAttribute("aria-selected", "false");

    $("signupForm").classList.add("active");
    $("loginForm").classList.remove("active");
  }

  function showForgot() {
    const email = $("loginEmail").value.trim();

    if (email) {
      $("forgotEmail").value = email;
    }

    showView(forgotArea);
    $("forgotEmail").focus();
  }

  function showVerification(email) {
    showView(verifyArea);
    $("verifyEmail").textContent = email || "";
  }

  $("loginTab").addEventListener("click", showLogin);
  $("signupTab").addEventListener("click", showSignup);
  $("forgotBtn").addEventListener("click", showForgot);

  $("backFromForgotBtn").addEventListener("click", () => {
    showLogin();
    $("loginEmail").focus();
  });

  $("backBtn").addEventListener("click", () => {
    showLogin();
    $("loginEmail").focus();
  });

  // ----------------------------------------
  // PASSWORD VISIBILITY
  // ----------------------------------------

  document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.target);
      const visible = input.type === "password";

      input.type = visible ? "text" : "password";

      button.innerHTML = visible
        ? '<i class="far fa-eye-slash" aria-hidden="true"></i>'
        : '<i class="far fa-eye" aria-hidden="true"></i>';

      button.setAttribute(
        "aria-label",
        visible ? "Hide password" : "Show password"
      );
    });
  });

  // ----------------------------------------
  // FIREBASE INITIALIZATION
  // ----------------------------------------

  if (
    !window.firebase ||
    !firebase.apps ||
    !firebase.apps.length
  ) {
    actionIds.forEach(id => {
      $(id).disabled = true;
    });

    showPopup(
      "error",
      "Connection unavailable",
      "Authentication service load nahi hui. Internet, Firebase scripts aur js/firebase-config.js check karein."
    );

    return;
  }

  const auth = firebase.auth();

  // ----------------------------------------
  // EMAIL VALIDATION
  // ----------------------------------------

  function validateGmail(email) {
    const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

    if (!pattern.test(email)) {
      throw new Error("Please enter a valid @gmail.com address.");
    }
  }

  function validatePassword(password) {
    if (password.length < 6) {
      throw new Error("Password must contain at least 6 characters.");
    }
  }

  // ----------------------------------------
  // FRIENDLY FIREBASE ERRORS
  // ----------------------------------------

  function friendlyError(error) {
    const messages = {
      "auth/invalid-email":
        "The email address format is invalid.",

      "auth/user-not-found":
        "No account was found with these details.",

      "auth/wrong-password":
        "The email or password is incorrect.",

      "auth/invalid-credential":
        "The email or password is incorrect.",

      "auth/invalid-login-credentials":
        "The email or password is incorrect.",

      "auth/email-already-in-use":
        "An account already exists with this Gmail. Please sign in.",

      "auth/weak-password":
        "Choose a stronger password with at least 6 characters.",

      "auth/too-many-requests":
        "Too many attempts. Please wait a while and try again.",

      "auth/network-request-failed":
        "Connection failed. Check your internet and try again.",

      "auth/user-disabled":
        "This account is disabled. Please contact support.",

      "auth/operation-not-allowed":
        "Enable Email/Password authentication in Firebase Console.",

      "auth/unauthorized-domain":
        "Add this website's domain under Firebase Authorized Domains.",

      "auth/expired-action-code":
        "This link has expired. Please request a new email.",

      "auth/invalid-action-code":
        "This link is invalid or has already been used.",

      "auth/requires-recent-login":
        "Please sign in again and repeat this action."
    };

    return messages[error.code] ||
      "Something went wrong. Please try again shortly.";
  }

  // ----------------------------------------
  // LOADING STATES
  // ----------------------------------------

  const buttons = actionIds.map(id => $(id));

  buttons.forEach(button => {
    button.dataset.originalText = button.innerHTML;
  });

  function setBusy(value, activeButton) {
    busy = value;

    buttons.forEach(button => {
      button.disabled = value;
      button.setAttribute("aria-busy", String(value));

      if (!value) {
        button.innerHTML = button.dataset.originalText;
      }
    });

    if (value && activeButton) {
      activeButton.innerHTML =
        '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Please wait';
    }
  }

  // ----------------------------------------
  // VERIFIED BOOK ACCESS
  // ----------------------------------------

  async function openVerifiedBook(user) {
    await user.reload();

    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.emailVerified) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    sessionStorage.setItem("ebookAccess", "1");
    window.location.replace("ebook.html");
  }

  // ----------------------------------------
  // CREATE ACCOUNT
  // ----------------------------------------

  async function createAccount() {
    const name = $("signupName").value.trim();
    const email = $("signupEmail").value.trim().toLowerCase();
    const password = $("signupPassword").value;
    const confirmPassword = $("signupConfirm").value;

    if (name.length < 2) {
      throw new Error("Please enter your full name.");
    }

    validateGmail(email);
    validatePassword(password);

    if (password !== confirmPassword) {
      throw new Error("The passwords do not match.");
    }

    const result = await auth.createUserWithEmailAndPassword(
      email,
      password
    );

    await result.user.updateProfile({
      displayName: name
    });

    await result.user.sendEmailVerification();

    showVerification(email);

    showPopup(
      "success",
      "Account created",
      "Your account is ready. Open the verification link sent to your Gmail inbox. Check your spam folder too. Book access will be available after verification."
    );
  }

  $("signupForm").addEventListener("submit", async event => {
    event.preventDefault();

    if (busy) return;

    const button = $("signupBtn");
    setBusy(true, button);

    try {
      await createAccount();
    } catch (error) {
      showPopup(
        "error",
        "Unable to create account",
        error.code
          ? friendlyError(error)
          : error.message || "Please try again."
      );
    } finally {
      setBusy(false);
    }
  });

  // ----------------------------------------
  // SIGN IN
  // ----------------------------------------

  async function loginUser() {
    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    validateGmail(email);

    const result = await auth.signInWithEmailAndPassword(
      email,
      password
    );

    await result.user.reload();

    const user = auth.currentUser;

    if (!user || !user.emailVerified) {
      showVerification(email);

      showPopup(
        "info",
        "Verify your email",
        "Open the verification link sent to your Gmail. After verification, return here and select Check verification."
      );

      return;
    }

    await openVerifiedBook(user);
  }

  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault();

    if (busy) return;

    const button = $("loginBtn");
    setBusy(true, button);

    try {
      await loginUser();
    } catch (error) {
      if (error.message === "EMAIL_NOT_VERIFIED") {
        showVerification(auth.currentUser?.email);

        showPopup(
          "info",
          "Verification required",
          "Please verify your email before opening the book."
        );
      } else {
        showPopup(
          "error",
          "Sign-in failed",
          error.code
            ? friendlyError(error)
            : error.message || "Please try again."
        );
      }
    } finally {
      setBusy(false);
    }
  });

  // ----------------------------------------
  // FORGOT PASSWORD
  // ----------------------------------------

  $("forgotForm").addEventListener("submit", async event => {
    event.preventDefault();

    if (busy) return;

    const email = $("forgotEmail").value.trim().toLowerCase();
    const button = $("resetBtn");

    setBusy(true, button);

    try {
      validateGmail(email);

      await auth.sendPasswordResetEmail(email);

      showPopup(
        "success",
        "Check your email",
        "If an account exists for this address, password-reset instructions have been sent. Check your inbox and spam folder."
      );
    } catch (error) {
      if (!error.code) {
        showPopup("error", "Invalid email", error.message);
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        showPopup(
          "success",
          "Check your email",
          "If an account exists for this address, password-reset instructions have been sent."
        );
      } else {
        showPopup(
          "error",
          "Password reset failed",
          friendlyError(error)
        );
      }
    } finally {
      setBusy(false);
    }
  });

  // ----------------------------------------
  // RESEND VERIFICATION EMAIL
  // ----------------------------------------

  $("resendBtn").addEventListener("click", async () => {
    if (busy) return;

    const button = $("resendBtn");
    setBusy(true, button);

    try {
      const user = auth.currentUser;

      if (!user) {
        showLogin();

        showPopup(
          "info",
          "Sign in required",
          "Please sign in with your account before requesting another verification email."
        );

        return;
      }

      await user.reload();

      const currentUser = auth.currentUser;

      if (!currentUser) {
        showLogin();
        return;
      }

      if (currentUser.emailVerified) {
        await openVerifiedBook(currentUser);
        return;
      }

      await currentUser.sendEmailVerification();

      showPopup(
        "success",
        "Verification email sent",
        "A new verification email has been requested. Check your inbox and spam folder."
      );
    } catch (error) {
      showPopup(
        "error",
        "Unable to send email",
        error.message === "EMAIL_NOT_VERIFIED"
          ? "Email verification is still pending."
          : friendlyError(error)
      );
    } finally {
      setBusy(false);
    }
  });

  // ----------------------------------------
  // CHECK EMAIL VERIFICATION
  // ----------------------------------------

  $("checkBtn").addEventListener("click", async () => {
    if (busy) return;

    const button = $("checkBtn");
    setBusy(true, button);

    try {
      const user = auth.currentUser;

      if (!user) {
        showLogin();

        showPopup(
          "info",
          "Sign in required",
          "Please sign in again before checking your verification status."
        );

        return;
      }

      await user.reload();

      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.emailVerified) {
        showPopup(
          "info",
          "Verification pending",
          "Open the verification link in your Gmail first, then select Check verification again."
        );

        return;
      }

      await openVerifiedBook(currentUser);
    } catch (error) {
      showPopup(
        "error",
        "Verification check failed",
        error.message === "EMAIL_NOT_VERIFIED"
          ? "Email verification is still pending."
          : friendlyError(error)
      );
    } finally {
      setBusy(false);
    }
  });

  // ----------------------------------------
  // HANDLE VERIFICATION REDIRECT
  // ----------------------------------------

  const params = new URLSearchParams(window.location.search);

  if (params.get("verify") === "1") {
    showVerification(auth.currentUser?.email || "");
  }

})();
