// Music Player Specific Functions

// Enhanced Audio Controls
class MusicPlayer {
  constructor() {
    this.audio = document.getElementById("audioElement");
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.7;
    this.isLooping = false;
    this.crossfadeTime = 3; // seconds
    this.equalizer = null;
    this.visualizer = null;

    this.initializeAudioContext();
    this.setupEventListeners();
  }

  initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.setupAudioNodes();
    } catch (error) {
      console.log("Web Audio API not supported:", error);
    }
  }

  setupAudioNodes() {
    if (!this.audioContext) return;

    // Create audio nodes
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.gainNode = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();

    // Setup equalizer
    this.setupEqualizer();

    // Connect nodes
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Setup visualizer
    this.setupVisualizer();
  }

  setupEqualizer() {
    if (!this.audioContext) return;

    // Create frequency bands
    const frequencies = [60, 170, 350, 1000, 3500, 10000];
    this.equalizerBands = frequencies.map((freq) => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });

    // Connect equalizer bands
    let previousNode = this.gainNode;
    this.equalizerBands.forEach((band) => {
      previousNode.connect(band);
      previousNode = band;
    });
    previousNode.connect(this.analyser);
  }

  setupVisualizer() {
    if (!this.analyser) return;

    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    // Create visualizer canvas
    this.createVisualizerCanvas();
    this.startVisualization();
  }

  createVisualizerCanvas() {
    const visualizerContainer = document.querySelector(".music-visualizer");
    if (!visualizerContainer) return;

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 150;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    this.visualizerCanvas = canvas;
    this.visualizerCtx = canvas.getContext("2d");

    // Replace existing visualizer
    visualizerContainer.innerHTML = "";
    visualizerContainer.appendChild(canvas);
  }

  startVisualization() {
    if (!this.visualizerCtx || !this.analyser) return;

    const draw = () => {
      requestAnimationFrame(draw);

      this.analyser.getByteFrequencyData(this.dataArray);

      this.visualizerCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
      this.visualizerCtx.fillRect(
        0,
        0,
        this.visualizerCanvas.width,
        this.visualizerCanvas.height
      );

      const barWidth = (this.visualizerCanvas.width / this.bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < this.bufferLength; i++) {
        barHeight = (this.dataArray[i] / 255) * this.visualizerCanvas.height;

        const gradient = this.visualizerCtx.createLinearGradient(
          0,
          this.visualizerCanvas.height - barHeight,
          0,
          this.visualizerCanvas.height
        );
        gradient.addColorStop(0, "#ff6b6b");
        gradient.addColorStop(1, "#ffa500");

        this.visualizerCtx.fillStyle = gradient;
        this.visualizerCtx.fillRect(
          x,
          this.visualizerCanvas.height - barHeight,
          barWidth,
          barHeight
        );

        x += barWidth + 1;
      }
    };

    draw();
  }

  setupEventListeners() {
    // Enhanced progress bar interaction
    const progressBar = document.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.addEventListener("mousedown", this.startSeeking.bind(this));
      progressBar.addEventListener(
        "mousemove",
        this.updateSeekPreview.bind(this)
      );
      progressBar.addEventListener(
        "mouseleave",
        this.hideSeekPreview.bind(this)
      );
    }

    // Volume control with mouse wheel
    const volumeSlider = document.getElementById("volumeRange");
    if (volumeSlider) {
      volumeSlider.addEventListener("wheel", this.handleVolumeWheel.bind(this));
    }

    // Keyboard shortcuts
    document.addEventListener(
      "keydown",
      this.handleKeyboardShortcuts.bind(this)
    );
  }

  startSeeking(event) {
    this.isSeeking = true;
    this.seek(event);

    const handleMouseMove = (e) => this.seek(e);
    const handleMouseUp = () => {
      this.isSeeking = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  seek(event) {
    if (!currentSong) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    );
    const seekTime = percent * currentSong.duration;

    this.audio.currentTime = seekTime;
    updateProgress(seekTime);
  }

  updateSeekPreview(event) {
    if (!currentSong || this.isSeeking) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const previewTime = percent * currentSong.duration;

    // Show preview tooltip
    this.showSeekPreview(event.clientX, formatTime(previewTime));
  }

  showSeekPreview(x, timeText) {
    let preview = document.getElementById("seekPreview");
    if (!preview) {
      preview = document.createElement("div");
      preview.id = "seekPreview";
      preview.className = "seek-preview";
      document.body.appendChild(preview);
    }

    preview.textContent = timeText;
    preview.style.left = `${x - 25}px`;
    preview.style.display = "block";
  }

  hideSeekPreview() {
    const preview = document.getElementById("seekPreview");
    if (preview && !this.isSeeking) {
      preview.style.display = "none";
    }
  }

  handleVolumeWheel(event) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -5 : 5;
    const newVolume = Math.max(0, Math.min(100, currentVolume + delta));
    setVolume(newVolume);
    event.target.value = newVolume;
  }

  handleKeyboardShortcuts(event) {
    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA"
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "l":
        event.preventDefault();
        this.toggleLoop();
        break;
      case "m":
        event.preventDefault();
        toggleMute();
        break;
      case "f":
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case "r":
        event.preventDefault();
        toggleRepeat();
        break;
      case "s":
        event.preventDefault();
        toggleShuffle();
        break;
      case "q":
        event.preventDefault();
        toggleQueue();
        break;
    }
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.audio.loop = this.isLooping;

    // Update UI
    const loopBtn = document.getElementById("loopBtn");
    if (loopBtn) {
      loopBtn.classList.toggle("active", this.isLooping);
    }

    showNotification(`Loop ${this.isLooping ? "enabled" : "disabled"}`, "info");
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Crossfade between tracks
  crossfadeToNext() {
    if (!currentSong || !this.gainNode) return;

    const fadeOutDuration = this.crossfadeTime;
    const currentGain = this.gainNode.gain.value;

    // Fade out current track
    this.gainNode.gain.setValueAtTime(
      currentGain,
      this.audioContext.currentTime
    );
    this.gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + fadeOutDuration
    );

    // Start next track after fade begins
    setTimeout(() => {
      nextTrack();
      // Fade in new track
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        currentGain,
        this.audioContext.currentTime + fadeOutDuration
      );
    }, fadeOutDuration * 500); // Start halfway through fade
  }

  // Equalizer controls
  setEqualizerBand(bandIndex, gain) {
    if (this.equalizerBands && this.equalizerBands[bandIndex]) {
      this.equalizerBands[bandIndex].gain.value = gain;
    }
  }

  resetEqualizer() {
    if (this.equalizerBands) {
      this.equalizerBands.forEach((band) => {
        band.gain.value = 0;
      });
    }
  }

  // Audio effects
  applyReverbEffect(roomSize = 0.5, decay = 2) {
    if (!this.audioContext) return;

    // Create convolver for reverb
    const convolver = this.audioContext.createConvolver();
    const impulseResponse = this.createImpulseResponse(roomSize, decay);
    convolver.buffer = impulseResponse;

    // Insert into audio chain
    this.gainNode.disconnect();
    this.gainNode.connect(convolver);
    convolver.connect(this.analyser);
  }

  createImpulseResponse(roomSize, decay) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = length - i;
        channelData[i] =
          (Math.random() * 2 - 1) * Math.pow(n / length, roomSize);
      }
    }

    return impulse;
  }

  // Speed/pitch control
  setPlaybackRate(rate) {
    this.audio.playbackRate = rate;
    showNotification(`Playback speed: ${rate}x`, "info");
  }

  // Audio analysis
  getAudioFeatures() {
    if (!this.analyser) return null;

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    // Calculate features
    const bass = this.getFrequencyRange(frequencyData, 0, 10);
    const mids = this.getFrequencyRange(frequencyData, 10, 50);
    const treble = this.getFrequencyRange(frequencyData, 50, 100);
    const energy =
      frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;

    return { bass, mids, treble, energy };
  }

  getFrequencyRange(data, startPercent, endPercent) {
    const start = Math.floor((data.length * startPercent) / 100);
    const end = Math.floor((data.length * endPercent) / 100);
    const slice = data.slice(start, end);
    return slice.reduce((sum, val) => sum + val, 0) / slice.length;
  }
}

