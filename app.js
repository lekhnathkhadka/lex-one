
const {
  createClient
} = window.supabase;

const db = window.supabaseClient;

/* =========================================================
   LEX ONE APP
========================================================= */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll("[data-page]");
const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const toast = document.getElementById("toast");

const pageNames = {
  home: "Home",
  ai: "LEX AI",
  cv: "LEX CV",
  learn: "LEX Learn",
  translate: "Translate",
  tools: "Tools",
  profile: "Profile",
  settings: "Settings"
};

/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageName) {
  pages.forEach(page => {
    page.classList.toggle(
      "active",
      page.id === `page-${pageName}`
    );
  });

  navItems.forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === pageName
    );
  });

  if (pageTitle) {
    pageTitle.textContent =
      pageNames[pageName] || "LEX ONE";
  }

  sidebar?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document
  .querySelectorAll("[data-page]")
  .forEach(item => {

    item.addEventListener("click", () => {

      const page =
        item.dataset.page;

      if (page) {
        showPage(page);
      }

    });

  });

menuBtn?.addEventListener(
  "click",
  () => {
    sidebar?.classList.toggle("open");
  }
);

/* =========================================================
   THEME
========================================================= */

const themeBtn =
  document.getElementById("themeBtn");

const settingsThemeBtn =
  document.getElementById(
    "settingsThemeBtn"
  );

function applyTheme(theme) {

  document.body.classList.toggle(
    "light",
    theme === "light"
  );

  localStorage.setItem(
    "lex-one-theme",
    theme
  );
}

const savedTheme =
  localStorage.getItem(
    "lex-one-theme"
  ) || "dark";

applyTheme(savedTheme);

function toggleTheme() {

  const isLight =
    document.body.classList.contains(
      "light"
    );

  applyTheme(
    isLight
      ? "dark"
      : "light"
  );
}

themeBtn?.addEventListener(
  "click",
  toggleTheme
);

settingsThemeBtn?.addEventListener(
  "click",
  toggleTheme
);

/* =========================================================
   AUTH ELEMENTS
========================================================= */

const authScreen =
  document.getElementById(
    "authScreen"
  );

const authForm =
  document.getElementById(
    "authForm"
  );

const authEmail =
  document.getElementById(
    "authEmail"
  );

const authPassword =
  document.getElementById(
    "authPassword"
  );

const authTitle =
  document.getElementById(
    "authTitle"
  );

const authSubtitle =
  document.getElementById(
    "authSubtitle"
  );

const authSubmit =
  document.getElementById(
    "authSubmit"
  );

const authSwitch =
  document.getElementById(
    "authSwitch"
  );

const authMessage =
  document.getElementById(
    "authMessage"
  );

let isSignUpMode = false;

/* =========================================================
   AUTH MESSAGE
========================================================= */

function showAuthMessage(message) {

  if (authMessage) {
    authMessage.textContent =
      message;
  }
}

/* =========================================================
   AUTH SCREEN
========================================================= */

