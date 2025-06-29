// Global Variables
let currentUser = null;
let currentSong = null;
const currentPlaylist = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isMuted = false;
let currentVolume = 70;
let currentView = "grid";
let currentCategory = "all";
let isQueueOpen = false;
let musicLibrary = [];

// Audio Element
const audio = document.getElementById("audioElement");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  showLoadingScreen();
  setTimeout(() => {
    hideLoadingScreen();
    checkAuthStatus();
    initializeApp();
  }, 2000);
});

// Loading Screen Functions
function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "flex";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").style.opacity = "0";
  setTimeout(() => {
    document.getElementById("loadingScreen").style.display = "none";
  }, 500);
}

// Authentication Status Check
function checkAuthStatus() {
  const user = localStorage.getItem("soundwave_user");
  if (user) {
    currentUser = JSON.parse(user);
    showMainApp();
    loadUserData();
  } else {
    showLandingPage();
  }
}

function showLandingPage() {
  document.getElementById("landingPage").style.display = "block";
  document.getElementById("mainApp").style.display = "none";
}

function showMainApp() {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("mainApp").style.display = "flex";
  loadMusicLibrary();
  setupAudioEvents();
  loadUserPlaylists();
}

// Initialize Main App
function initializeApp() {
  setupSearchFunctionality();
  setupUploadModal();
  setVolume(currentVolume);

  // Load sample music data
  loadSampleMusic();
}

// Sample Music Data
function loadSampleMusic() {
  musicLibrary = [
    {
      id: 1,
      title: "Neon Dreams",
      artist: "Electric Pulse",
      album: "Cyber Nights",
      category: "electronic",
      duration: 225,
      albumArt: "https://picsum.photos/300/300?random=1",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 2,
      title: "Midnight Jazz",
      artist: "Smooth Collective",
      album: "Late Night Sessions",
      category: "jazz",
      duration: 198,
      albumArt: "https://picsum.photos/300/300?random=2",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 3,
      title: "Rock Anthem",
      artist: "Thunder Strike",
      album: "Electric Storm",
      category: "rock",
      duration: 267,
      albumArt: "https://picsum.photos/300/300?random=3",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 4,
      title: "Pop Sensation",
      artist: "Bright Stars",
      album: "Summer Hits",
      category: "pop",
      duration: 195,
      albumArt: "https://picsum.photos/300/300?random=4",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 5,
      title: "Hip Hop Beats",
      artist: "Urban Flow",
      album: "Street Rhythms",
      category: "hip-hop",
      duration: 232,
      albumArt: "https://picsum.photos/300/300?random=5",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 6,
      title: "Classical Symphony",
      artist: "Orchestra Elite",
      album: "Timeless Classics",
      category: "classical",
      duration: 330,
      albumArt: "https://picsum.photos/300/300?random=6",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 7,
      title: "R&B Groove",
      artist: "Soulful Voices",
      album: "Smooth Vibes",
      category: "r&b",
      duration: 210,
      albumArt: "https://picsum.photos/300/300?random=7",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
    {
      id: 8,
      title: "Chill Waves",
      artist: "Ambient Dreams",
      album: "Peaceful Moments",
      category: "electronic",
      duration: 285,
      albumArt: "https://picsum.photos/300/300?random=8",
      audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    },
  ];

  loadMusicGrid();
}

// User Data Management
let userData = {
  favorites: [],
  recentlyPlayed: [],
  playlists: {},
  uploadedSongs: [],
};

function loadUserData() {
  const savedData = localStorage.getItem("soundwave_userdata");
  if (savedData) {
    userData = { ...userData, ...JSON.parse(savedData) };
  }
}

function saveUserData() {
  localStorage.setItem("soundwave_userdata", JSON.stringify(userData));
}

// Music Grid Functions
function loadMusicGrid(category = "all") {
  const musicGrid = document.getElementById("musicGrid");
  const filteredMusic =
    category === "all"
      ? musicLibrary
      : musicLibrary.filter((song) => song.category === category);

  musicGrid.innerHTML = "";
  musicGrid.className = `music-grid ${
    currentView === "list" ? "list-view" : ""
  }`;

  filteredMusic.forEach((song) => {
    const musicCard = createMusicCard(song);
    musicGrid.appendChild(musicCard);
  });

  // Update section title
  const sectionTitle = document.getElementById("sectionTitle");
  sectionTitle.textContent =
    category === "all"
      ? "All Music"
      : `${category.charAt(0).toUpperCase() + category.slice(1)} Music`;
}

function createMusicCard(song) {
  const card = document.createElement("div");
  card.className = "music-card";
  card.onclick = () => playSong(song);

  card.innerHTML = `
        <div style="position: relative;">
            <img src="${song.albumArt}" alt="${song.title}" class="album-cover">
            <div class="play-overlay">
                <button class="play-btn-overlay">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        </div>
        <div class="song-details">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
            <div class="song-info">
                <span class="song-category">${song.category}</span>
                <span class="song-duration">${formatTime(song.duration)}</span>
            </div>
        </div>
    `;

  return card;
}

// Music Player Functions
function playSong(song) {
  currentSong = song;
  currentIndex = musicLibrary.findIndex((s) => s.id === song.id);

  // Update player UI
  document.getElementById("currentAlbumArt").src = song.albumArt;
  document.getElementById("currentTrackTitle").textContent = song.title;
  document.getElementById("currentTrackArtist").textContent = song.artist;

  // Set audio source
  audio.src = song.audioUrl;
  audio.load();

  // Add to recently played
  addToRecentlyPlayed(song);

  // Play audio
  audio
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayButton();
    })
    .catch((error) => {
      console.log("Audio play failed:", error);
      // For demo purposes, simulate playing
      isPlaying = true;
      updatePlayButton();
      simulateAudioProgress();
    });

  // Update queue
  updateQueue();
}

