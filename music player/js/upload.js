// Upload Functionality

// File Upload Handler
class FileUploadManager {
  constructor() {
    this.allowedAudioTypes = [
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
    ];
    this.allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    this.maxAudioSize = 50 * 1024 * 1024; // 50MB
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
    this.uploadQueue = [];
    this.currentUploads = 0;
    this.maxConcurrentUploads = 3;

    this.setupUploadArea();
    this.setupFormHandlers();
  }

  setupUploadArea() {
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");

    // Drag and drop events
    uploadArea.addEventListener("dragover", this.handleDragOver.bind(this));
    uploadArea.addEventListener("dragleave", this.handleDragLeave.bind(this));
    uploadArea.addEventListener("drop", this.handleDrop.bind(this));

    // File input change
    fileInput.addEventListener("change", this.handleFileSelection.bind(this));

    // Click to upload
    uploadArea.addEventListener("click", () => {
      if (!uploadArea.classList.contains("has-files")) {
        fileInput.click();
      }
    });
  }

  setupFormHandlers() {
    const uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", this.handleFormSubmit.bind(this));

    // Auto-fill form when files are selected
    document
      .getElementById("fileInput")
      .addEventListener("change", this.autoFillForm.bind(this));
  }

  handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add("dragover");
  }

  handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("dragover");
  }

  handleDrop(event) {
    event.preventDefault();
    const uploadArea = event.currentTarget;
    uploadArea.classList.remove("dragover");

    const files = Array.from(event.dataTransfer.files);
    this.processFiles(files);
  }

  handleFileSelection(event) {
    const files = Array.from(event.target.files);
    this.processFiles(files);
  }

  processFiles(files) {
    const audioFiles = files.filter((file) =>
      this.allowedAudioTypes.includes(file.type)
    );
    const imageFiles = files.filter((file) =>
      this.allowedImageTypes.includes(file.type)
    );

    if (audioFiles.length === 0) {
      showNotification(
        "Please select valid audio files (MP3, WAV, OGG, M4A)",
        "error"
      );
      return;
    }

    // Validate file sizes
    const oversizedFiles = audioFiles.filter(
      (file) => file.size > this.maxAudioSize
    );
    if (oversizedFiles.length > 0) {
      showNotification(
        `Some files are too large. Maximum size is ${
          this.maxAudioSize / (1024 * 1024)
        }MB`,
        "error"
      );
      return;
    }

    // Show upload form
    this.showUploadForm(audioFiles, imageFiles[0]);
  }

  showUploadForm(audioFiles, coverImage = null) {
    document.getElementById("uploadArea").style.display = "none";
    document.getElementById("uploadFormFields").style.display = "block";

    // Store files for later upload
    this.selectedFiles = audioFiles;
    this.selectedCover = coverImage;

    // Auto-fill form for single file
    if (audioFiles.length === 1) {
      this.autoFillSingleFile(audioFiles[0]);
    } else {
      this.showBatchUploadOptions(audioFiles);
    }

    // Show file preview
    this.showFilePreview(audioFiles, coverImage);
  }

  autoFillSingleFile(file) {
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    document.getElementById("songTitle").value = fileName;

    // Try to extract metadata if possible
    this.extractMetadata(file).then((metadata) => {
      if (metadata.title)
        document.getElementById("songTitle").value = metadata.title;
      if (metadata.artist)
        document.getElementById("artistName").value = metadata.artist;
      if (metadata.album)
        document.getElementById("albumName").value = metadata.album;
    });
  }

  showBatchUploadOptions(files) {
    const formFields = document.getElementById("uploadFormFields");

    // Add batch upload notice
    const batchNotice = document.createElement("div");
    batchNotice.className = "batch-upload-notice";
    batchNotice.innerHTML = `
              <h4><i class="fas fa-layer-group"></i> Batch Upload (${files.length} files)</h4>
              <p>The following information will be applied to all files. Individual metadata will be extracted when possible.</p>
          `;
    formFields.insertBefore(batchNotice, formFields.firstChild);
  }

  showFilePreview(audioFiles, coverImage) {
    const preview = document.createElement("div");
    preview.className = "file-preview";
    preview.innerHTML = `
              <h4>Selected Files:</h4>
              <div class="file-list">
                  ${audioFiles
                    .map(
                      (file) => `
                      <div class="file-item">
                          <i class="fas fa-music"></i>
                          <span class="file-name">${file.name}</span>
                          <span class="file-size">${this.formatFileSize(
                            file.size
                          )}</span>
                      </div>
                  `
                    )
                    .join("")}
                  ${
                    coverImage
                      ? `
                      <div class="file-item cover-image">
                          <i class="fas fa-image"></i>
                          <span class="file-name">${coverImage.name}</span>
                          <span class="file-size">${this.formatFileSize(
                            coverImage.size
                          )}</span>
                      </div>
                  `
                      : ""
                  }
              </div>
          `;

    const formFields = document.getElementById("uploadFormFields");
    formFields.appendChild(preview);
  }

  async extractMetadata(file) {
    return new Promise((resolve) => {
      // This is a simplified metadata extraction
      // In a real app, you'd use a library like jsmediatags
      const metadata = {
        title: null,
        artist: null,
        album: null,
        duration: null,
      };

      // Try to get duration using audio element
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => {
        metadata.duration = audio.duration;
        resolve(metadata);
      });

      audio.addEventListener("error", () => {
        resolve(metadata);
      });

      audio.src = URL.createObjectURL(file);
    });
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const formData = this.getFormData();
    if (!this.validateForm(formData)) {
      return;
    }

    // Show upload progress
    this.showUploadProgress();

    try {
      // Upload files
      const uploadPromises = this.selectedFiles.map((file) =>
        this.uploadSingleFile(file, formData)
      );

      const results = await Promise.all(uploadPromises);

      // Handle successful uploads
      this.handleUploadSuccess(results);
    } catch (error) {
      this.handleUploadError(error);
    }
  }

  getFormData() {
    return {
      title: document.getElementById("songTitle").value,
      artist: document.getElementById("artistName").value,
      album: document.getElementById("albumName").value,
      category: document.getElementById("musicCategory").value,
      description: document.getElementById("songDescription").value,
    };
  }

  validateForm(formData) {
    if (!formData.title || !formData.artist) {
      showNotification(
        "Please fill in the required fields (Title and Artist)",
        "error"
      );
      return false;
    }
    return true;
  }

  async uploadSingleFile(file, formData) {
    // In a real app, this would upload to your server
    // For demo purposes, we'll simulate the upload

    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Create song object
          const newSong = {
            id: Date.now() + Math.random(),
            title: formData.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: formData.artist || "Unknown Artist",
            album: formData.album || "Unknown Album",
            category: formData.category,
            duration: 180 + Math.floor(Math.random() * 120), // Random duration
            albumArt: this.selectedCover
              ? URL.createObjectURL(this.selectedCover)
              : `https://picsum.photos/300/300?random=${Date.now()}`,
            audioUrl: URL.createObjectURL(file),
            uploaded: true,
            uploadDate: new Date().toISOString(),
            fileSize: file.size,
            fileName: file.name,
          };

          resolve(newSong);
        }

        this.updateUploadProgress(file.name, progress);
      }, 100);
    });
  }

  showUploadProgress() {
    const progressContainer = document.createElement("div");
    progressContainer.id = "uploadProgress";
    progressContainer.className = "upload-progress";
    progressContainer.innerHTML = `
              <h4><i class="fas fa-upload"></i> Uploading Files...</h4>
              <div id="progressList" class="progress-list"></div>
              <div class="upload-actions">
                  <button type="button" class="cancel-upload-btn" onclick="uploadManager.cancelUpload()">
                      Cancel Upload
                  </button>
              </div>
          `;

    const formFields = document.getElementById("uploadFormFields");
    formFields.appendChild(progressContainer);

    // Hide form fields
    const formElements = formFields.querySelectorAll(
      ".form-group, .form-row, .form-actions"
    );
    formElements.forEach((el) => (el.style.display = "none"));
  }

  updateUploadProgress(fileName, progress) {
    const progressList = document.getElementById("progressList");
    let progressItem = document.getElementById(`progress-${fileName}`);

    if (!progressItem) {
      progressItem = document.createElement("div");
      progressItem.id = `progress-${fileName}`;
      progressItem.className = "progress-item";
      progressItem.innerHTML = `
                  <div class="progress-info">
                      <span class="file-name">${fileName}</span>
                      <span class="progress-percent">0%</span>
                  </div>
                  <div class="progress-bar">
                      <div class="progress-fill" style="width: 0%"></div>
                  </div>
              `;
      progressList.appendChild(progressItem);
    }

    const progressFill = progressItem.querySelector(".progress-fill");
    const progressPercent = progressItem.querySelector(".progress-percent");

    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${Math.round(progress)}%`;

    if (progress >= 100) {
      progressItem.classList.add("completed");
    }
  }

  handleUploadSuccess(songs) {
    // Add songs to library and user data
    songs.forEach((song) => {
      musicLibrary.push(song);
      userData.uploadedSongs.push(song);
    });

    saveUserData();

    // Refresh grid if showing all music or user library
    if (currentCategory === "all" || currentCategory === "library") {
      loadMusicGrid();
    }

    // Close modal and show success
    closeUploadModal();
    showNotification(
      `Successfully uploaded ${songs.length} song(s)!`,
      "success"
    );

    // Show uploaded songs
    setTimeout(() => {
      showSection("library");
    }, 1000);
  }

  handleUploadError(error) {
    console.error("Upload error:", error);
    showNotification("Upload failed. Please try again.", "error");

    // Show retry option
    const progressContainer = document.getElementById("uploadProgress");
    if (progressContainer) {
      progressContainer.innerHTML += `
                  <div class="upload-error">
                      <p>Upload failed. Would you like to try again?</p>
                      <button class="btn-primary" onclick="uploadManager.retryUpload()">Retry</button>
                  </div>
              `;
    }
  }

  cancelUpload() {
    // In a real app, you'd cancel the actual upload requests
    closeUploadModal();
    showNotification("Upload cancelled", "info");
  }

  retryUpload() {
    const progressContainer = document.getElementById("uploadProgress");
    if (progressContainer) {
      progressContainer.remove();
    }

    // Restart the upload process
    this.handleFormSubmit({ preventDefault: () => {} });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  reset() {
    this.selectedFiles = [];
    this.selectedCover = null;

    // Reset form
    document.getElementById("uploadArea").style.display = "block";
    document.getElementById("uploadFormFields").style.display = "none";

    // Clear form fields
    document.getElementById("songTitle").value = "";
    document.getElementById("artistName").value = "";
    document.getElementById("albumName").value = "";
    document.getElementById("songDescription").value = "";
    document.getElementById("fileInput").value = "";

    // Remove any dynamic elements
    const dynamicElements = document.querySelectorAll(
      ".batch-upload-notice, .file-preview, .upload-progress"
    );
    dynamicElements.forEach((el) => el.remove());

    // Show form elements
    const formElements = document.querySelectorAll(
      ".form-group, .form-row, .form-actions"
    );
    formElements.forEach((el) => (el.style.display = ""));
  }
}

// Initialize upload manager
let uploadManager;
document.addEventListener("DOMContentLoaded", () => {
  uploadManager = new FileUploadManager();
});

// Enhanced upload modal functions
function setupUploadModal() {
  // This function is called from app.js
  // Additional setup if needed
}

function resetUploadForm() {
  if (uploadManager) {
    uploadManager.reset();
  }
}

// Playlist creation from upload form
document
  .getElementById("createPlaylistForm")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("playlistName").value;
    const description = document.getElementById("playlistDescription").value;

    if (name && name.trim()) {
      const playlistName = name.trim();

      if (!userData.playlists) {
        userData.playlists = {};
      }

      userData.playlists[playlistName] = {
        id: Date.now(),
        name: playlistName,
        description: description || "",
        songs: [],
        created: new Date().toISOString(),
        cover: null,
      };

      saveUserData();
      loadUserPlaylists();
      closeCreatePlaylistModal();

      showNotification(
        `Playlist "${playlistName}" created successfully!`,
        "success"
      );
    } else {
      showNotification("Please enter a playlist name", "error");
    }
  });

// Add styles for upload components
const uploadStyles = `
  .file-preview {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .file-preview h4 {
      margin-bottom: 1rem;
      color: #ff6b6b;
  }
  
  .file-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }
  
  .file-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 5px;
  }
  
  .file-item i {
      color: #ff6b6b;
      width: 20px;
  }
  
  .file-name {
      flex: 1;
      color: #fff;
      font-size: 0.9rem;
  }
  
  .file-size {
      color: #ccc;
      font-size: 0.8rem;
  }
  
  .file-item.cover-image i {
      color: #ffa500;
  }
  
  .batch-upload-notice {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 10px;
  }
  
  .batch-upload-notice h4 {
      color: #ff6b6b;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
  }
  
  .batch-upload-notice p {
      color: #ccc;
      margin: 0;
  }
  
  .upload-progress {
      margin-top: 1rem;
  }
  
  .upload-progress h4 {
      color: #ff6b6b;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
  }
  
  .progress-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
  }
  
  .progress-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;
  }
  
  .progress-item.completed {
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
  }
  
  .progress-info .file-name {
      color: #fff;
      font-weight: bold;
  }
  
  .progress-percent {
      color: #ff6b6b;
      font-weight: bold;
  }
  
  .progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
  }
  
  .progress-fill {
      height: 100%;
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
      border-radius: 3px;
      transition: width 0.3s ease;
  }
  
  .upload-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
  }
  
  .cancel-upload-btn {
      background: transparent;
      border: 2px solid #ff6b6b;
      color: #ff6b6b;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
  }
  
  .cancel-upload-btn:hover {
      background: rgba(255, 107, 107, 0.1);
  }
  
  .upload-error {
      text-align: center;
      padding: 1rem;
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid rgba(244, 67, 54, 0.3);
      border-radius: 10px;
      margin-top: 1rem;
  }
  
  .upload-error p {
      color: #f44336;
      margin-bottom: 1rem;
  }
  
  .upload-area.has-files {
      border-color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
  }
  
  .upload-area.has-files .upload-icon i {
      color: #4CAF50;
  }
  `;

// Inject upload styles
const uploadStyleSheet = document.createElement("style");
uploadStyleSheet.textContent = uploadStyles;
document.head.appendChild(uploadStyleSheet);

// Declare missing variables
let showNotification;
let musicLibrary;
let userData;
let saveUserData;
let currentCategory;
let loadMusicGrid;
let closeUploadModal;
let showSection;
let loadUserPlaylists;
let closeCreatePlaylistModal;