// Initialize enhanced music player
let enhancedPlayer;
document.addEventListener("DOMContentLoaded", () => {
  enhancedPlayer = new MusicPlayer();
});

// Playlist Management
class PlaylistManager {
  constructor() {
    this.currentPlaylist = [];
    this.shuffledPlaylist = [];
    this.originalIndex = 0;
  }

  createPlaylist(name, songs = []) {
    if (!userData.playlists) {
      userData.playlists = {};
    }

    userData.playlists[name] = {
      id: Date.now(),
      name: name,
      songs: songs,
      created: new Date().toISOString(),
      description: "",
      cover: null,
    };

    saveUserData();
    loadUserPlaylists();
    showNotification(`Playlist "${name}" created!`, "success");
  }

  addToPlaylist(playlistName, song) {
    if (userData.playlists[playlistName]) {
      const playlist = userData.playlists[playlistName];

      // Check if song already exists
      if (!playlist.songs.find((s) => s.id === song.id)) {
        playlist.songs.push(song);
        saveUserData();
        showNotification(`Added "${song.title}" to ${playlistName}`, "success");
      } else {
        showNotification(
          `"${song.title}" is already in ${playlistName}`,
          "warning"
        );
      }
    }
  }

  removeFromPlaylist(playlistName, songId) {
    if (userData.playlists[playlistName]) {
      const playlist = userData.playlists[playlistName];
      playlist.songs = playlist.songs.filter((song) => song.id !== songId);
      saveUserData();
      showNotification("Song removed from playlist", "success");
    }
  }