function togglePlayPause() {
  if (!currentSong) {
    // Play first song if none selected
    playSong(musicLibrary[0]);
    return;
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {
      // Simulate play for demo
      isPlaying = true;
      simulateAudioProgress();
    });
    isPlaying = true;
  }

  updatePlayButton();
}

function updatePlayButton() {
  const playBtn = document.getElementById("playPauseBtn");
  const icon = playBtn.querySelector("i");

  if (isPlaying) {
    icon.className = "fas fa-pause";
  } else {
    icon.className = "fas fa-play";
  }
}

function nextTrack() {
  if (musicLibrary.length === 0) return;

  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * musicLibrary.length);
  } else {
    currentIndex = (currentIndex + 1) % musicLibrary.length;
  }

  playSong(musicLibrary[currentIndex]);
}

function previousTrack() {
  if (musicLibrary.length === 0) return;

  currentIndex = currentIndex > 0 ? currentIndex - 1 : musicLibrary.length - 1;
  playSong(musicLibrary[currentIndex]);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  const shuffleBtn = document.getElementById("shuffleBtn");

  if (isShuffle) {
    shuffleBtn.classList.add("active");
  } else {
    shuffleBtn.classList.remove("active");
  }
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  const repeatBtn = document.getElementById("repeatBtn");

  if (isRepeat) {
    repeatBtn.classList.add("active");
  } else {
    repeatBtn.classList.remove("active");
  }
}

function toggleLike() {
  if (!currentSong) return;

  const likeBtn = document.getElementById("likeBtn");
  const icon = likeBtn.querySelector("i");

  const isLiked = userData.favorites.some((song) => song.id === currentSong.id);

  if (isLiked) {
    userData.favorites = userData.favorites.filter(
      (song) => song.id !== currentSong.id
    );
    icon.className = "far fa-heart";
    likeBtn.classList.remove("liked");
  } else {
    userData.favorites.push(currentSong);
    icon.className = "fas fa-heart";
    likeBtn.classList.add("liked");
  }

  saveUserData();
}

// Audio Controls
function seekTo(event) {
  if (!currentSong) return;

  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const seekTime = percent * currentSong.duration;

  audio.currentTime = seekTime;
  updateProgress(seekTime);
}

function setVolume(volume) {
  currentVolume = volume;
  audio.volume = volume / 100;

  const volumeBtn = document.getElementById("volumeBtn");
  const icon = volumeBtn.querySelector("i");

  if (volume === 0 || isMuted) {
    icon.className = "fas fa-volume-mute";
  } else if (volume < 50) {
    icon.className = "fas fa-volume-down";
  } else {
    icon.className = "fas fa-volume-up";
  }
}

function toggleMute() {
  const volumeSlider = document.getElementById("volumeRange");

  if (isMuted) {
    setVolume(currentVolume);
    volumeSlider.value = currentVolume;
    isMuted = false;
  } else {
    setVolume(0);
    volumeSlider.value = 0;
    isMuted = true;
  }
}

// Progress Functions
function updateProgress(currentTime) {
  if (!currentSong) return;

  const progress = (currentTime / currentSong.duration) * 100;
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("currentTime").textContent = formatTime(currentTime);
  document.getElementById("totalTime").textContent = formatTime(
    currentSong.duration
  );
}

function simulateAudioProgress() {
  if (!isPlaying || !currentSong) return;

  let currentTime = 0;
  const interval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(interval);
      return;
    }

    currentTime += 1;
    updateProgress(currentTime);

    if (currentTime >= currentSong.duration) {
      clearInterval(interval);
      if (isRepeat) {
        playSong(currentSong);
      } else {
        nextTrack();
      }
    }
  }, 1000);
}

