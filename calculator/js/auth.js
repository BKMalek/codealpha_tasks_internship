// Authentication Management
class AuthManager {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      this.user = JSON.parse(userData);
      this.isAuthenticated = true;
      window.api.setToken(token);
    }
  }

  async login(email, password) {
    try {
      const response = await window.api.login({ email, password });

      this.user = response.user;
      this.isAuthenticated = true;
      window.api.setToken(response.token);
      localStorage.setItem("userData", JSON.stringify(response.user));

      window.showToast("Login successful!", "success");
      closeAuthModal();
      showApp();

      return response;
    } catch (error) {
      window.showToast(error.message || "Login failed", "error");
      throw error;
    }
  }

  async register(username, email, password) {
    try {
      const response = await window.api.register({ username, email, password });

      this.user = response.user;
      this.isAuthenticated = true;
      window.api.setToken(response.token);
      localStorage.setItem("userData", JSON.stringify(response.user));

      window.showToast("Account created successfully!", "success");
      closeAuthModal();
      showApp();

      return response;
    } catch (error) {
      window.showToast(error.message || "Registration failed", "error");
      throw error;
    }
  }

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    window.api.setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    window.showToast("Logged out successfully", "info");
    showAuthModal();
    hideApp();
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}

// Auth UI Functions
function showAuthModal() {
  document.getElementById("authModal").classList.add("active");
}

function closeAuthModal() {
  document.getElementById("authModal").classList.remove("active");
}

function switchToLogin() {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("authTitle").textContent = "Welcome Back";
}

function switchToRegister() {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("registerForm").classList.add("active");
  document.getElementById("authTitle").textContent = "Create Account";
}

function showApp() {
  document.getElementById("appContainer").style.display = "flex";
  if (auth.getUser()) {
    document.getElementById("userName").textContent = auth.getUser().username;
  }
}

function hideApp() {
  document.getElementById("appContainer").style.display = "none";
}

function triggerLogout() {
  auth.logout();
}

// Form Handlers
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    window.showToast("Please fill in all fields", "warning");
    return;
  }

  try {
    await auth.login(email, password);
  } catch (error) {
    console.error("Login error:", error);
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
      window.showToast("Please fill in all fields", "warning");
      return;
    }

    if (password !== confirmPassword) {
      window.showToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      window.showToast("Password must be at least 6 characters", "error");
      return;
    }

    try {
      await auth.register(username, email, password);
    } catch (error) {
      console.error("Registration error:", error);
    }
  });

// Create global auth instance
const auth = new AuthManager();

// Declare api and showToast variables
window.api = {
  login: async (credentials) => {
    // Mock login API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ user: { username: "testuser" }, token: "testtoken" });
      }, 1000);
    });
  },
  register: async (userData) => {
    // Mock register API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ user: { username: userData.username }, token: "testtoken" });
      }, 1000);
    });
  },
  setToken: (token) => {
    // Mock setToken function
    console.log("Token set:", token);
  },
};

window.showToast = (message, type) => {
  // Mock showToast function
  console.log(`Toast: ${message} (${type})`);
};

window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchToLogin = switchToLogin;
window.switchToRegister = switchToRegister;
window.showApp = showApp;
window.hideApp = hideApp;
window.logout = logout;