function updateAuthScreen() {

  if (
    !authTitle ||
    !authSubtitle ||
    !authSubmit ||
    !authSwitch
  ) {
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

/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {

  if (!db) {
    return null;
  }

  const {
    data,
    error
  } = await db.auth.getUser();

  if (error) {

    console.error(
      "Get user error:",
      error
    );

    return null;
  }

  return data?.user || null;
}

/* =========================================================
   USER NAME
========================================================= */

function getUserName(
  user,
  profile = null
) {

  return (
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "LEX ONE User"
  );
}

/* =========================================================
   CREATE / UPDATE PROFILE
========================================================= */

async function createProfileForUser(
  user
) {

  if (!db || !user) {
    return;
  }

  const displayName =
    getUserName(user);

  const {
    error
  } = await db
    .from("profiles")
    .upsert(
      {
        id: user.id,
        display_name:
          displayName
      },
      {
        onConflict: "id"
      }
    );

  if (error) {

    console.error(
      "Profile creation error:",
      error
    );
  }
}

/* =========================================================
   PROFILE
========================================================= */

async function loadUserProfile() {

  if (!db) {
    return;
  }

  const user =
    await getCurrentUser();

  const profileName =
    document.getElementById(
      "profileName"
    );

  const profileEmail =
    document.getElementById(
      "profileEmail"
    );

  const avatar =
    document.getElementById(
      "avatar"
    );

  const profileAvatar =
    document.getElementById(
      "profileAvatar"
    );

  const signInBtn =
    document.getElementById(
      "signInBtn"
    );

  const signOutBtn =
    document.getElementById(
      "signOutBtn"
    );

  if (!user) {

    if (profileName) {
      profileName.textContent =
        "Guest User";
    }

    if (profileEmail) {
      profileEmail.textContent =
        "Not signed in";
    }

    if (avatar) {
      avatar.textContent = "L";
    }

    if (profileAvatar) {
      profileAvatar.textContent = "L";
    }

    if (signInBtn) {
      signInBtn.style.display =
        "";
    }

    if (signOutBtn) {
      signOutBtn.style.display =
        "none";
    }

    return;
  }

  const {
    data: profile,
    error
  } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {

    console.error(
      "Profile load error:",
      error
    );
  }

  const name =
    getUserName(
      user,
      profile
    );

  if (profileName) {
    profileName.textContent =
      name;
  }

  if (profileEmail) {
    profileEmail.textContent =
      user.email || "";
  }

  const letter =
    name
      .charAt(0)
      .toUpperCase();

  if (avatar) {
    avatar.textContent =
      letter;
  }

  if (profileAvatar) {
    profileAvatar.textContent =
      letter;
  }

  if (signInBtn) {
    signInBtn.style.display =
      "none";
  }

  if (signOutBtn) {
    signOutBtn.style.display =
      "";
  }

  await loadNotificationSetting(
    user.id
  );
}

/* =========================================================
   AUTH SWITCH
========================================================= */

authSwitch?.addEventListener(
  "click",
  () => {

    isSignUpMode =
      !isSignUpMode;

    updateAuthScreen();

    if (authPassword) {
      authPassword.value =
        "";
    }
  }
);

/* =========================================================
   AUTH FORM
========================================================= */

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
      authEmail?.value.trim();

    const password =
      authPassword?.value;

    if (!email || !password) {

      showAuthMessage(
        "Please enter your email and password."
      );

      return;
    }

    if (password.length < 6) {

      showAuthMessage(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (authSubmit) {
      authSubmit.disabled =
        true;

      authSubmit.textContent =
        isSignUpMode
          ? "Creating..."
          : "Signing in...";
    }

    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

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

        if (authSubmit) {
          authSubmit.disabled =
            false;
        }

        updateAuthScreen();

        return;
      }

      if (
        data?.user &&
        data?.session
      ) {

        await createProfileForUser(
          data.user
        );

        if (authScreen) {
          authScreen.style.display =
            "none";
        }

        const app =
          document.getElementById(
            "app"
          );

        if (app) {
          app.style.display =
            "";
        }

        await loadUserProfile();

        showToast(
          "Account created successfully!"
        );

      } else {

        showAuthMessage(
          "Account created. Please check your email to verify your account."
        );

        isSignUpMode =
          false;

        updateAuthScreen();
      }

    }

    /* =====================================================
       SIGN IN
    ===================================================== */

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

        if (authSubmit) {
          authSubmit.disabled =
            false;
        }

        updateAuthScreen();

        return;
      }

      if (data?.user) {

        await createProfileForUser(
          data.user
        );

        if (authScreen) {
          authScreen.style.display =
            "none";
        }

        const app =
          document.getElementById(
            "app"
          );

        if (app) {
          app.style.display =
            "";
        }

        await loadUserProfile();

        showToast(
          "Signed in successfully."
        );
      }
    }

    if (authSubmit) {
      authSubmit.disabled =
        false;
    }

    updateAuthScreen();
  }
);

/* =========================================================
   SIGN OUT
========================================================= */

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

  currentConversation =
    null;

  const app =
    document.getElementById(
      "app"
    );

  if (app) {
    app.style.display =
      "none";
  }

  if (authScreen) {
    authScreen.style.display =
      "flex";
  }

  if (authEmail) {
    authEmail.value =
      "";
  }

  if (authPassword) {
    authPassword.value =
      "";
  }

  isSignUpMode =
    false;

  updateAuthScreen();

  showToast(
    "Signed out successfully."
  );
}