// Audio Event Listeners
function setupAudioEvents() {
  audio.addEventListener("loadedmetadata", () => {
    if (currentSong) {
      document.getElementById("totalTime").textContent = formatTime(
        currentSong.duration
      );
    }
  });

  audio.addEventListener("timeupdate", () => {
    if (currentSong && audio.duration) {
      updateProgress(audio.currentTime);
    }
  });

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play();
    } else {
      nextTrack();
    }
  });

  audio.addEventListener("play", () => {
    isPlaying = true;
    updatePlayButton();
  });

  audio.addEventListener("pause", () => {
    isPlaying = false;
    updatePlayButton();
  });
}

// Utility Functions
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function addToRecentlyPlayed(song) {
  // Remove if already exists
  userData.recentlyPlayed = userData.recentlyPlayed.filter(
    (s) => s.id !== song.id
  );

  // Add to beginning
  userData.recentlyPlayed.unshift(song);

  // Keep only last 50 songs
  if (userData.recentlyPlayed.length > 50) {
    userData.recentlyPlayed = userData.recentlyPlayed.slice(0, 50);
  }

  saveUserData();
}

// Search Functionality
function setupSearchFunctionality() {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();

    if (query === "") {
      loadMusicGrid(currentCategory);
      return;
    }

    const filteredSongs = musicLibrary.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    );

    displaySearchResults(filteredSongs, query);
  });
}

function displaySearchResults(songs, query) {
  const musicGrid = document.getElementById("musicGrid");
  const sectionTitle = document.getElementById("sectionTitle");

  sectionTitle.textContent = `Search results for "${query}"`;
  musicGrid.innerHTML = "";

  if (songs.length === 0) {
    musicGrid.innerHTML =
      '<div style="text-align: center; color: #ccc; padding: 2rem;">No songs found</div>';
    return;
  }

  songs.forEach((song) => {
    const musicCard = createMusicCard(song);
    musicGrid.appendChild(musicCard);
  });
}

// Category Filter
function filterByCategory(category) {
  currentCategory = category;

  // Update active category
  document.querySelectorAll(".category-menu a").forEach((link) => {
    link.classList.remove("category-active");
  });
  event.target.classList.add("category-active");

  loadMusicGrid(category);
}

// View Controls
function setGridView(view) {
  currentView = view;

  // Update active view button
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  loadMusicGrid(currentCategory);
}

// Section Navigation
function showSection(section) {
  // Update active menu item
  document.querySelectorAll(".sidebar-menu a").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.classList.add("active");

  // Show appropriate content
  switch (section) {
    case "discover":
      loadMusicGrid("all");
      break;
    case "library":
      displayPlaylist(userData.uploadedSongs, "My Library");
      break;
    case "favorites":
      loadPlaylist("favorites");
      break;
    case "recent":
      loadPlaylist("recent");
      break;
  }
}

// Playlist Functions
function loadUserPlaylists() {
  const playlistMenu = document.getElementById("playlistMenu");

  // Clear existing custom playlists
  const customPlaylists = playlistMenu.querySelectorAll(".custom-playlist");
  customPlaylists.forEach((item) => item.remove());

  // Add user playlists
  Object.keys(userData.playlists).forEach((playlistName) => {
    const listItem = document.createElement("li");
    listItem.className = "custom-playlist";
    listItem.innerHTML = `
            <a href="#" onclick="loadPlaylist('${playlistName}')">
                <i class="fas fa-music"></i> ${playlistName}
            </a>
        `;
    playlistMenu.appendChild(listItem);
  });
}

function loadPlaylist(playlistName) {
  let songs = [];

  switch (playlistName) {
    case "favorites":
      songs = userData.favorites;
      break;
    case "recent":
      songs = userData.recentlyPlayed;
      break;
    default:
      songs = userData.playlists[playlistName] || [];
  }

  displayPlaylist(songs, playlistName);
}

function displayPlaylist(songs, playlistName) {
  const musicGrid = document.getElementById("musicGrid");
  const sectionTitle = document.getElementById("sectionTitle");

  sectionTitle.textContent =
    playlistName.charAt(0).toUpperCase() + playlistName.slice(1);
  musicGrid.innerHTML = "";

  if (songs.length === 0) {
    musicGrid.innerHTML =
      '<div style="text-align: center; color: #ccc; padding: 2rem;">No songs in this playlist</div>';
    return;
  }

  songs.forEach((song) => {
    const musicCard = createMusicCard(song);
    musicGrid.appendChild(musicCard);
  });
}

// Queue Functions
function toggleQueue() {
  const queuePanel = document.getElementById("queuePanel");
  isQueueOpen = !isQueueOpen;

  if (isQueueOpen) {
    queuePanel.classList.add("show");
    updateQueue();
  } else {
    queuePanel.classList.remove("show");
  }
}

