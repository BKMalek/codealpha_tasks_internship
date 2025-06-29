// Gallery functionality
document.addEventListener("DOMContentLoaded", () => {
  let currentImages = [];
  let currentPage = 1;
  let isLoading = false;
  let currentFilter = "all";
  let currentSort = "latest";

  // Sample image data
  const sampleImages = [
    {
      id: 1,
      title: "Sunset Dreams",
      author: "Luna Martinez",
      authorAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      category: "nature",
      likes: 234,
      views: 1520,
      downloads: 89,
      tags: ["sunset", "nature", "landscape", "golden hour"],
      uploadDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Urban Vibes",
      author: "River Chen",
      authorAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      image:
        "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop",
      category: "urban",
      likes: 189,
      views: 892,
      downloads: 45,
      tags: ["city", "urban", "architecture", "modern"],
      uploadDate: "2024-01-14",
    },
    {
      id: 3,
      title: "Portrait Magic",
      author: "Sage Williams",
      authorAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
      category: "portrait",
      likes: 456,
      views: 2340,
      downloads: 123,
      tags: ["portrait", "woman", "beauty", "professional"],
      uploadDate: "2024-01-13",
    },
    // Add more sample images...
  ];

  // Initialize gallery
  const initGallery = () => {
    loadImages();
    setupFilters();
    setupSearch();
    setupModal();
    setupInfiniteScroll();
  };

  // Load images
  const loadImages = (append = false) => {
    if (isLoading) return;

    isLoading = true;
    const loadMoreBtn = document.querySelector(".load-more-btn");
    const btnText = loadMoreBtn?.querySelector(".btn-text");
    const btnLoader = loadMoreBtn?.querySelector(".btn-loader");

    if (loadMoreBtn) {
      btnText.style.display = "none";
      btnLoader.style.display = "block";
      loadMoreBtn.disabled = true;
    }

    // Simulate API call
    setTimeout(() => {
      const filteredImages = filterAndSortImages();
      const startIndex = append ? currentImages.length : 0;
      const newImages = filteredImages.slice(startIndex, startIndex + 12);

      if (append) {
        currentImages = [...currentImages, ...newImages];
      } else {
        currentImages = newImages;
      }

      renderImages(append);
      isLoading = false;

      if (loadMoreBtn) {
        btnText.style.display = "block";
        btnLoader.style.display = "none";
        loadMoreBtn.disabled = false;

        // Hide load more if no more images
        if (currentImages.length >= filteredImages.length) {
          loadMoreBtn.style.display = "none";
        }
      }
    }, 1000);
  };

  // Filter and sort images
  const filterAndSortImages = () => {
    let filtered = [...sampleImages];

    // Apply category filter
    if (currentFilter !== "all") {
      filtered = filtered.filter((img) => img.category === currentFilter);
    }

    // Apply search filter
    const searchQuery = new URLSearchParams(window.location.search).get(
      "search"
    );
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          img.title.toLowerCase().includes(query) ||
          img.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (currentSort) {
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "views":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "downloads":
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      default: // latest
        filtered.sort(
          (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
        );
    }

    return filtered;
  };

  // Render images
  const renderImages = (append = false) => {
    const galleryGrid = document.querySelector(".gallery-grid");
    if (!galleryGrid) return;

    if (!append) {
      galleryGrid.innerHTML = "";
    }

    currentImages.forEach((image, index) => {
      if (append && index < currentImages.length - 12) return;

      const imageElement = createImageElement(image);
      galleryGrid.appendChild(imageElement);
    });

    // Add stagger animation
    const newItems = galleryGrid.querySelectorAll(
      ".gallery-item:not(.animated)"
    );
    newItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("animated");
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 100);
    });
  };

  // Create image element
  const createImageElement = (image) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "all 0.3s ease";

    item.innerHTML = `
        <img src="${image.image}" alt="${image.title}" loading="lazy">
        <div class="gallery-item-overlay">
          <h3 class="gallery-item-title">${image.title}</h3>
          <p class="gallery-item-author">by ${image.author}</p>
          <div class="gallery-item-stats">
            <span><i class="fas fa-heart"></i> ${image.likes}</span>
            <span><i class="fas fa-eye"></i> ${image.views}</span>
            <span><i class="fas fa-download"></i> ${image.downloads}</span>
          </div>
        </div>
      `;

    item.addEventListener("click", () => openModal(image));
    return item;
  };

  // Setup filters
  const setupFilters = () => {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const sortSelect = document.querySelector(".sort-select");

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        currentPage = 1;
        loadImages();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        loadImages();
      });
    }
  };

  // Setup search
  const setupSearch = () => {
    const searchForm = document.querySelector(".search-wrapper");
    const searchInput = document.querySelector(".search-input");

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `gallery.html?search=${encodeURIComponent(
            query
          )}`;
        }
      });
    }

    // Load search results if search query exists
    const searchQuery = new URLSearchParams(window.location.search).get(
      "search"
    );
    if (searchQuery && searchInput) {
      searchInput.value = searchQuery;
    }
  };

  // Setup modal
  const setupModal = () => {
    const modal = document.querySelector(".image-modal");
    const closeBtn = document.querySelector(".modal-close");
    const prevBtn = document.querySelector(".nav-btn.prev");
    const nextBtn = document.querySelector(".nav-btn.next");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => navigateModal(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => navigateModal(1));
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (modal && modal.style.display === "flex") {
        switch (e.key) {
          case "Escape":
            closeModal();
            break;
          case "ArrowLeft":
            navigateModal(-1);
            break;
          case "ArrowRight":
            navigateModal(1);
            break;
        }
      }
    });
  };

  // Open modal
  let currentModalIndex = 0;

  const openModal = (image) => {
    const modal = document.querySelector(".image-modal");
    if (!modal) return;

    currentModalIndex = currentImages.findIndex((img) => img.id === image.id);
    updateModalContent(image);
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const closeModal = () => {
    const modal = document.querySelector(".image-modal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  // Navigate modal
  const navigateModal = (direction) => {
    currentModalIndex += direction;
    if (currentModalIndex < 0) currentModalIndex = currentImages.length - 1;
    if (currentModalIndex >= currentImages.length) currentModalIndex = 0;

    const image = currentImages[currentModalIndex];
    updateModalContent(image);
  };

  // Update modal content
  const updateModalContent = (image) => {
    const modalImage = document.querySelector(".modal-image");
    const imageTitle = document.querySelector(".image-title");
    const authorAvatar = document.querySelector(".author-avatar");
    const authorName = document.querySelector(".author-details h4");
    const imageStats = document.querySelector(".image-stats");
    const tagsContainer = document.querySelector(".tags-container");

    if (modalImage) modalImage.src = image.image;
    if (imageTitle) imageTitle.textContent = image.title;
    if (authorAvatar) authorAvatar.src = image.authorAvatar;
    if (authorName) authorName.textContent = image.author;

    if (imageStats) {
      imageStats.innerHTML = `
          <div class="stat-item">
            <i class="fas fa-heart"></i>
            <span>${image.likes} likes</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-eye"></i>
            <span>${image.views} views</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-download"></i>
            <span>${image.downloads} downloads</span>
          </div>
        `;
    }

    if (tagsContainer) {
      tagsContainer.innerHTML = image.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("");
    }
  };

  // Setup infinite scroll
  const setupInfiniteScroll = () => {
    const loadMoreBtn = document.querySelector(".load-more-btn");

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        loadImages(true);
      });
    }

    // Optional: Auto-load on scroll
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 1000
      ) {
        if (!isLoading && currentImages.length > 0) {
          loadImages(true);
        }
      }
    });
  };

  // Initialize
  initGallery();
});
