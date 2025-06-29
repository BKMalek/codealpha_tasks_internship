// Home page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality
  initNavigation();
  initHeroAnimations();
  initCounters();
  initScrollEffects();
  initAuthCheck();
  initNewsletterForm();
  initLazyLoading();
  initBackToTop();
});

// Navigation functionality
function initNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navbar = document.querySelector("nav");

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");

      // Animate hamburger menu
      const bars = menuToggle.querySelectorAll(".bar");
      if (menuToggle.classList.contains("active")) {
        bars[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
      } else {
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      }
    });

    // Close menu when clicking on a link
    const navLinkItems = document.querySelectorAll(".nav-link");
    navLinkItems.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");

        // Reset hamburger menu
        const bars = menuToggle.querySelectorAll(".bar");
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");

        // Reset hamburger menu
        const bars = menuToggle.querySelectorAll(".bar");
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      }
    });
  }

  // Navbar scroll effect
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}

// Hero animations
function initHeroAnimations() {
  // Animate hero content on load
  const heroContent = document.querySelector(".hero-content");
  const heroVisual = document.querySelector(".hero-visual");

  if (heroContent) {
    setTimeout(() => {
      heroContent.style.opacity = "1";
      heroContent.style.transform = "translateY(0)";
    }, 300);
  }

  if (heroVisual) {
    setTimeout(() => {
      heroVisual.style.opacity = "1";
      heroVisual.style.transform = "translateY(0)";
    }, 600);
  }

  // Floating cards interaction
  const floatingCards = document.querySelectorAll(".floating-card");
  floatingCards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-15px) scale(1.05) rotate(5deg)";
      card.style.zIndex = "10";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.zIndex = "";
    });

    // Add click handler to simulate image modal
    card.addEventListener("click", () => {
      // In a real app, this would open the image in a modal
      console.log(`Opening image modal for card ${index + 1}`);
    });
  });
}

// Animated counters
function initCounters() {
  const counters = document.querySelectorAll(".stat-number[data-count]");
  let countersAnimated = false;

  const animateCounters = () => {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach((counter) => {
      const target = Number.parseInt(counter.getAttribute("data-count"));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = formatNumber(Math.floor(current));
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = formatNumber(target);
        }
      };

      updateCounter();
    });
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Trigger animation when stats section is visible
  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(statsSection);
  }

  // Also animate hero stats immediately
  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) {
    setTimeout(animateCounters, 1000);
  }
}

