// Profile page functionality
document.addEventListener("DOMContentLoaded", () => {
  let currentTab = "vibes";
  let currentUser = null;

  // Initialize profile
  const initProfile = () => {
    loadUserProfile();
    setupProfileTabs();
    setupProfileActions();
    loadProfileContent();
  };

  // Load user profile data
  const loadUserProfile = () => {
    // Get user data from localStorage or URL params
    const userName = localStorage.getItem("userName") || "Creative Soul";
    const userEmail =
      localStorage.getItem("userEmail") || "user@visualvibe.com";

    currentUser = {
      name: userName,
      email: userEmail,
      title: "Visual Artist & Creator",
      bio: "Passionate about capturing life's beautiful moments and sharing them with the world. Always exploring new perspectives and creative techniques.",
      location: "San Francisco, CA",
      website: "www.creativesoul.com",
      joinDate: "January 2024",
      stats: {
        vibes: 127,
        followers: 2840,
        following: 892,
        likes: 15600,
      },
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userName
      )}&background=ff3366&color=fff&size=150`,
    };

    updateProfileDisplay();
  };

  // Update profile display
  const updateProfileDisplay = () => {
    // Update profile header
    const profileAvatar = document.querySelector(".profile-avatar img");
    const profileName = document.querySelector(".profile-info h1");
    const profileTitle = document.querySelector(".profile-title");
    const profileBio = document.querySelector(".profile-bio");
    const profileStats = document.querySelectorAll(".stat .number");

    if (profileAvatar) profileAvatar.src = currentUser.avatar;
    if (profileName) profileName.textContent = currentUser.name;
    if (profileTitle) profileTitle.textContent = currentUser.title;
    if (profileBio) profileBio.textContent = currentUser.bio;

    // Update stats
    if (profileStats.length >= 4) {
      profileStats[0].textContent = currentUser.stats.vibes;
      profileStats[1].textContent = formatNumber(currentUser.stats.followers);
      profileStats[2].textContent = currentUser.stats.following;
      profileStats[3].textContent = formatNumber(currentUser.stats.likes);
    }
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

  // Setup profile tabs
  const setupProfileTabs = () => {
    const tabBtns = document.querySelectorAll(".profile-nav-btn");
    const tabContents = document.querySelectorAll(".profile-tab");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabName = btn.dataset.tab;

        // Update active tab
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Show corresponding content
        tabContents.forEach((content) => {
          content.classList.remove("active");
          if (content.id === `${tabName}-tab`) {
            content.classList.add("active");
          }
        });

        currentTab = tabName;
        loadTabContent(tabName);
      });
    });
  };

  // Load tab content
  const loadTabContent = (tabName) => {
    switch (tabName) {
      case "vibes":
        loadVibesContent();
        break;
      case "collections":
        loadCollectionsContent();
        break;
      case "liked":
        loadLikedContent();
        break;
      case "about":
        loadAboutContent();
        break;
    }
  };

  // Load vibes content
  const loadVibesContent = () => {
    const vibesGrid = document.querySelector("#vibes-tab .vibes-grid");
    if (!vibesGrid) return;

    const sampleVibes = [
      {
        id: 1,
        title: "Sunset Dreams",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
        likes: 234,
        views: 1520,
        downloads: 89,
      },
      {
        id: 2,
        title: "Urban Vibes",
        image:
          "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop",
        likes: 189,
        views: 892,
        downloads: 45,
      },
      {
        id: 3,
        title: "Portrait Magic",
        image:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
        likes: 456,
        views: 2340,
        downloads: 123,
      },
    ];

    vibesGrid.innerHTML = sampleVibes
      .map(
        (vibe) => `
          <div class="vibe-item">
            <div class="vibe-image">
              <img src="${vibe.image}" alt="${vibe.title}">
              <div class="vibe-overlay">
                <div class="vibe-stats">
                  <span><i class="fas fa-heart"></i> ${vibe.likes}</span>
                  <span><i class="fas fa-eye"></i> ${vibe.views}</span>
                  <span><i class="fas fa-download"></i> ${vibe.downloads}</span>
                </div>
              </div>
            </div>
          </div>
        `
      )
      .join("");
  };

  // Load collections content
  const loadCollectionsContent = () => {
    const collectionsGrid = document.querySelector(
      "#collections-tab .collections-grid"
    );
    if (!collectionsGrid) return;

    const sampleCollections = [
      {
        id: 1,
        title: "Nature Escapes",
        preview:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop",
        count: 24,
      },
      {
        id: 2,
        title: "City Life",
        preview:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop",
        count: 18,
      },
      {
        id: 3,
        title: "Portraits",
        preview:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=200&fit=crop",
        count: 32,
      },
    ];

    collectionsGrid.innerHTML = sampleCollections
      .map(
        (collection) => `
          <div class="collection-card">
            <div class="collection-preview">
              <img src="${collection.preview}" alt="${collection.title}">
              <div class="collection-overlay">${collection.count} vibes</div>
            </div>
            <div class="collection-info">
              <h3>${collection.title}</h3>
              <p>A curated collection of amazing visuals</p>
            </div>
          </div>
        `
      )
      .join("");
  };

  // Load liked content
  const loadLikedContent = () => {
    const likedGrid = document.querySelector("#liked-tab .liked-grid");
    if (!likedGrid) return;

    const sampleLiked = [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop",
    ];

    likedGrid.innerHTML = sampleLiked
      .map(
        (image) => `
          <div class="liked-item">
            <img src="${image}" alt="Liked image">
          </div>
        `
      )
      .join("");
  };

  // Load about content
  const loadAboutContent = () => {
    const aboutContent = document.querySelector("#about-tab .about-content");
    if (!aboutContent) return;

    aboutContent.innerHTML = `
        <div class="about-section">
          <h3>About Me</h3>
          <p>${currentUser.bio}</p>
          <p>I've been passionate about visual arts since childhood, and VisualVibe has become my favorite platform to share my creative journey with fellow artists and art enthusiasts.</p>
        </div>
        
        <div class="about-section">
          <h3>Tools & Equipment</h3>
          <div class="tools-list">
            <div class="tool-item">
              <i class="fas fa-camera"></i>
              <span>Canon EOS R5</span>
            </div>
            <div class="tool-item">
              <i class="fas fa-palette"></i>
              <span>Adobe Creative Suite</span>
            </div>
            <div class="tool-item">
              <i class="fas fa-laptop"></i>
              <span>MacBook Pro</span>
            </div>
            <div class="tool-item">
              <i class="fas fa-tablet-alt"></i>
              <span>iPad Pro</span>
            </div>
          </div>
        </div>
        
        <div class="about-section">
          <h3>Contact Information</h3>
          <div class="contact-info">
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <span>${currentUser.email}</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${currentUser.location}</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-globe"></i>
              <span>${currentUser.website}</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-calendar"></i>
              <span>Joined ${currentUser.joinDate}</span>
            </div>
          </div>
        </div>
        
        <div class="about-section">
          <h3>Connect With Me</h3>
          <div class="social-links">
            <a href="#" class="social-link instagram">
              <i class="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>
            <a href="#" class="social-link twitter">
              <i class="fab fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a href="#" class="social-link behance">
              <i class="fab fa-behance"></i>
              <span>Behance</span>
            </a>
          </div>
        </div>
      `;
  };

  // Setup profile actions
  const setupProfileActions = () => {
    const editBtn = document.querySelector(".btn-primary");
    const followBtn = document.querySelector(".btn-outline");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        openEditProfileModal();
      });
    }

    if (followBtn) {
      followBtn.addEventListener("click", () => {
        toggleFollow();
      });
    }
  };

  // Open edit profile modal
  const openEditProfileModal = () => {
    const modal = createEditProfileModal();
    document.body.appendChild(modal);
  };

  // Create edit profile modal
  const createEditProfileModal = () => {
    const modal = document.createElement("div");
    modal.className = "edit-profile-modal";
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Edit Profile</h3>
            <button class="modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <form class="edit-profile-form">
              <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" value="${currentUser.name}">
              </div>
              <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="${currentUser.title}">
              </div>
              <div class="form-group">
                <label>Bio</label>
                <textarea name="bio">${currentUser.bio}</textarea>
              </div>
              <div class="form-group">
                <label>Location</label>
                <input type="text" name="location" value="${currentUser.location}">
              </div>
              <div class="form-group">
                <label>Website</label>
                <input type="url" name="website" value="${currentUser.website}">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary cancel-btn">Cancel</button>
            <button class="btn btn-primary save-btn">Save Changes</button>
          </div>
        </div>
      `;

    // Add event listeners
    const closeBtn = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".cancel-btn");
    const saveBtn = modal.querySelector(".save-btn");
    const overlay = modal.querySelector(".modal-overlay");

    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    saveBtn.addEventListener("click", () => {
      const form = modal.querySelector(".edit-profile-form");
      const formData = new FormData(form);

      currentUser.name = formData.get("name");
      currentUser.title = formData.get("title");
      currentUser.bio = formData.get("bio");
      currentUser.location = formData.get("location");
      currentUser.website = formData.get("website");

      // Update localStorage
      localStorage.setItem("userName", currentUser.name);

      updateProfileDisplay();
      loadAboutContent(); // Refresh about content
      closeModal();
    });

    return modal;
  };

  // Toggle follow
  const toggleFollow = () => {
    const followBtn = document.querySelector(".btn-outline");
    if (followBtn.textContent.includes("Follow")) {
      followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
      followBtn.style.background = "var(--accent)";
      followBtn.style.borderColor = "var(--accent)";
      followBtn.style.color = "white";
    } else {
      followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
      followBtn.style.background = "transparent";
      followBtn.style.borderColor = "rgba(255, 255, 255, 0.3)";
      followBtn.style.color = "white";
    }
  };

  // Load initial content
  const loadProfileContent = () => {
    loadTabContent(currentTab);
  };

  // Initialize profile
  initProfile();

  // Add modal styles
  const modalStyles = `
      .edit-profile-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .edit-profile-modal .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
      }
      
      .edit-profile-modal .modal-content {
        position: relative;
        background: white;
        border-radius: 1rem;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      
      .edit-profile-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
      }
      
      .edit-profile-modal .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #6c757d;
      }
      
      .edit-profile-modal .modal-body {
        padding: 1.5rem;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .edit-profile-modal .form-group {
        margin-bottom: 1rem;
      }
      
      .edit-profile-modal .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      .edit-profile-modal .form-group input,
      .edit-profile-modal .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e9ecef;
        border-radius: 0.5rem;
        font-family: inherit;
      }
      
      .edit-profile-modal .form-group textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .edit-profile-modal .modal-footer {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        border-top: 1px solid #e9ecef;
        justify-content: flex-end;
      }
    `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);
});