function updateQueue() {
  const queueList = document.getElementById("queueList");
  queueList.innerHTML = "";

  // Show current song and next songs
  const queueSongs = musicLibrary.slice(currentIndex);

  queueSongs.forEach((song, index) => {
    const queueItem = document.createElement("div");
    queueItem.className = `queue-item ${index === 0 ? "current" : ""}`;
    queueItem.onclick = () => {
      currentIndex = musicLibrary.findIndex((s) => s.id === song.id);
      playSong(song);
    };

    queueItem.innerHTML = `
            <img src="${song.albumArt}" alt="${song.title}">
            <div class="queue-item-info">
                <div class="queue-item-title">${song.title}</div>
                <div class="queue-item-artist">${song.artist}</div>
            </div>
        `;

    queueList.appendChild(queueItem);
  });
}

// User Menu Functions
function toggleUserMenu() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

function showProfile() {
  alert("Profile feature coming soon!");
}

function showSettings() {
  alert("Settings feature coming soon!");
}

function logout() {
  localStorage.removeItem("soundwave_user");
  localStorage.removeItem("soundwave_userdata");
  location.reload();
}

// Modal Functions
function showLogin() {
  document.getElementById("authModal").classList.add("show");
  document.getElementById("authTitle").textContent = "Sign In";
  document.getElementById("signinForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
}

function showSignup() {
  document.getElementById("authModal").classList.add("show");
  document.getElementById("authTitle").textContent = "Sign Up";
  document.getElementById("signinForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
}

function closeAuthModal() {
  document.getElementById("authModal").classList.remove("show");
}

function switchToSignup() {
  document.getElementById("authTitle").textContent = "Sign Up";
  document.getElementById("signinForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
}

function switchToSignin() {
  document.getElementById("authTitle").textContent = "Sign In";
  document.getElementById("signinForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.className = "fas fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fas fa-eye";
  }
}

// Upload Modal Functions
function showUploadModal() {
  document.getElementById("uploadModal").classList.add("show");
}

function closeUploadModal() {
  document.getElementById("uploadModal").classList.remove("show");
  resetUploadForm();
}

function resetUploadForm() {
  document.getElementById("uploadArea").style.display = "block";
  document.getElementById("uploadFormFields").style.display = "none";

  // Clear form
  document.getElementById("songTitle").value = "";
  document.getElementById("artistName").value = "";
  document.getElementById("albumName").value = "";
  document.getElementById("songDescription").value = "";
  document.getElementById("fileInput").value = "";
}

// Create Playlist Modal Functions
function showCreatePlaylistModal() {
  document.getElementById("createPlaylistModal").classList.add("show");
}

function closeCreatePlaylistModal() {
  document.getElementById("createPlaylistModal").classList.remove("show");
  document.getElementById("playlistName").value = "";
  document.getElementById("playlistDescription").value = "";
}

// Keyboard Shortcuts
document.addEventListener("keydown", (event) => {
  // Only trigger if not typing in an input
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }

  switch (event.code) {
    case "Space":
      event.preventDefault();
      togglePlayPause();
      break;
    case "ArrowRight":
      event.preventDefault();
      nextTrack();
      break;
    case "ArrowLeft":
      event.preventDefault();
      previousTrack();
      break;
    case "ArrowUp":
      event.preventDefault();
      const currentVol = Math.min(100, currentVolume + 10);
      setVolume(currentVol);
      document.getElementById("volumeRange").value = currentVol;
      break;
    case "ArrowDown":
      event.preventDefault();
      const newVol = Math.max(0, currentVolume - 10);
      setVolume(newVol);
      document.getElementById("volumeRange").value = newVol;
      break;
  }
});

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  // Close user dropdown
  const userMenu = document.querySelector(".user-menu");
  const userDropdown = document.getElementById("userDropdown");

  if (userMenu && !userMenu.contains(event.target)) {
    userDropdown.classList.remove("show");
  }

  // Close modals when clicking overlay
  const modals = document.querySelectorAll(".modal-overlay");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.classList.remove("show");
    }
  });
});

// Auto-save user data periodically
setInterval(saveUserData, 30000); // Save every 30 seconds

// Initialize tooltips and other UI enhancements
document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling
  document.documentElement.style.scrollBehavior = "smooth";

  // Add loading states to buttons
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });
});

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// Call lazy loading when DOM is ready
document.addEventListener("DOMContentLoaded", lazyLoadImages);

// Export functions for global access
window.SoundWave = {
  playSong,
  togglePlayPause,
  nextTrack,
  previousTrack,
  setVolume,
  toggleMute,
  filterByCategory,
  loadPlaylist,
  showUploadModal,
  closeUploadModal,
  showLogin,
  showSignup,
  logout,
};