// Scroll effects and animations
function initScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".feature-card, .gallery-item, .testimonial-card, .stat-card"
  );

  animatedElements.forEach((el) => {
    observer.observe(el);
  });

  // Parallax effect for hero shapes
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const heroShapes = document.querySelectorAll(".hero-shape");

    heroShapes.forEach((shape, index) => {
      const speed = 0.5 + index * 0.2;
      shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
}

// Authentication check
function initAuthCheck() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userName = localStorage.getItem("userName");

  const authButtons = document.querySelector(".auth-buttons");
  const userMenu = document.querySelector(".user-menu");

  if (isLoggedIn && userName && userMenu) {
    // Show user menu, hide auth buttons
    if (authButtons) authButtons.style.display = "none";
    userMenu.style.display = "block";

    // Update user avatar and name
    const userAvatar = userMenu.querySelector(".user-avatar img");
    const userNameElement = userMenu.querySelector(".user-name");
    const userEmailElement = userMenu.querySelector(".user-email");

    if (userAvatar) {
      userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userName
      )}&background=ff3366&color=fff&size=40`;
    }
    if (userNameElement) {
      userNameElement.textContent = userName;
    }
    if (userEmailElement) {
      userEmailElement.textContent = localStorage.getItem("userEmail") || "";
    }
  } else {
    // Show auth buttons, hide user menu
    if (authButtons) authButtons.style.display = "flex";
    if (userMenu) userMenu.style.display = "none";
  }

  // Logout functionality
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("rememberMe");
      window.location.reload();
    });
  }
}

// Newsletter form
function initNewsletterForm() {
  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const email = emailInput.value.trim();

      if (email && isValidEmail(email)) {
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
          // Show success message
          const successMsg = document.createElement("div");
          successMsg.className = "newsletter-success";
          successMsg.innerHTML = `
              <div style="
                background: linear-gradient(135deg, #00d9b2, #1dd1a1);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                text-align: center;
                margin-top: 1rem;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0, 217, 178, 0.3);
              ">
                <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
                Thanks for subscribing! Check your email for confirmation.
              </div>
            `;

          newsletterForm.appendChild(successMsg);
          emailInput.value = "";

          // Reset button
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;

          // Remove success message after 5 seconds
          setTimeout(() => {
            successMsg.remove();
          }, 5000);
        }, 1500);
      } else {
        // Show error
        emailInput.style.borderColor = "#ff3366";
        emailInput.focus();

        setTimeout(() => {
          emailInput.style.borderColor = "";
        }, 3000);
      }
    });
  }

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Lazy loading for images
function initLazyLoading() {
  const lazyImages = document.querySelectorAll("img[data-src]");

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => {
    imageObserver.observe(img);
  });

  // Add loading effect to gallery items
  const galleryItems = document.querySelectorAll(".gallery-item");
  galleryItems.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";

    setTimeout(() => {
      item.style.transition = "all 0.6s ease";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// Back to top button
function initBackToTop() {
  const backToTop = document.createElement("button");
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--gradient-vibe);
      color: white;
      border: none;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 1.2rem;
    `;

  document.body.appendChild(backToTop);

  // Show/hide based on scroll position
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTop.style.opacity = "1";
      backToTop.style.visibility = "visible";
    } else {
      backToTop.style.opacity = "0";
      backToTop.style.visibility = "hidden";
    }
  });

  // Smooth scroll to top
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Add hover effect
  backToTop.addEventListener("mouseenter", () => {
    backToTop.style.transform = "translateY(-3px) scale(1.1)";
    backToTop.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
  });

  backToTop.addEventListener("mouseleave", () => {
    backToTop.style.transform = "translateY(0) scale(1)";
    backToTop.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  });
}

// Additional interactive features
document.addEventListener("DOMContentLoaded", () => {
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple animation
  const style = document.createElement("style");
  style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
  document.head.appendChild(style);

  // Feature card hover effects
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const icon = card.querySelector(".feature-icon");
      if (icon) {
        icon.style.transform = "scale(1.1) rotate(5deg)";
      }
    });

    card.addEventListener("mouseleave", () => {
      const icon = card.querySelector(".feature-icon");
      if (icon) {
        icon.style.transform = "scale(1) rotate(0deg)";
      }
    });
  });

  // Gallery item click handlers
  const galleryItems = document.querySelectorAll(".gallery-item");
  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      // In a real app, this would open the gallery page or modal
      window.location.href = "gallery.html";
    });
  });

  // Add loading states to CTA buttons
  const ctaButtons = document.querySelectorAll(".cta-actions .btn");
  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      if (button.href && !button.href.includes("#")) {
        e.preventDefault();

        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.style.pointerEvents = "none";

        setTimeout(() => {
          window.location.href = button.href;
        }, 800);
      }
    });
  });

  // Testimonial card interactions
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  testimonialCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const quoteIcon = card.querySelector(".quote-icon");
      if (quoteIcon) {
        quoteIcon.style.transform = "scale(1.2) rotate(5deg)";
        quoteIcon.style.color = "var(--secondary)";
      }
    });

    card.addEventListener("mouseleave", () => {
      const quoteIcon = card.querySelector(".quote-icon");
      if (quoteIcon) {
        quoteIcon.style.transform = "scale(1) rotate(0deg)";
        quoteIcon.style.color = "var(--primary)";
      }
    });
  });

  // Add keyboard navigation support
  document.addEventListener("keydown", (e) => {
    // ESC key to close mobile menu
    if (e.key === "Escape") {
      const navLinks = document.querySelector(".nav-links");
      const menuToggle = document.querySelector(".menu-toggle");

      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
      }
    }
  });

  // Performance optimization: Debounce scroll events
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      // Additional scroll-based animations can be added here
    }, 10);
  });
});
