const {
  createClient
} = window.supabase;

const db = window.supabaseClient;

/* -----------------------------
   LEX ONE APP
----------------------------- */

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

/* -----------------------------
   NAVIGATION
----------------------------- */

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
    pageTitle.textContent = pageNames[pageName] || "LEX ONE";
  }

  sidebar?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

navItems.forEach(item => {
  item.addEventListener("click", () => {
    showPage(item.dataset.page);
  });
});

document.querySelectorAll("[data-page]").forEach(item => {
  item.addEventListener("click", () => {
    const page = item.dataset.page;

    if (page) {
      showPage(page);
    }
  });
});

menuBtn?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

/* -----------------------------
   TOAST
----------------------------- */

let toastTimer;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* -----------------------------
   THEME
----------------------------- */

const themeBtn = document.getElementById("themeBtn");
const settingsThemeBtn =
  document.getElementById("settingsThemeBtn");

function applyTheme(theme) {
  document.body.classList.toggle(
    "light",
    theme === "light"
  );

  localStorage.setItem("lex-one-theme", theme);
}

const savedTheme =
  localStorage.getItem("lex-one-theme") || "dark";

applyTheme(savedTheme);

function toggleTheme() {
  const isLight =
    document.body.classList.contains("light");

  applyTheme(isLight ? "dark" : "light");
}

themeBtn?.addEventListener("click", toggleTheme);

settingsThemeBtn?.addEventListener(
  "click",
  toggleTheme
);

/* -----------------------------
   CHAT
----------------------------- */

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const messages = document.getElementById("messages");
const newChatBtn = document.getElementById("newChatBtn");

let currentConversation = null;

function addMessage(role, content) {
  if (!messages) return;

  const wrapper =
    document.createElement("div");

  wrapper.className =
    `message ${role}`;

  const bubble =
    document.createElement("div");

  bubble.className =
    "message-bubble";

  bubble.textContent = content;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);

  messages.scrollTop =
    messages.scrollHeight;
}

async function createConversation() {
  if (!db) {
    showToast("Supabase connection not ready.");
    return null;
  }

  const {
    data: {
      user
    }
  } = await db.auth.getUser();

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
      user_id: user.id,
      title: "New conversation"
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    showToast("Could not create conversation.");
    return null;
  }

  currentConversation = data;

  return data;
}

async function saveMessage(
  conversationId,
  role,
  content
) {
  if (!db || !conversationId) return;

  const {
    data: {
      user
    }
  } = await db.auth.getUser();

  if (!user) return;

  const {
    error
  } = await db
    .from("messages")
    .insert({
      conversation_id:
        conversationId,
      user_id: user.id,
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

async function sendMessage(text) {
  if (!text.trim()) return;

  addMessage("user", text);

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

  /*
    AI BACKEND WILL BE CONNECTED NEXT.

    For now this is a safe demo response.
  */

  const response =
    "LEX AI is ready. Connect your AI provider/API to enable full AI responses.";

  setTimeout(async () => {
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
  }, 500);
}

chatForm?.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const text =
      chatInput?.value || "";

    if (!text.trim()) return;

    chatInput.value = "";

    await sendMessage(text);
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
    currentConversation = null;

    if (messages) {
      messages.innerHTML = `
        <div class="welcome-message">
          <div class="ai-avatar">LX</div>
          <div>
            <strong>New conversation</strong>
            <p>
              What would you like to work on?
            </p>
          </div>
        </div>
      `;
    }
  }
);

/* -----------------------------
   CV
----------------------------- */

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

    const {
      data: {
        user
      }
    } = await db.auth.getUser();

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
        user_id: user.id,
        title: "My CV",
        data: {}
      });

    if (error) {
      console.error(error);
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

/* -----------------------------
   TRANSLATION
----------------------------- */

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

    /*
      Translation API will be connected
      in the next backend step.
    */

    if (translateOutput) {
      translateOutput.value =
        "Translation engine will be connected next.";
    }

    showToast(
      "Translation request prepared."
    );
  }
);

/* -----------------------------
   LANGUAGE SWAP
----------------------------- */

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

/* -----------------------------
   PROFILE
----------------------------- */

async function loadUserProfile() {
  if (!db) return;

  const {
    data: {
      user
    }
  } = await db.auth.getUser();

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

  if (!user) {
    if (profileName)
      profileName.textContent =
        "Guest User";

    if (profileEmail)
      profileEmail.textContent =
        "Not signed in";

    return;
  }

  const {
    data: profile
  } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.display_name ||
    user.user_metadata
      ?.display_name ||
    user.email?.split("@")[0] ||
    "LEX ONE User";

  if (profileName)
    profileName.textContent =
      name;

  if (profileEmail)
    profileEmail.textContent =
      user.email || "";

  const letter =
    name.charAt(0).toUpperCase();

  if (avatar)
    avatar.textContent =
      letter;

  if (profileAvatar)
    profileAvatar.textContent =
      letter;
}

loadUserProfile();

/* -----------------------------
   AUTH STATE
----------------------------- */

if (db) {
  db.auth.onAuthStateChange(
    async () => {
      await loadUserProfile();
    }
  );
}

/* -----------------------------
   SIGN IN
----------------------------- */

const signInBtn =
  document.getElementById(
    "signInBtn"
  );

signInBtn?.addEventListener(
  "click",
  async () => {

    if (!db) {
      showToast(
        "Supabase connection not ready."
      );
      return;
    }

    const email =
      prompt(
        "Enter your email:"
      );

    if (!email) return;

    const password =
      prompt(
        "Enter your password:"
      );

    if (!password) return;

    const {
      error
    } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showToast(
        error.message
      );
      return;
    }

    showToast(
      "Signed in successfully."
    );

    await loadUserProfile();
  }
);

/* -----------------------------
   NOTIFICATIONS
----------------------------- */

const notificationsToggle =
  document.getElementById(
    "notificationsToggle"
  );

notificationsToggle?.addEventListener(
  "change",
  async () => {

    if (!db) return;

    const {
      data: {
        user
      }
    } = await db.auth.getUser();

    if (!user) return;

    await db
      .from("user_settings")
      .upsert({
        user_id: user.id,
        notifications:
          notificationsToggle.checked,
        updated_at:
          new Date().toISOString()
      });

    showToast(
      "Notification setting saved."
    );
  }
);

/* -----------------------------
   INITIALIZATION
----------------------------- */

showPage("home");

console.log(
  "LEX ONE initialized successfully."
);
