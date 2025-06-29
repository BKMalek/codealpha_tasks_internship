// Image upload functionality
document.getElementById("image-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profile-img").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Header background on scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)";
    header.style.boxShadow = "0 2px 20px rgba(37, 99, 235, 0.1)";
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)";
    header.style.boxShadow = "none";
  }
});

// Animate skill bars on scroll
const animateSkillBarsOnScroll = () => {
  const skillBars = document.querySelectorAll(".skill-progress");
  skillBars.forEach((bar) => {
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const width = bar.getAttribute("data-width");
      bar.style.width = width;
    }
  });
};

// Fade in animation on scroll
const animateOnScroll = () => {
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      element.classList.add("visible");
    }
  });
};

// Contact form submission
document
  .querySelector(".contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const name = formData.get("name");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    // Simple validation
    if (!name || !email || !subject || !message) {
      alert("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Simulate form submission
    const submitBtn = this.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    setTimeout(() => {
      alert("Thank you for your message! I'll get back to you soon.");
      this.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });

// Mobile menu toggle
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active");

  // Animate hamburger menu
  const spans = mobileMenu.querySelectorAll("span");
  if (navLinks.classList.contains("active")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
  } else {
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  }
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    const spans = mobileMenu.querySelectorAll("span");
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  });
});

// Initialize animations on scroll
window.addEventListener("scroll", () => {
  animateSkillBarsOnScroll();
  animateOnScroll();
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  animateSkillBarsOnScroll();
  animateOnScroll();
});

// Typing effect for hero subtitle
const subtitle = document.querySelector(".hero .subtitle");
const text = "Computer Science Student";
let index = 0;

function typeWriter() {
  if (index < text.length) {
    subtitle.textContent = text.slice(0, index + 1);
    index++;
    setTimeout(typeWriter, 100);
  }
}

// Start typing effect after page load
setTimeout(typeWriter, 1000);

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  const rate = scrolled * -0.5;

  if (hero) {
    hero.style.transform = `translateY(${rate}px)`;
  }
});

// Add active class to navigation links based on scroll position
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Smooth reveal animation for project cards
const observerOptionsConfig = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptionsConfig);

// Observe all fade-in elements
document.querySelectorAll(".fade-in").forEach((el) => {
  scrollObserver.observe(el);
});

// Add loading animation
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Preloader (optional)
window.addEventListener("load", () => {
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);
  }
});

// Particle.js Configuration
window.particlesJS("particles-js", {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#ff6b9d",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000",
      },
    },
    opacity: {
      value: 0.5,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ff6b9d",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 6,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "repulse",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
});

// Custom Cursor
const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

window.addEventListener("mousemove", (e) => {
  const posX = e.clientX;
  const posY = e.clientY;

  cursorDot.style.left = `${posX}px`;
  cursorDot.style.top = `${posY}px`;

  cursorOutline.style.left = `${posX}px`;
  cursorOutline.style.top = `${posY}px`;

  cursorOutline.animate(
    {
      left: `${posX}px`,
      top: `${posY}px`,
    },
    { duration: 500, fill: "forwards" }
  );
});

// Navigation
const navbar = document.querySelector(".navbar");
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks2 = document.querySelectorAll(".nav-link");

// Navbar scroll effect
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile menu toggle
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
navLinks2.forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// Smooth scrolling
navLinks2.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Active navigation link
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      navLinks2.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
});

// Theme Toggle - Start with Light Mode
const themeToggle = document.querySelector(".theme-toggle");
let isDark = false; // Start with light mode

// Set initial theme
document.documentElement.setAttribute("data-theme", "light");

themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light"
  );

  const icon = themeToggle.querySelector("i");
  icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
});

// Image Upload
const imageInput = document.getElementById("image-input");
const profileImg = document.getElementById("profile-img");

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Counter Animation
const counters = document.querySelectorAll(".stat-number");

