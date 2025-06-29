// Upload functionality
document.addEventListener("DOMContentLoaded", () => {
  let uploadQueue = [];
  const uploadedFiles = [];

  // Initialize upload functionality
  const initUpload = () => {
    setupDropZone();
    setupFileInput();
    setupQueue();
    setupProgressTracking();
  };

  // Setup drop zone
  const setupDropZone = () => {
    const uploadArea = document.querySelector(".upload-area");
    const fileInput = document.getElementById("file-input");

    if (!uploadArea) return; // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ["dragenter", "dragover"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, highlight, false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    uploadArea.addEventListener("drop", handleDrop, false);

    // Handle click to browse
    const browseBtn = document.querySelector(".browse-btn");
    if (browseBtn) {
      browseBtn.addEventListener("click", () => {
        fileInput?.click();
      });
    }

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function highlight() {
      uploadArea.classList.add("dragover");
    }

    function unhighlight() {
      uploadArea.classList.remove("dragover");
    }

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    }
  };

  // Setup file input
  const setupFileInput = () => {
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
      });
    }
  };

  // Handle files
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    validFiles.forEach(addToQueue);
    updateQueueDisplay();
  };

  // Validate file
  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!validTypes.includes(file.type)) {
      alert(
        `${file.name} is not a valid image format. Please use JPG, PNG, GIF, or WebP.`
      );
      return false;
    }

    if (file.size > maxSize) {
      alert(`${file.name} is too large. Maximum file size is 15MB.`);
      return false;
    }

    return true;
  };

  // Add to queue
  const addToQueue = (file) => {
    const fileData = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "pending", // pending, uploading, completed, error
      preview: null,
      title: "",
      description: "",
      tags: [],
      category: "general",
    };

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      fileData.preview = e.target.result;
      updateQueueDisplay();
    };
    reader.readAsDataURL(file);

    uploadQueue.push(fileData);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Update queue display
  const updateQueueDisplay = () => {
    const queueList = document.querySelector(".queue-list");
    const uploadArea = document.querySelector(".upload-area");
    const uploadQueue_container = document.querySelector(".upload-queue");

    if (!queueList) return;

    if (uploadQueue.length === 0) {
      uploadQueue_container.style.display = "none";
      uploadArea.style.display = "block";
      return;
    }

    uploadQueue_container.style.display = "block";
    uploadArea.style.display = "none";

    queueList.innerHTML = uploadQueue
      .map((item) => createQueueItemHTML(item))
      .join("");

    // Add event listeners to queue items
    setupQueueItemEvents();
  };

  // Create queue item HTML
  const createQueueItemHTML = (item) => {
    const statusIcon = getStatusIcon(item.status);
    const progressWidth = item.progress || 0;

    return `
        <div class="queue-item" data-id="${item.id}">
          <div class="item-preview">
            ${
              item.preview
                ? `<img src="${item.preview}" alt="${item.name}">`
                : '<div class="preview-placeholder"><i class="fas fa-image"></i></div>'
            }
          </div>
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-size">${item.size}</div>
            <div class="item-progress">
              <div class="progress-fill" style="width: ${progressWidth}%"></div>
            </div>
            <div class="item-status">${statusIcon} ${item.status}</div>
          </div>
          <div class="item-actions">
            <button class="item-btn edit-btn" title="Edit details">
              <i class="fas fa-edit"></i>
            </button>
            <button class="item-btn delete-btn" title="Remove">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return '<i class="fas fa-clock"></i>';
      case "uploading":
        return '<i class="fas fa-spinner fa-spin"></i>';
      case "completed":
        return '<i class="fas fa-check"></i>';
      case "error":
        return '<i class="fas fa-exclamation-triangle"></i>';
      default:
        return "";
    }
  };

  // Setup queue item events
  const setupQueueItemEvents = () => {
    const editBtns = document.querySelectorAll(".edit-btn");
    const deleteBtns = document.querySelectorAll(".delete-btn");

    editBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = e.target.closest(".queue-item").dataset.id;
        openEditModal(itemId);
      });
    });

    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = e.target.closest(".queue-item").dataset.id;
        removeFromQueue(itemId);
      });
    });
  };

  // Remove from queue
  const removeFromQueue = (itemId) => {
    uploadQueue = uploadQueue.filter((item) => item.id != itemId);
    updateQueueDisplay();
  };

  // Open edit modal
  const openEditModal = (itemId) => {
    const item = uploadQueue.find((item) => item.id == itemId);
    if (!item) return;

    const modal = createEditModal(item);
    document.body.appendChild(modal);
  };

  // Create edit modal
  const createEditModal = (item) => {
    const modal = document.createElement("div");
    modal.className = "edit-modal";
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Edit Image Details</h3>
            <button class="modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="preview-section">
              <img src="${item.preview}" alt="${item.name}">
            </div>
            <form class="edit-form">
              <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="${
                  item.title
                }" placeholder="Enter image title">
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea name="description" placeholder="Describe your image">${
                  item.description
                }</textarea>
              </div>
              <div class="form-group">
                <label>Category</label>
                <select name="category">
                  <option value="general" ${
                    item.category === "general" ? "selected" : ""
                  }>General</option>
                  <option value="nature" ${
                    item.category === "nature" ? "selected" : ""
                  }>Nature</option>
                  <option value="urban" ${
                    item.category === "urban" ? "selected" : ""
                  }>Urban</option>
                  <option value="portrait" ${
                    item.category === "portrait" ? "selected" : ""
                  }>Portrait</option>
                  <option value="abstract" ${
                    item.category === "abstract" ? "selected" : ""
                  }>Abstract</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" name="tags" value="${item.tags.join(
                  ", "
                )}" placeholder="tag1, tag2, tag3">
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
      const form = modal.querySelector(".edit-form");
      const formData = new FormData(form);

      item.title = formData.get("title");
      item.description = formData.get("description");
      item.category = formData.get("category");
      item.tags = formData
        .get("tags")
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      updateQueueDisplay();
      closeModal();
    });

    return modal;
  };

  // Setup queue controls
  const setupQueue = () => {
    const uploadAllBtn = document.querySelector(".upload-all-btn");
    const clearAllBtn = document.querySelector(".clear-all-btn");

    if (uploadAllBtn) {
      uploadAllBtn.addEventListener("click", uploadAll);
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", clearAll);
    }
  };

  // Upload all files
  const uploadAll = async () => {
    const pendingFiles = uploadQueue.filter(
      (item) => item.status === "pending"
    );

    for (const item of pendingFiles) {
      await uploadFile(item);
    }

    // Show success message
    showUploadSuccess();
  };

  // Upload single file
  const uploadFile = (item) => {
    return new Promise((resolve) => {
      item.status = "uploading";
      updateQueueDisplay();

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        item.progress = Math.min(progress, 100);
        updateQueueDisplay();

        if (progress >= 100) {
          clearInterval(interval);
          item.status = "completed";
          item.progress = 100;
          uploadedFiles.push(item);
          updateQueueDisplay();
          resolve();
        }
      }, 200);
    });
  };

  // Clear all files
  const clearAll = () => {
    if (confirm("Are you sure you want to clear all files?")) {
      uploadQueue = [];
      updateQueueDisplay();
    }
  };

  // Show upload success
  const showUploadSuccess = () => {
    const uploadSection = document.querySelector(".upload-section");
    const successSection = document.querySelector(".upload-success");

    if (uploadSection && successSection) {
      uploadSection.style.display = "none";
      successSection.style.display = "block";
    }
  };

  // Setup progress tracking
  const setupProgressTracking = () => {
    // This would integrate with actual upload API
    // For now, we're using simulated progress
  };

  // Initialize
  initUpload();

  // Add some CSS for the edit modal
  const style = document.createElement("style");
  style.textContent = `
      .edit-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
      }
      
      .modal-content {
        position: relative;
        background: white;
        border-radius: 1rem;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #6c757d;
      }
      
      .modal-body {
        padding: 1.5rem;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .preview-section img {
        width: 100%;
        max-height: 200px;
        object-fit: cover;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e9ecef;
        border-radius: 0.5rem;
        font-family: inherit;
      }
      
      .form-group textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .modal-footer {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        border-top: 1px solid #e9ecef;
        justify-content: flex-end;
      }
    `;
  document.head.appendChild(style);
});
