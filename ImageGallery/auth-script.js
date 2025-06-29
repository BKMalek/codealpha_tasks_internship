document.addEventListener("DOMContentLoaded", () => {
  // Tab switching functionality
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Show corresponding form
      forms.forEach((form) => {
        form.classList.remove("active");
        if (form.id === `${target}-form`) {
          form.classList.add("active");
        }
      });
    });
  });

  // Password visibility toggle
  const passwordToggles = document.querySelectorAll(".password-toggle");

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        passwordInput.type = "password";
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });

  // Form validation
  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateInput = (input) => {
    const inputType = input.type;
    const value = input.value.trim();
    const errorMessage = input.parentElement.nextElementSibling;

    if (value === "") {
      input.classList.remove("valid");
      input.classList.add("error");
      errorMessage.classList.add("show");
      errorMessage.textContent = "This field is required";
      return false;
    }

    if (inputType === "email") {
      if (!validateEmail(value)) {
        input.classList.remove("valid");
        input.classList.add("error");
        errorMessage.classList.add("show");
        errorMessage.textContent = "Please enter a valid email address";
        return false;
      }
    }

    if (
      inputType === "password" &&
      input.id.includes("password") &&
      !input.id.includes("confirm")
    ) {
      if (!validatePassword(value)) {
        input.classList.remove("valid");
        input.classList.add("error");
        errorMessage.classList.add("show");
        errorMessage.textContent = "Password must be at least 8 characters";
        return false;
      }
    }

    if (input.id === "confirm-password") {
      const password = document.getElementById("signup-password").value;
      if (value !== password) {
        input.classList.remove("valid");
        input.classList.add("error");
        errorMessage.classList.add("show");
        errorMessage.textContent = "Passwords do not match";
        return false;
      }
    }

    input.classList.remove("error");
    input.classList.add("valid");
    errorMessage.classList.remove("show");
    return true;
  };

  // Add validation to all inputs
  const inputs = document.querySelectorAll(".form-input");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateInput(input);
    });

    input.addEventListener("input", () => {
      if (input.classList.contains("error")) {
        validateInput(input);
      }
    });
  });

  // Form submission
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");
  const successMessage = document.getElementById("auth-success");

  signinForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email");
    const password = document.getElementById("signin-password");

    const isEmailValid = validateInput(email);
    const isPasswordValid = validateInput(password);

    if (isEmailValid && isPasswordValid) {
      // Show loading state
      const submitBtn = signinForm.querySelector(".auth-btn");
      const btnText = submitBtn.querySelector(".btn-text");
      const btnLoader = submitBtn.querySelector(".btn-loader");

      btnText.classList.add("hide");
      btnLoader.classList.add("show");
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        // Redirect to dashboard (in a real app, this would happen after successful authentication)
        window.location.href = "dashboard.html";
      }, 1500);
    }
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");
    const confirmPassword = document.getElementById("confirm-password");
    const termsCheckbox = document.getElementById("terms-signup");

    const isNameValid = validateInput(name);
    const isEmailValid = validateInput(email);
    const isPasswordValid = validateInput(password);
    const isConfirmPasswordValid = validateInput(confirmPassword);

    if (!termsCheckbox.checked) {
      alert("Please agree to the Terms and Privacy Policy");
      return;
    }

    if (
      isNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    ) {
      // Show loading state
      const submitBtn = signupForm.querySelector(".auth-btn");
      const btnText = submitBtn.querySelector(".btn-text");
      const btnLoader = submitBtn.querySelector(".btn-loader");

      btnText.classList.add("hide");
      btnLoader.classList.add("show");
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        // Hide form and show success message
        signupForm.style.display = "none";
        successMessage.classList.add("show");
      }, 1500);
    }
  });
});