const animateCounters = () => {
  counters.forEach((counter) => {
    const target = Number.parseInt(counter.getAttribute("data-target"));
    const count = Number.parseInt(counter.innerText);
    const increment = target / 100;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(() => animateCounters(), 20);
    } else {
      counter.innerText = target;
    }
  });
};

// Typing Animation for Code Block
const codeElement = document.querySelector(".typing-code");
const codeText = `class MalekBenKhalfallah:
      def __init__(self):
          self.name = "Malek Ben Khalfallah"
          self.role = "CS Student & Developer"
          self.specialization = "Microcomputing & Embedded Systems"
          self.languages = ["C/C++", "Python", "JavaScript", "Java"]
          self.passion = "Turning ideas into reality"
          
      def get_skills(self):
          return {
              "technical": ["Embedded Systems", "Web Dev", "Mobile Dev"],
              "soft": ["Problem Solving", "Leadership", "Teamwork"]
          }
          
      def current_focus(self):
          return "Building innovative solutions that matter"`;

let i = 0;
const typeWriterFunc = () => {
  if (i < codeText.length) {
    codeElement.textContent += codeText.charAt(i);
    i++;
    setTimeout(typeWriterFunc, 50);
  }
};

// Skills Section - Fix the category switching
const skillCategories = document.querySelectorAll(".skill-category");
const skillGroups = document.querySelectorAll(".skill-group");

// Function to animate skill bars for a specific group
const animateSkillBarsForGroup = (group) => {
  const skillBars = group.querySelectorAll(".skill-progress");
  skillBars.forEach((bar) => {
    const width = bar.getAttribute("data-width");
    bar.style.width = width;
  });
};

skillCategories.forEach((category) => {
  category.addEventListener("click", () => {
    const targetGroup = category.getAttribute("data-category");

    // Update active category
    skillCategories.forEach((cat) => cat.classList.remove("active"));
    category.classList.add("active");

    // Show target group
    skillGroups.forEach((group) => {
      group.classList.add("hidden");
      if (group.getAttribute("data-group") === targetGroup) {
        group.classList.remove("hidden");
        // Animate skill bars for the visible group
        setTimeout(() => {
          animateSkillBarsForGroup(group);
        }, 100);
      }
    });
  });
});

// Initialize skills section on page load
document.addEventListener("DOMContentLoaded", () => {
  // Show technical skills by default
  const technicalGroup = document.querySelector('[data-group="technical"]');
  if (technicalGroup) {
    technicalGroup.classList.remove("hidden");
    setTimeout(() => {
      animateSkillBarsForGroup(technicalGroup);
    }, 500);
  }
});

// Projects Filter - Fix the filtering system
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-filter");

    // Update active filter
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Filter projects with animation
    projectCards.forEach((card, index) => {
      const category = card.getAttribute("data-category");

      if (filter === "all" || category === filter) {
        card.style.display = "block";
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
          card.style.transition = "all 0.5s ease";
        }, index * 100);
      } else {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        setTimeout(() => {
          card.style.display = "none";
        }, 300);
      }
    });
  });
});

// Contact Form
const contactForm = document.querySelector(".contact-form");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");

  // Basic validation
  if (!name || !email || !subject || !message) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  // Simulate form submission
  const submitBtn = contactForm.querySelector(".btn");
  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML =
    '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
  submitBtn.disabled = true;

  setTimeout(() => {
    showNotification(
      "Message sent successfully! I'll get back to you soon.",
      "success"
    );
    contactForm.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 2000);
});

// Notification System
const showNotification = (message, type) => {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
      <i class="fas ${
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
      }"></i>
      <span>${message}</span>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
};