const signOutBtn =
  document.getElementById(
    "signOutBtn"
  );

signOutBtn?.addEventListener(
  "click",
  async () => {
    await signOut();
  }
);

/* =========================================================
   SIGN IN BUTTON ON PROFILE
========================================================= */

const signInBtn =
  document.getElementById(
    "signInBtn"
  );

signInBtn?.addEventListener(
  "click",
  () => {

    if (authScreen) {
      authScreen.style.display =
        "flex";
    }

    const app =
      document.getElementById(
        "app"
      );

    if (app) {
      app.style.display =
        "none";
    }
  }
);

/* =========================================================
   AUTH INITIALIZATION
========================================================= */

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
      document.getElementById(
        "app"
      );

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
      document.getElementById(
        "app"
      );

    if (app) {
      app.style.display =
        "none";
    }
  }

  updateAuthScreen();
}

/* =========================================================
   AUTH STATE CHANGE
========================================================= */

if (db) {

  db.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {

      console.log(
        "Auth event:",
        event
      );

      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {

        await createProfileForUser(
          session.user
        );

        await loadUserProfile();
      }

      if (
        event === "SIGNED_OUT"
      ) {

        const app =
          document.getElementById(
            "app"
          );

        if (app) {
          app.style.display =
            "none";
        }

        if (authScreen) {
          authScreen.style.display =
            "flex";
        }
      }
    }
  );
}

/* =========================================================
   CHAT
========================================================= */

const chatForm =
  document.getElementById(
    "chatForm"
  );

const chatInput =
  document.getElementById(
    "chatInput"
  );

const messages =
  document.getElementById(
    "messages"
  );

const newChatBtn =
  document.getElementById(
    "newChatBtn"
  );

let currentConversation =
  null;

function addMessage(
  role,
  content
) {

  if (!messages) {
    return;
  }

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    `message ${role}`;

  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "message-bubble";

  bubble.textContent =
    content;

  wrapper.appendChild(
    bubble
  );

  messages.appendChild(
    wrapper
  );

  messages.scrollTop =
    messages.scrollHeight;
}

async function createConversation() {

  if (!db) {

    showToast(
      "Supabase connection not ready."
    );

    return null;
  }

  const user =
    await getCurrentUser();

  if (!user) {

    showToast(
      "Sign in to save your conversations."
    );

    return null;
  }

  const {
    data,
    error
  } = await db
    .from("conversations")
    .insert({
      user_id:
        user.id,
      title:
        "New conversation"
    })
    .select()
    .single();

  if (error) {

    console.error(
      "Conversation error:",
      error
    );

    showToast(
      "Could not create conversation."
    );

    return null;
  }

  currentConversation =
    data;

  return data;
}

async function saveMessage(
  conversationId,
  role,
  content
) {

  if (
    !db ||
    !conversationId
  ) {
    return;
  }

  const user =
    await getCurrentUser();

  if (!user) {
    return;
  }

  const {
    error
  } = await db
    .from("messages")
    .insert({
      conversation_id:
        conversationId,
      user_id:
        user.id,
      role,
      content
    });

  if (error) {

    console.error(
      "Message save error:",
      error
    );
  }
}

async function sendMessage(
  text
) {

  if (!text.trim()) {
    return;
  }

  addMessage(
    "user",
    text
  );

  if (!currentConversation) {
    await createConversation();
  }

  if (currentConversation) {

    await saveMessage(
      currentConversation.id,
      "user",
      text
    );
  }

  const response =
    "LEX AI is ready. Connect your AI provider/API to enable full AI responses.";

  setTimeout(
    async () => {

      addMessage(
        "assistant",
        response
      );

      if (currentConversation) {

        await saveMessage(
          currentConversation.id,
          "assistant",
          response
        );
      }

    },
    500
  );
}

chatForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const text =
      chatInput?.value || "";

    if (!text.trim()) {
      return;
    }

    chatInput.value =
      "";

    await sendMessage(
      text
    );
  }
);

