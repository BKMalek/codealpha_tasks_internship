// Authentication Functions

// Declare variables
let currentUser = null;
let isPlaying = false;
let currentSong = null;
let userData = {
  favorites: [],
  recentlyPlayed: [],
  playlists: {},
  uploadedSongs: [],
};

// Handle Sign In Form
document.getElementById("signinForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;

  if (email && password) {
    // Simulate authentication - in real app, this would call backend API
    currentUser = {
      email: email,
      name: email.split("@")[0],
      joinDate: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${
        email.split("@")[0]
      }&background=ff6b6b&color=fff`,
    };

    localStorage.setItem("soundwave_user", JSON.stringify(currentUser));
    closeAuthModal();
    showMainApp();

    // Show success message
    showNotification("Welcome back! Signed in successfully.", "success");
  } else {
    showNotification("Please fill in all fields.", "error");
  }
});

// Handle Sign Up Form
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showNotification("Please fill in all fields.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Passwords do not match!", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters long.", "error");
    return;
  }

  // Simulate account creation - in real app, this would call backend API
  currentUser = {
    email: email,
    name: name,
    joinDate: new Date().toISOString(),
    avatar: `https://ui-avatars.com/api/?name=${name}&background=ff6b6b&color=fff`,
  };

  localStorage.setItem("soundwave_user", JSON.stringify(currentUser));
  closeAuthModal();
  showMainApp();

  // Show success message
  showNotification(
    "Account created successfully! Welcome to SoundWave.",
    "success"
  );
});

// Social Login Functions (for future implementation)
function signInWithGoogle() {
  showNotification("Google Sign-In coming soon!", "info");
}

function signInWithFacebook() {
  showNotification("Facebook Sign-In coming soon!", "info");
}

function signInWithSpotify() {
  showNotification("Spotify Sign-In coming soon!", "info");
}

// Password Reset Function
function resetPassword() {
  const email = prompt("Enter your email address:");
  if (email) {
    // Simulate password reset - in real app, this would call backend API
    showNotification("Password reset link sent to your email!", "success");
  }
}

// Email Verification Function
function verifyEmail() {
  showNotification("Email verification sent!", "success");
}

// Update User Profile
function updateProfile(profileData) {
  if (currentUser) {
    currentUser = { ...currentUser, ...profileData };
    localStorage.setItem("soundwave_user", JSON.stringify(currentUser));
    showNotification("Profile updated successfully!", "success");
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return currentUser !== null;
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Logout function
function signOut() {
  currentUser = null;
  localStorage.removeItem("soundwave_user");
  localStorage.removeItem("soundwave_userdata");

  // Reset app state
  isPlaying = false;
  currentSong = null;
  userData = {
    favorites: [],
    recentlyPlayed: [],
    playlists: {},
    uploadedSongs: [],
  };

  // Redirect to landing page
  showLandingPage();
  showNotification("Signed out successfully!", "success");
}

// Session management
function refreshSession() {
  const user = localStorage.getItem("soundwave_user");
  if (user) {
    currentUser = JSON.parse(user);
    return true;
  }
  return false;
}

// Auto-logout after inactivity (optional)
let inactivityTimer;
const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  if (isAuthenticated()) {
    inactivityTimer = setTimeout(() => {
      showNotification(
        "Session expired due to inactivity. Please sign in again.",
        "warning"
      );
      signOut();
    }, INACTIVITY_TIME);
  }
}

// Track user activity
document.addEventListener("mousedown", resetInactivityTimer);
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keypress", resetInactivityTimer);
document.addEventListener("scroll", resetInactivityTimer);
document.addEventListener("touchstart", resetInactivityTimer);

// Initialize session on page load
document.addEventListener("DOMContentLoaded", () => {
  refreshSession();
  resetInactivityTimer();
});

// Notification System
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);

  // Add animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "exclamation-circle";
    case "warning":
      return "exclamation-triangle";
    case "info":
      return "info-circle";
    default:
      return "info-circle";
  }
}

// Add notification styles to CSS (this would normally be in the CSS file)
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 10px;
    padding: 1rem;
    color: white;
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    border-left: 4px solid #ff6b6b;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left-color: #4CAF50;
}

.notification-error {
    border-left-color: #f44336;
}

.notification-warning {
    border-left-color: #ff9800;
}

.notification-info {
    border-left-color: #2196F3;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.notification-content i:first-child {
    font-size: 1.2rem;
}

.notification-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 0.25rem;
    margin-left: auto;
    transition: color 0.3s ease;
}

.notification-close:hover {
    color: white;
}
`;

// Inject notification styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Mock functions to resolve errors. In a real application, these would be defined elsewhere.
function closeAuthModal() {}
function showMainApp() {}
function showLandingPage() {}