// Scroll Animations
const scrollObserverOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const scrollObserver2 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");

      // Trigger specific animations
      if (entry.target.classList.contains("hero-stats")) {
        animateCounters();
      }

      if (entry.target.classList.contains("code-window")) {
        setTimeout(typeWriterFunc, 500);
      }

      if (entry.target.classList.contains("skills-grid")) {
        const activeGroup = document.querySelector(".skill-group:not(.hidden)");
        if (activeGroup) {
          animateSkillBarsForGroup(activeGroup);
        }
      }
    }
  });
}, scrollObserverOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-in-left, .slide-in-right, .hero-stats, .code-window, .skills-grid"
  );
  animatedElements.forEach((el) => scrollObserver2.observe(el));

  // Add animation classes
  document
    .querySelectorAll(".about-text .text-block")
    .forEach((block, index) => {
      block.classList.add("fade-in");
      block.style.animationDelay = `${index * 0.2}s`;
    });

  document.querySelectorAll(".project-card").forEach((card, index) => {
    card.classList.add("fade-in");
    card.style.animationDelay = `${index * 0.1}s`;
  });
});

// Parallax Effect
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll(".hero-visual");

  parallaxElements.forEach((element) => {
    const speed = 0.5;
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Loading Animation
window.addEventListener("load", () => {
  document.body.classList.add("loading");
});

// Add CSS for notifications
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--dark-card);
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow-lg);
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 10000;
    border-left: 4px solid var(--primary-color);
  }
  
  .notification.success {
    border-left-color: #27ae60;
  }
  
  .notification.error {
    border-left-color: #e74c3c;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification i {
    font-size: 1.2rem;
  }
  
  .notification.success i {
    color: #27ae60;
  }
  
  .notification.error i {
    color: #e74c3c;
  }
  `;

// Inject notification styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Resume Download and Preview Functionality
function downloadResume() {
  // Create resume content
  const resumeContent = generateResumeHTML();

  // Create a new window for PDF generation
  const printWindow = window.open("", "_blank");
  printWindow.document.write(resumeContent);
  printWindow.document.close();

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    printWindow.print();
    // Close window after printing (optional)
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };

  // Show download notification
  showNotification(
    "Resume download initiated! Use your browser's print dialog to save as PDF.",
    "success"
  );
}

function previewResume() {
  // Create modal
  const modal = document.createElement("div");
  modal.className = "resume-modal";
  modal.innerHTML = `
          <div class="resume-modal-content">
              <button class="resume-modal-close" onclick="closeResumeModal()">
                  <i class="fas fa-times"></i>
              </button>
              ${generateResumePreview()}
          </div>
      `;

  document.body.appendChild(modal);

  // Show modal
  setTimeout(() => {
    modal.classList.add("active");
  }, 100);
}

function closeResumeModal() {
  const modal = document.querySelector(".resume-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  }
}

function generateResumeHTML() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Malek Ben Khalfallah - Resume</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
          }
          .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px; 
              border-bottom: 3px solid #ff6b9d; 
          }
          .header h1 { 
              color: #ff6b9d; 
              font-size: 2.5em; 
              margin-bottom: 10px; 
          }
          .header p { 
              font-size: 1.2em; 
              color: #666; 
          }
          .contact-info { 
              display: flex; 
              justify-content: center; 
              gap: 20px; 
              margin-top: 15px; 
              flex-wrap: wrap;
          }
          .contact-info span { 
              color: #ff6b9d; 
              font-weight: bold; 
          }
          .section { 
              margin-bottom: 25px; 
          }
          .section h2 { 
              color: #ff6b9d; 
              font-size: 1.5em; 
              margin-bottom: 15px; 
              padding-bottom: 5px; 
              border-bottom: 2px solid #4ecdc4; 
          }
          .experience-item, .education-item, .project-item { 
              margin-bottom: 20px; 
              padding-left: 20px; 
              border-left: 3px solid #4ecdc4; 
          }
          .experience-item h3, .education-item h3, .project-item h3 { 
              color: #333; 
              font-size: 1.2em; 
          }
          .experience-item .date, .education-item .date { 
              color: #ff6b9d; 
              font-weight: bold; 
              font-size: 0.9em; 
          }
          .skills-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
          }
          .skill-category h3 { 
              color: #4ecdc4; 
              margin-bottom: 10px; 
          }
          .skill-list { 
              list-style: none; 
          }
          .skill-list li { 
              padding: 5px 0; 
              border-bottom: 1px solid #eee; 
          }
          .skill-list li:before { 
              content: "▸ "; 
              color: #ff6b9d; 
              font-weight: bold; 
          }
          @media print {
              body { font-size: 12px; }
              .header h1 { font-size: 2em; }
              .section h2 { font-size: 1.3em; }
          }
      </style>
  </head>
  <body>
      <div class="header">
          <h1>Malek Ben Khalfallah</h1>
          <p>Computer Science Student | Microcomputing & Embedded Systems Specialist</p>
          <div class="contact-info">
              <span>📧 malek.benkhalfallah@email.com</span>
              <span>💼 linkedin.com/in/malek-ben-khalfallah</span>
              <span>🔗 github.com/malekbk</span>
          </div>
      </div>
  
      <div class="section">
          <h2>Professional Summary</h2>
          <p>Passionate third-year Computer Science student specializing in Microcomputing and Embedded Systems. Experienced in full-stack development, mobile applications, and hardware programming. Strong background in quality management and commercial strategy with proven leadership and teamwork skills.</p>
      </div>
  
      <div class="section">
          <h2>Education</h2>
          <div class="education-item">
              <h3>Bachelor of Computer Science</h3>
              <div class="date">2022 - Present (3rd Year)</div>
              <p><strong>Specialization:</strong> Microcomputing & Embedded Systems</p>
              <p>Relevant Coursework: Data Structures, Algorithms, Embedded Systems, Microprocessor Programming, Software Engineering, Database Management</p>
          </div>
      </div>
  
      <div class="section">
          <h2>Technical Skills</h2>
          <div class="skills-grid">
              <div class="skill-category">
                  <h3>Programming Languages</h3>
                  <ul class="skill-list">
                      <li>C/C++ (Advanced)</li>
                      <li>JavaScript (Intermediate)</li>
                      <li>Python (Intermediate)</li>
                      <li>Java (Intermediate)</li>
                      <li>HTML5/CSS3 (Advanced)</li>
                  </ul>
              </div>
              <div class="skill-category">
                  <h3>Technologies & Tools</h3>
                  <ul class="skill-list">
                      <li>STM32 Microcontrollers</li>
                      <li>Arduino Platform</li>
                      <li>Git & GitHub</li>
                      <li>Android Studio</li>
                      <li>Linux/Unix Systems</li>
                  </ul>
              </div>
              <div class="skill-category">
                  <h3>Specializations</h3>
                  <ul class="skill-list">
                      <li>Embedded Systems</li>
                      <li>Web Development</li>
                      <li>Mobile App Development</li>
                      <li>Hardware Programming</li>
                      <li>IoT Development</li>
                  </ul>
              </div>
          </div>
      </div>
  
      <div class="section">
          <h2>Featured Projects</h2>
          
          <div class="project-item">
              <h3>Daily Planner Application Suite</h3>
              <p><strong>Technologies:</strong> HTML5, CSS3, JavaScript, Java, Android Studio, SQLite</p>
              <p>Developed both web and mobile versions of a comprehensive daily planning application in collaboration with a classmate. Features include task management, scheduling, and productivity tracking with seamless synchronization.</p>
          </div>
  
          <div class="project-item">
              <h3>STM32 Card Detection System</h3>
              <p><strong>Technologies:</strong> C/C++, STM32 Microcontroller, Hardware Programming</p>
              <p>Designed and implemented an embedded system for card detection using STM32 microcontroller. Collaborated with a classmate to develop efficient detection algorithms and hardware integration.</p>
          </div>
  
          <div class="project-item">
              <h3>Interactive Web Applications</h3>
              <p><strong>Technologies:</strong> HTML5, CSS3, JavaScript, Web APIs</p>
              <p>Created multiple web applications including an image gallery with upload functionality, a scientific calculator, and a music player with visualization features. Each project demonstrates proficiency in modern web technologies.</p>
          </div>
  
          <div class="project-item">
              <h3>Personal Portfolio Website</h3>
              <p><strong>Technologies:</strong> HTML5, CSS3, JavaScript, Particles.js</p>
              <p>Designed and developed a modern, interactive portfolio website featuring advanced animations, responsive design, and dynamic content management.</p>
          </div>
      </div>
  
      <div class="section">
          <h2>Professional Experience</h2>
          <div class="experience-item">
              <h3>Quality Management & Commercial Strategy</h3>
              <div class="date">Various Projects</div>
              <p>Gained practical experience in quality management processes and commercial strategy development through academic and professional projects. Developed strong analytical and problem-solving skills.</p>
          </div>
      </div>
  
      <div class="section">
          <h2>Core Competencies</h2>
          <div class="skills-grid">
              <div class="skill-category">
                  <h3>Technical Skills</h3>
                  <ul class="skill-list">
                      <li>Problem Solving</li>
                      <li>Algorithm Design</li>
                      <li>System Architecture</li>
                      <li>Code Optimization</li>
                  </ul>
              </div>
              <div class="skill-category">
                  <h3>Soft Skills</h3>
                  <ul class="skill-list">
                      <li>Team Leadership</li>
                      <li>Project Management</li>
                      <li>Communication</li>
                      <li>Analytical Thinking</li>
                  </ul>
              </div>
          </div>
      </div>
  
      <div class="section">
          <h2>Languages</h2>
          <p>Proficient in multiple languages with strong communication skills in technical and professional contexts.</p>
      </div>
  
      <div class="section">
          <h2>Interests & Goals</h2>
          <p>Passionate about the intersection of hardware and software development. Committed to continuous learning and staying current with emerging technologies in embedded systems and IoT. Seeking opportunities to apply technical skills in innovative projects that make a meaningful impact.</p>
      </div>
  </body>
  </html>`;
}