chatInput?.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      chatForm?.requestSubmit();
    }
  }
);

newChatBtn?.addEventListener(
  "click",
  () => {

    currentConversation =
      null;

    if (messages) {

      messages.innerHTML = `
        <div class="welcome-message">

          <div class="ai-avatar">
            LX
          </div>

          <div>

            <strong>
              New conversation
            </strong>

            <p>
              What would you like to work on?
            </p>

          </div>

        </div>
      `;
    }
  }
);

/* =========================================================
   CV
========================================================= */

const createCvBtn =
  document.getElementById(
    "createCvBtn"
  );

createCvBtn?.addEventListener(
  "click",
  async () => {

    if (!db) {

      showToast(
        "Supabase connection not ready."
      );

      return;
    }

    const user =
      await getCurrentUser();

    if (!user) {

      showToast(
        "Sign in before creating a CV."
      );

      return;
    }

    const {
      error
    } = await db
      .from("cv_projects")
      .insert({
        user_id:
          user.id,
        title:
          "My CV",
        data: {}
      });

    if (error) {

      console.error(
        "CV error:",
        error
      );

      showToast(
        "Could not create CV."
      );

      return;
    }

    showToast(
      "CV project created successfully."
    );
  }
);

/* =========================================================
   TRANSLATION
========================================================= */

const translateBtn =
  document.getElementById(
    "translateBtn"
  );

const translateInput =
  document.getElementById(
    "translateInput"
  );

const translateOutput =
  document.getElementById(
    "translateOutput"
  );

const sourceLanguage =
  document.getElementById(
    "sourceLanguage"
  );

const targetLanguage =
  document.getElementById(
    "targetLanguage"
  );

translateBtn?.addEventListener(
  "click",
  async () => {

    const text =
      translateInput?.value.trim();

    if (!text) {

      showToast(
        "Enter text to translate."
      );

      return;
    }

    if (translateOutput) {

      translateOutput.value =
        "Translation engine will be connected next.";
    }

    showToast(
      "Translation request prepared."
    );
  }
);

/* =========================================================
   LANGUAGE SWAP
========================================================= */

const swapLanguage =
  document.getElementById(
    "swapLanguage"
  );

swapLanguage?.addEventListener(
  "click",
  () => {

    if (
      !sourceLanguage ||
      !targetLanguage
    ) {
      return;
    }

    const oldSource =
      sourceLanguage.value === "auto"
        ? "en"
        : sourceLanguage.value;

    const oldTarget =
      targetLanguage.value;

    sourceLanguage.value =
      oldTarget;

    targetLanguage.value =
      oldSource;
  }
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

const notificationsToggle =
  document.getElementById(
    "notificationsToggle"
  );

async function loadNotificationSetting(
  userId
) {

  if (
    !db ||
    !notificationsToggle ||
    !userId
  ) {
    return;
  }

  const {
    data,
    error
  } = await db
    .from("user_settings")
    .select("notifications")
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (error) {

    console.error(
      "Notification load error:",
      error
    );

    return;
  }

  if (data) {

    notificationsToggle.checked =
      Boolean(
        data.notifications
      );
  }
}

notificationsToggle?.addEventListener(
  "change",
  async () => {

    if (!db) {
      return;
    }

    const user =
      await getCurrentUser();

    if (!user) {

      showToast(
        "Sign in to change notification settings."
      );

      notificationsToggle.checked =
        !notificationsToggle.checked;

      return;
    }

    const {
      error
    } = await db
      .from("user_settings")
      .upsert(
        {
          user_id:
            user.id,
          notifications:
            notificationsToggle.checked,
          updated_at:
            new Date().toISOString()
        },
        {
          onConflict:
            "user_id"
        }
      );

    if (error) {

      console.error(
        "Notification save error:",
        error
      );

      showToast(
        "Could not save notification setting."
      );

      return;
    }

    showToast(
      "Notification setting saved."
    );
  }
);

/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeLexOne() {

  showPage("home");

  updateAuthScreen();

  await initializeAuth();

  console.log(
    "LEX ONE initialized successfully."
  );
}

initializeLexOne();