  deletePlaylist(playlistName) {
    if (userData.playlists[playlistName]) {
      delete userData.playlists[playlistName];
      saveUserData();
      loadUserPlaylists();
      showNotification(`Playlist "${playlistName}" deleted`, "success");
    }
  }

  shufflePlaylist(playlist) {
    this.shuffledPlaylist = [...playlist].sort(() => Math.random() - 0.5);
    return this.shuffledPlaylist;
  }

  getNextSong(currentIndex, isShuffled = false) {
    const playlist = isShuffled ? this.shuffledPlaylist : this.currentPlaylist;
    return playlist[(currentIndex + 1) % playlist.length];
  }

  getPreviousSong(currentIndex, isShuffled = false) {
    const playlist = isShuffled ? this.shuffledPlaylist : this.currentPlaylist;
    return playlist[currentIndex > 0 ? currentIndex - 1 : playlist.length - 1];
  }
}

// Initialize playlist manager
const playlistManager = new PlaylistManager();

// Smart Recommendations
class RecommendationEngine {
  constructor() {
    this.userPreferences = {
      genres: {},
      artists: {},
      tempo: "medium",
      energy: "medium",
    };
    this.loadPreferences();
  }

  loadPreferences() {
    const saved = localStorage.getItem("soundwave_preferences");
    if (saved) {
      this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
    }
  }

  savePreferences() {
    localStorage.setItem(
      "soundwave_preferences",
      JSON.stringify(this.userPreferences)
    );
  }

  updatePreferences(song) {
    // Update genre preferences
    if (!this.userPreferences.genres[song.category]) {
      this.userPreferences.genres[song.category] = 0;
    }
    this.userPreferences.genres[song.category]++;

    // Update artist preferences
    if (!this.userPreferences.artists[song.artist]) {
      this.userPreferences.artists[song.artist] = 0;
    }
    this.userPreferences.artists[song.artist]++;

    this.savePreferences();
  }

  getRecommendations(count = 10) {
    const recommendations = [];
    const availableSongs = musicLibrary.filter(
      (song) => !userData.recentlyPlayed.find((recent) => recent.id === song.id)
    );

    // Score songs based on preferences
    const scoredSongs = availableSongs.map((song) => ({
      ...song,
      score: this.calculateScore(song),
    }));

    // Sort by score and return top recommendations
    scoredSongs.sort((a, b) => b.score - a.score);
    return scoredSongs.slice(0, count);
  }

  calculateScore(song) {
    let score = 0;

    // Genre preference
    const genreScore = this.userPreferences.genres[song.category] || 0;
    score += genreScore * 0.4;

    // Artist preference
    const artistScore = this.userPreferences.artists[song.artist] || 0;
    score += artistScore * 0.3;

    // Popularity (simulated)
    score += Math.random() * 0.3;

    return score;
  }

  createDiscoverWeekly() {
    const recommendations = this.getRecommendations(30);
    playlistManager.createPlaylist("Discover Weekly", recommendations);
    showNotification("Discover Weekly playlist created!", "success");
  }
}

// Initialize recommendation engine
const recommendationEngine = new RecommendationEngine();

// Update preferences when songs are played
function updateRecommendations(song) {
  recommendationEngine.updatePreferences(song);
}

// Add to existing playSong function
let originalPlaySong;
let playSong;

originalPlaySong = playSong;
playSong = (song) => {
  if (originalPlaySong) {
    originalPlaySong(song);
  }
  updateRecommendations(song);
};

// Sleep Timer
class SleepTimer {
  constructor() {
    this.timer = null;
    this.remainingTime = 0;
  }