function generateResumePreview() {
  return `
          <div style="max-width: 600px; font-family: 'Poppins', sans-serif;">
              <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--primary-color);">
                  <h2 style="color: var(--primary-color); margin-bottom: 0.5rem;">Malek Ben Khalfallah</h2>
                  <p style="color: var(--text-secondary);">Computer Science Student | Microcomputing & Embedded Systems</p>
                  <div style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                      <p>📧 malek.benkhalfallah@email.com</p>
                      <p>💼 linkedin.com/in/malek-ben-khalfallah</p>
                      <p>🔗 github.com/malekbk</p>
                  </div>
              </div>
              
              <div style="margin-bottom: 1.5rem;">
                  <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Professional Summary</h3>
                  <p style="color: var(--text-secondary); line-height: 1.6;">Passionate third-year Computer Science student specializing in Microcomputing and Embedded Systems. Experienced in full-stack development, mobile applications, and hardware programming.</p>
              </div>
              
              <div style="margin-bottom: 1.5rem;">
                  <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Key Skills</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                      <div>
                          <strong style="color: var(--text-primary);">Programming:</strong>
                          <p style="color: var(--text-secondary); font-size: 0.9rem;">C/C++, JavaScript, Python, Java</p>
                      </div>
                      <div>
                          <strong style="color: var(--text-primary);">Specialization:</strong>
                          <p style="color: var(--text-secondary); font-size: 0.9rem;">Embedded Systems, Web Dev</p>
                      </div>
                  </div>
              </div>
              
              <div style="margin-bottom: 1.5rem;">
                  <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Featured Projects</h3>
                  <ul style="color: var(--text-secondary); line-height: 1.6;">
                      <li>Daily Planner Application Suite (Web & Mobile)</li>
                      <li>STM32 Card Detection System</li>
                      <li>Interactive Web Applications</li>
                      <li>Personal Portfolio Website</li>
                  </ul>
              </div>
              
              <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255, 107, 157, 0.2);">
                  <p style="color: var(--text-secondary); font-size: 0.9rem;">Click "Download Resume" to get the complete PDF version</p>
              </div>
          </div>
      `;
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("resume-modal")) {
    closeResumeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeResumeModal();
  }
});
