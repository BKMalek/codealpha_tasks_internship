// Connect Welcome Page to App
function setupWelcomePage() {
  const welcomePage = document.getElementById("welcomePage");
  const appContainer = document.getElementById("appContainer");
  const signInBtn = document.getElementById("signInBtn");
  const signUpBtn = document.getElementById("signUpBtn");
  const modalOverlay = document.getElementById("authModal");
  const closeModal = document.getElementById("closeModal");
  const authForm = document.getElementById("authForm");

  if (!welcomePage || !signInBtn || !signUpBtn || !modalOverlay) {
    console.warn("🚫 Welcome Page or buttons not found");
    return;
  }

  // Show modal
  const showModal = (mode) => {
    modalOverlay.classList.add("active");
    const title = modalOverlay.querySelector("h2");
    const submitBtn = authForm.querySelector("button[type='submit']");

    if (mode === "signup") {
      title.textContent = "Sign Up";
      submitBtn.textContent = "Create Account";
    } else {
      title.textContent = "Sign In";
      submitBtn.textContent = "Login";
    }
  };

  signInBtn.addEventListener("click", () => showModal("signin"));
  signUpBtn.addEventListener("click", () => showModal("signup"));

  closeModal?.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });

  authForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Fake login: hide welcome and show app
    welcomePage.style.display = "none";
    appContainer.style.display = "flex";
    modalOverlay.classList.remove("active");
    window.app?.showToast("Welcome to ProCalc!", "success");
  });
}

// Call it after DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  setupWelcomePage();
});
