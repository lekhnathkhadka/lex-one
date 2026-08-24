/* =========================================================
   LEX ONE AUTH
========================================================= */

const authScreen =
  document.getElementById("authScreen");

const authForm =
  document.getElementById("authForm");

const authEmail =
  document.getElementById("authEmail");

const authPassword =
  document.getElementById("authPassword");

const authTitle =
  document.getElementById("authTitle");

const authSubtitle =
  document.getElementById("authSubtitle");

const authSubmit =
  document.getElementById("authSubmit");

const authSwitch =
  document.getElementById("authSwitch");

const authMessage =
  document.getElementById("authMessage");

let isSignUpMode = false;


/* -------------------------
   AUTH MESSAGE
------------------------- */

function showAuthMessage(message) {
  if (authMessage) {
    authMessage.textContent = message;
  }
}


/* -------------------------
   AUTH SCREEN
------------------------- */

function updateAuthScreen() {
  if (!authTitle ||
      !authSubtitle ||
      !authSubmit ||
      !authSwitch) {
    return;
  }

  if (isSignUpMode) {

    authTitle.textContent =
      "Create Account";

    authSubtitle.textContent =
      "Create your LEX ONE account.";

    authSubmit.textContent =
      "Create Account";

    authSwitch.textContent =
      "Already have an account? Sign In";

  } else {

    authTitle.textContent =
      "Sign in";

    authSubtitle.textContent =
      "Continue to your LEX ONE workspace.";

    authSubmit.textContent =
      "Sign In";

    authSwitch.textContent =
      "Create Account";
  }

  showAuthMessage("");
}


/* -------------------------
   SWITCH SIGN IN / SIGN UP
------------------------- */

authSwitch?.addEventListener(
  "click",
  () => {

    isSignUpMode =
      !isSignUpMode;

    updateAuthScreen();

    authPassword.value = "";
  }
);


/* -------------------------
   AUTH FORM
------------------------- */

authForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (!db) {
      showAuthMessage(
        "Supabase connection not ready."
      );

      return;
    }

    const email =
      authEmail.value.trim();

    const password =
      authPassword.value;

    if (!email || !password) {
      showAuthMessage(
        "Please enter your email and password."
      );

      return;
    }

    authSubmit.disabled = true;

    authSubmit.textContent =
      isSignUpMode
        ? "Creating..."
        : "Signing in...";


    /* =====================
       CREATE ACCOUNT
    ====================== */

    if (isSignUpMode) {

      const {
        data,
        error
      } = await db.auth.signUp({
        email,
        password
      });

      if (error) {

        console.error(
          "Sign up error:",
          error
        );

        showAuthMessage(
          error.message
        );

        authSubmit.disabled =
          false;

        updateAuthScreen();

        return;
      }

      /*
        If email confirmation is OFF,
        Supabase creates an active session.
      */

      if (data?.session) {

        await createProfileForUser(
          data.user
        );

        authScreen.style.display =
          "none";

        document.getElementById(
          "app"
        ).style.display = "";

        await loadUserProfile();

        showToast(
          "Account created successfully!"
        );

      } else {

        showAuthMessage(
          "Account created. Please check your email to verify your account."
        );

        isSignUpMode = false;

        updateAuthScreen();
      }

    }


    /* =====================
       SIGN IN
    ====================== */

    else {

      const {
        data,
        error
      } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) {

        console.error(
          "Sign in error:",
          error
        );

        showAuthMessage(
          error.message
        );

        authSubmit.disabled =
          false;

        updateAuthScreen();

        return;
      }

      if (data?.user) {

        await createProfileForUser(
          data.user
        );

        authScreen.style.display =
          "none";

        document.getElementById(
          "app"
        ).style.display = "";

        await loadUserProfile();

        showToast(
          "Signed in successfully."
        );
      }
    }

    authSubmit.disabled =
      false;

    updateAuthScreen();
  }
);


/* -------------------------
   SIGN OUT
------------------------- */

async function signOut() {

  if (!db) {
    return;
  }

  const {
    error
  } = await db.auth.signOut();

  if (error) {

    console.error(
      "Sign out error:",
      error
    );

    showToast(
      error.message
    );

    return;
  }

  currentConversation = null;

  if (authScreen) {
    authScreen.style.display =
      "flex";
  }

  const app =
    document.getElementById("app");

  if (app) {
    app.style.display =
      "none";
  }

  authEmail.value = "";
  authPassword.value = "";

  isSignUpMode = false;

  updateAuthScreen();

  showToast(
    "Signed out successfully."
  );
}


/* -------------------------
   AUTH STATE
------------------------- */

async function initializeAuth() {

  if (!db) {
    console.error(
      "Supabase client not found."
    );

    return;
  }

  const {
    data: {
      session
    }
  } = await db.auth.getSession();

  if (session?.user) {

    if (authScreen) {
      authScreen.style.display =
        "none";
    }

    const app =
      document.getElementById("app");

    if (app) {
      app.style.display =
        "";
    }

    await createProfileForUser(
      session.user
    );

    await loadUserProfile();

  } else {

    if (authScreen) {
      authScreen.style.display =
        "flex";
    }

    const app =
      document.getElementById("app");

    if (app) {
      app.style.display =
        "none";
    }
  }

  updateAuthScreen();
}


if (db) {

  db.auth.onAuthStateChange(
    async (event, session) => {

      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {

        await createProfileForUser(
          session.user
        );

        await loadUserProfile();
      }

      if (event === "SIGNED_OUT") {

        if (authScreen) {
          authScreen.style.display =
            "flex";
        }

        const app =
          document.getElementById("app");

        if (app) {
          app.style.display =
            "none";
        }
      }
    }
  );
}