  start(minutes) {
    this.stop(); // Clear any existing timer

    this.remainingTime = minutes * 60; // Convert to seconds
    this.timer = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        this.stop();
        this.fadeOutAndPause();
      }

      this.updateDisplay();
    }, 1000);

    showNotification(`Sleep timer set for ${minutes} minutes`, "success");
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.remainingTime = 0;
      this.updateDisplay();
    }
  }

  fadeOutAndPause() {
    if (enhancedPlayer && enhancedPlayer.gainNode) {
      const currentGain = enhancedPlayer.gainNode.gain.value;
      enhancedPlayer.gainNode.gain.setValueAtTime(
        currentGain,
        enhancedPlayer.audioContext.currentTime
      );
      enhancedPlayer.gainNode.gain.linearRampToValueAtTime(
        0,
        enhancedPlayer.audioContext.currentTime + 5
      );

      setTimeout(() => {
        if (isPlaying) {
          togglePlayPause();
        }
        enhancedPlayer.gainNode.gain.value = currentGain;
      }, 5000);
    } else {
      if (isPlaying) {
        togglePlayPause();
      }
    }

    showNotification("Sleep timer finished - music paused", "info");
  }

  updateDisplay() {
    const display = document.getElementById("sleepTimerDisplay");
    if (display) {
      if (this.remainingTime > 0) {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        display.textContent = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;
        display.style.display = "block";
      } else {
        display.style.display = "none";
      }
    }
  }
}

// Initialize sleep timer
const sleepTimer = new SleepTimer();

// Add sleep timer controls to UI
function showSleepTimerModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
          <div class="modal">
              <div class="modal-header">
                  <h2><i class="fas fa-moon"></i> Sleep Timer</h2>
                  <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                      <i class="fas fa-times"></i>
                  </button>
              </div>
              <div class="modal-body">
                  <p>Set a timer to automatically pause music:</p>
                  <div class="sleep-timer-options">
                      <button class="btn-outline" onclick="sleepTimer.start(15); this.closest('.modal-overlay').remove();">15 minutes</button>
                      <button class="btn-outline" onclick="sleepTimer.start(30); this.closest('.modal-overlay').remove();">30 minutes</button>
                      <button class="btn-outline" onclick="sleepTimer.start(60); this.closest('.modal-overlay').remove();">1 hour</button>
                      <button class="btn-outline" onclick="sleepTimer.start(120); this.closest('.modal-overlay').remove();">2 hours</button>
                  </div>
                  <div class="custom-timer">
                      <input type="number" id="customMinutes" placeholder="Custom minutes" min="1" max="480">
                      <button class="btn-primary" onclick="const mins = document.getElementById('customMinutes').value; if(mins) { sleepTimer.start(parseInt(mins)); this.closest('.modal-overlay').remove(); }">Set Timer</button>
                  </div>
                  ${
                    sleepTimer.timer
                      ? '<button class="btn-secondary" onclick="sleepTimer.stop(); this.closest(\'.modal-overlay\').remove();">Cancel Timer</button>'
                      : ""
                  }
              </div>
          </div>
      `;

  document.body.appendChild(modal);
  modal.classList.add("show");
}

// Add styles for new components
const additionalStyles = `
  .seek-preview {
      position: fixed;
      top: -40px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.5rem;
      border-radius: 5px;
      font-size: 0.8rem;
      pointer-events: none;
      z-index: 1000;
      display: none;
  }
  
  .sleep-timer-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin: 1rem 0;
  }
  
  .custom-timer {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
  }
  
  .custom-timer input {
      flex: 1;
      padding: 0.5rem;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: white;
  }
  
  #sleepTimerDisplay {
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-family: monospace;
      font-size: 1.2rem;
      display: none;
      z-index: 1000;
  }
  `;

// Inject additional styles
const additionalStyleSheet = document.createElement("style");
additionalStyleSheet.textContent = additionalStyles;
document.head.appendChild(additionalStyleSheet);

// Add sleep timer display to page
document.addEventListener("DOMContentLoaded", () => {
  const sleepTimerDisplay = document.createElement("div");
  sleepTimerDisplay.id = "sleepTimerDisplay";
  document.body.appendChild(sleepTimerDisplay);
});

let currentSong;
let updateProgress;
let formatTime;
let currentVolume;
let setVolume;
let toggleMute;
let toggleRepeat;
let toggleShuffle;
let toggleQueue;
let isPlaying;
let nextTrack;
let togglePlayPause;

// Declare missing variables
let showNotification;
let userData;
let saveUserData;
let loadUserPlaylists;
let musicLibrary;
