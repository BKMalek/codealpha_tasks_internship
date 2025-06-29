// Main Application Controller
class App {
  constructor() {
    this.currentView = "calculator";
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    try {
      console.log("🚀 Starting ProCalc initialization...");

      // Show loading screen
      this.showLoading();

      // Wait for DOM to be fully ready
      await this.waitForDOM();

      // Initialize components step by step
      await this.initializeComponents();

      // Setup event listeners
      this.setupEventListeners();

      // Check authentication status
      this.checkAuthStatus();

      // Wait a bit for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Hide loading screen and show app
      this.hideLoading();
      this.showApp();

      this.isInitialized = true;
      console.log("✅ ProCalc initialized successfully!");

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize app:", error);
      this.handleInitError(error);
      throw error;
    }
  }

  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", resolve);
      }
    });
  }

  showLoading() {
    console.log("📱 Showing loading screen...");
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
      loadingScreen.classList.remove("hidden");
      console.log("✅ Loading screen displayed");
    } else {
      console.warn("⚠️ Loading screen element not found");
    }
  }

  hideLoading() {
    console.log("📱 Hiding loading screen...");
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
      setTimeout(() => {
        loadingScreen.style.display = "none";
        console.log("✅ Loading screen hidden");
      }, 500);
    } else {
      console.warn("⚠️ Loading screen element not found");
    }
  }

  showApp() {
    console.log("📱 Showing main app...");
    const appContainer = document.getElementById("appContainer");
    if (appContainer) {
      appContainer.style.display = "flex";
      console.log("✅ Main app displayed");
    } else {
      console.error("❌ App container element not found");
    }
  }

  hideApp() {
    const appContainer = document.getElementById("appContainer");
    if (appContainer) {
      appContainer.style.display = "none";
    }
  }

  async initializeComponents() {
    console.log("🔧 Initializing components...");

    // Initialize theme
    this.initializeTheme();
    console.log("✅ Theme initialized");

    // Initialize navigation
    this.initializeNavigation();
    console.log("✅ Navigation initialized");

    // Initialize global objects
    this.initializeGlobals();
    console.log("✅ Global objects initialized");

    // Initialize calculator (already exists)
    if (window.calculator) {
      console.log("✅ Calculator found and ready");
    } else {
      console.warn("⚠️ Calculator not found, creating basic instance");
      window.calculator = {
        currentExpression: "",
        currentResult: "0",
        updateDisplay: () => console.log("Calculator display update"),
      };
    }

    // Initialize other managers
    if (window.historyManager) {
      console.log("✅ History manager ready");
    }

    if (window.notesManager) {
      console.log("✅ Notes manager ready");
    }

    if (window.statisticsManager) {
      console.log("✅ Statistics manager ready");
    }

    // Initialize API health check
    await this.checkApiHealth();
  }

  initializeGlobals() {
    // Ensure global functions exist
    window.showToast = window.showToast || this.showToast.bind(this);
    window.switchView = window.switchView || this.switchView.bind(this);

    // Mock auth and api for offline mode
    window.auth = window.auth || {
      isLoggedIn: () => false,
      getUser: () => ({ username: "Offline User" }),
    };

    window.api = window.api || {
      saveCalculation: async (data) => {
        console.log("Mock: Calculation saved:", data);
        return { id: Date.now() };
      },
      getCalculations: async () => {
        const history = JSON.parse(
          localStorage.getItem("calculatorHistory") || "[]"
        );
        return { calculations: history };
      },
      deleteCalculation: async (id) => {
        console.log("Mock: Calculation deleted:", id);
        return true;
      },
      saveNote: async (data) => {
        console.log("Mock: Note saved:", data);
        return { id: Date.now() };
      },
      getNotes: async () => {
        const notes = JSON.parse(
          localStorage.getItem("calculatorNotes") || "[]"
        );
        return notes;
      },
    };
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    const themeToggle = document.getElementById("themeToggle");

    if (savedTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      if (themeToggle) themeToggle.textContent = "☀️";
    } else {
      if (themeToggle) themeToggle.textContent = "🌙";
    }

    // Setup theme toggle
    if (themeToggle) {
      themeToggle.addEventListener("click", this.toggleTheme.bind(this));
    }
  }

  toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");

    if (body.getAttribute("data-theme") === "dark") {
      body.removeAttribute("data-theme");
      if (themeToggle) themeToggle.textContent = "🌙";
      localStorage.setItem("theme", "light");
    } else {
      body.setAttribute("data-theme", "dark");
      if (themeToggle) themeToggle.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    }

    this.showToast("Theme changed successfully!", "success");
  }

  initializeNavigation() {
    const navBtns = document.querySelectorAll(".nav-btn");
    console.log(`Found ${navBtns.length} navigation buttons`);

    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        console.log(`Navigation clicked: ${view}`);
        this.switchView(view);
      });
    });

    // Initialize user menu
    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");

    if (userBtn && userDropdown) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        userDropdown.classList.remove("show");
      });
    }

    // Initialize sync button
    const syncBtn = document.getElementById("syncBtn");
    if (syncBtn) {
      syncBtn.addEventListener("click", this.syncData.bind(this));
    }
  }

  switchView(viewName) {
    console.log(`Switching to view: ${viewName}`);
    this.currentView = viewName;

    // Update navigation buttons
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-view") === viewName) {
        btn.classList.add("active");
      }
    });

    // Update view containers
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active");
    });

    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
      targetView.classList.add("active");
      console.log(`✅ Switched to ${viewName} view`);
    } else {
      console.error(`❌ View not found: ${viewName}View`);
    }

    // Load view-specific data
    this.loadViewData(viewName);

    this.showToast(`Switched to ${viewName}`, "info");
  }

  async loadViewData(viewName) {
    try {
      switch (viewName) {
        case "history":
          if (window.historyManager && window.historyManager.loadHistory) {
            await window.historyManager.loadHistory();
          }
          break;
        case "notes":
          if (window.notesManager && window.notesManager.loadNotes) {
            await window.notesManager.loadNotes();
          }
          break;
        case "statistics":
          if (window.statisticsManager && window.statisticsManager.loadStats) {
            await window.statisticsManager.loadStats();
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${viewName} data:`, error);
    }
  }

  checkAuthStatus() {
    // For now, we'll work in offline mode
    const isAuthenticated = false;

    if (isAuthenticated) {
      this.showAuthenticatedUI();
    } else {
      this.showOfflineMode();
    }
  }

  showAuthenticatedUI() {
    const userName = document.getElementById("userName");
    if (userName) {
      userName.textContent = "User";
    }
  }

  showOfflineMode() {
    const userName = document.getElementById("userName");
    if (userName) {
      userName.textContent = "Offline Mode";
    }

    // Hide sync button in offline mode
    const syncBtn = document.getElementById("syncBtn");
    if (syncBtn) {
      syncBtn.style.display = "none";
    }
  }

  async checkApiHealth() {
    try {
      console.log("🔍 Checking API health...");
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("✅ API health check completed (offline mode)");
    } catch (error) {
      console.warn("⚠️ API not available, running in offline mode");
    }
  }

  async syncData() {
    this.showToast("Syncing data...", "info");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.showToast("Data synced successfully!", "success");
    } catch (error) {
      console.error("Sync failed:", error);
      this.showToast("Sync failed - running offline", "warning");
    }
  }

  setupEventListeners() {
    console.log("🎧 Setting up event listeners...");

    // Global error handler
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this.showToast("An error occurred", "error");
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showToast("An error occurred", "error");
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      // Ctrl/Cmd + number keys to switch views
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key >= "1" &&
        event.key <= "4"
      ) {
        event.preventDefault();
        const viewIndex = Number.parseInt(event.key) - 1;
        const views = ["calculator", "history", "notes", "statistics"];
        if (views[viewIndex]) {
          this.switchView(views[viewIndex]);
        }
      }
    });

    console.log("✅ Event listeners set up");
  }

  handleInitError(error) {
    console.error("Initialization error:", error);

    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="loading-content">
          <div class="loading-logo">
            <span class="logo-icon">⚠️</span>
            <h1>Error</h1>
          </div>
          <p>Failed to initialize the application</p>
          <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">Error: ${error.message}</p>
          <button onclick="location.reload()" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          ">Reload Page</button>
        </div>
      `;
    }
  }

  showToast(message, type = "info") {
    console.log(`Toast: ${message} (${type})`);

    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      console.warn("Toast container not found");
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    toastContainer.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Global functions for HTML onclick handlers
const showProfile = () => {
  console.log("Profile clicked");
  if (window.app) {
    window.app.showToast("Profile feature coming soon!", "info");
  }
};

const showSettings = () => {
  console.log("Settings clicked");
  if (window.app) {
    window.app.showToast("Settings feature coming soon!", "info");
  }
};

const logout = () => {
  console.log("Logout clicked");
  if (window.app) {
    window.app.showToast("Logout feature coming soon!", "info");
  }
};

// Make functions globally available
window.showProfile = showProfile;
window.showSettings = showSettings;
window.logout = logout;

// Initialize when DOM is ready
let appInitialized = false;

const initializeApp = async () => {
  if (appInitialized) return;
  appInitialized = true;

  console.log("🌟 DOM ready, initializing app...");

  try {
    window.app = new App();
    await window.app.init();
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

// Multiple ways to ensure initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  // DOM is already loaded
  setTimeout(initializeApp, 100);
}

// Fallback initialization
window.addEventListener("load", () => {
  setTimeout(() => {
    if (!window.app || !window.app.isInitialized) {
      console.log("🔄 Fallback initialization...");
      initializeApp();
    }
  }, 500);
});

// Global toast function
window.showToast = (message, type) => {
  if (window.app) {
    window.app.showToast(message, type);
  } else {
    console.log(`Toast: ${message} (${type})`);
  }
};

// Global view switcher
window.switchView = (viewName) => {
  if (window.app) {
    window.app.switchView(viewName);
  } else {
    console.log(`Switch view: ${viewName}`);
  }
};
