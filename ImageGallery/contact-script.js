// Contact page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize contact functionality
  const initContact = () => {
    setupContactForm();
    setupFAQ();
    setupFormValidation();
  };

  // Setup contact form
  const setupContactForm = () => {
    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("form-success");

    if (contactForm) {
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (validateContactForm()) {
          await submitContactForm(contactForm, successMessage);
        }
      });
    }
  };

  // Validate contact form
  const validateContactForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "subject",
      "message",
    ];

    let isValid = true;

    requiredFields.forEach((fieldName) => {
      const field = document.getElementById(fieldName);
      const value = field.value.trim();

      if (!value) {
        showFieldError(field, "This field is required");
        isValid = false;
      } else if (fieldName === "email" && !isValidEmail(value)) {
        showFieldError(field, "Please enter a valid email address");
        isValid = false;
      } else {
        clearFieldError(field);
      }
    });

    return isValid;
  };

  // Submit contact form
  const submitContactForm = async (form, successMessage) => {
    const submitBtn = form.querySelector(".submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    const btnIcon = submitBtn.querySelector(".btn-icon");

    // Show loading state
    btnText.style.display = "none";
    btnIcon.style.display = "none";
    btnLoader.style.display = "block";
    submitBtn.disabled = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Hide form and show success message
    form.style.display = "none";
    successMessage.style.display = "block";

    // Reset form after showing success
    setTimeout(() => {
      form.reset();
      form.style.display = "block";
      successMessage.style.display = "none";

      // Reset button state
      btnText.style.display = "block";
      btnIcon.style.display = "block";
      btnLoader.style.display = "none";
      submitBtn.disabled = false;
    }, 5000);
  };

  // Setup FAQ
  const setupFAQ = () => {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");

      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        // Close all other FAQ items
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove("active");
        });

        // Toggle current item
        if (!isActive) {
          item.classList.add("active");
        }
      });
    });
  };

  // Setup form validation
  const setupFormValidation = () => {
    const inputs = document.querySelectorAll(
      ".contact-form input, .contact-form textarea, .contact-form select"
    );

    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        validateField(input);
      });

      input.addEventListener("input", () => {
        if (input.classList.contains("error")) {
          validateField(input);
        }
      });
    });
  };

  // Validate individual field
  const validateField = (field) => {
    const value = field.value.trim();
    const fieldName = field.name || field.id;

    if (!value && field.required) {
      showFieldError(field, "This field is required");
      return false;
    }

    if (fieldName === "email" && value && !isValidEmail(value)) {
      showFieldError(field, "Please enter a valid email address");
      return false;
    }

    if (fieldName === "message" && value && value.length < 10) {
      showFieldError(field, "Message must be at least 10 characters long");
      return false;
    }

    clearFieldError(field);
    return true;
  };

  // Show field error
  const showFieldError = (field, message) => {
    field.classList.add("error");

    let errorElement = field.parentElement.querySelector(".field-error");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "field-error";
      errorElement.style.cssText = `
          color: #ff3366;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        `;
      field.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;
  };

  // Clear field error
  const clearFieldError = (field) => {
    field.classList.remove("error");

    const errorElement = field.parentElement.querySelector(".field-error");
    if (errorElement) {
      errorElement.remove();
    }
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Character counter for message field
  const setupCharacterCounter = () => {
    const messageField = document.getElementById("message");
    if (messageField) {
      const counter = document.createElement("div");
      counter.className = "character-counter";
      counter.style.cssText = `
          text-align: right;
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.25rem;
        `;
      messageField.parentElement.appendChild(counter);

      const updateCounter = () => {
        const length = messageField.value.length;
        const maxLength = 1000;
        counter.textContent = `${length}/${maxLength} characters`;

        if (length > maxLength * 0.9) {
          counter.style.color = "#ff3366";
        } else {
          counter.style.color = "#6c757d";
        }
      };

      messageField.addEventListener("input", updateCounter);
      updateCounter();
    }
  };

  // Auto-resize textarea
  const setupAutoResize = () => {
    const textareas = document.querySelectorAll("textarea");

    textareas.forEach((textarea) => {
      textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      });
    });
  };

  // Initialize all functionality
  initContact();
  setupCharacterCounter();
  setupAutoResize();
});
