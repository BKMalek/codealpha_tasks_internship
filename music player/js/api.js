// API Interface for Backend Communication

class SoundWaveAPI {
  constructor() {
    this.baseURL = "/api"; // Change this to your backend URL
    this.token = localStorage.getItem("soundwave_token");
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Authentication Methods
  async login(email, password) {
    try {
      const response = await this.makeRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem("soundwave_token", this.token);
      }

      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(userData) {
    try {
      const response = await this.makeRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem("soundwave_token", this.token);
      }

      return response;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.token = null;
      localStorage.removeItem("soundwave_token");
    }
  }

  async refreshToken() {
    try {
      const response = await this.makeRequest("/auth/refresh", {
        method: "POST",
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem("soundwave_token", this.token);
      }

      return response;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // User Methods
  async getUserProfile() {
    return this.makeRequest("/user/profile");
  }

  async updateUserProfile(profileData) {
    return this.makeRequest("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async getUserStats() {
    return this.makeRequest("/user/stats");
  }

  // Music Library Methods
  async getSongs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/songs${queryString ? `?${queryString}` : ""}`);
  }

  async getSong(songId) {
    return this.makeRequest(`/songs/${songId}`);
  }

  async searchSongs(query, filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/songs/search?${queryString}`);
  }

  async getRecommendations(count = 10) {
    return this.makeRequest(`/songs/recommendations?count=${count}`);
  }

  async getPopularSongs(limit = 20) {
    return this.makeRequest(`/songs/popular?limit=${limit}`);
  }

  async getNewReleases(limit = 20) {
    return this.makeRequest(`/songs/new?limit=${limit}`);
  }

  // Upload Methods
  async uploadSong(file, metadata) {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("metadata", JSON.stringify(metadata));

    return this.makeRequest("/songs/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async uploadAlbumArt(songId, imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    return this.makeRequest(`/songs/${songId}/artwork`, {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async deleteSong(songId) {
    return this.makeRequest(`/songs/${songId}`, {
      method: "DELETE",
    });
  }

  // Playlist Methods
  async getPlaylists() {
    return this.makeRequest("/playlists");
  }

  async getPlaylist(playlistId) {
    return this.makeRequest(`/playlists/${playlistId}`);
  }

  async createPlaylist(playlistData) {
    return this.makeRequest("/playlists", {
      method: "POST",
      body: JSON.stringify(playlistData),
    });
  }

  async updatePlaylist(playlistId, playlistData) {
    return this.makeRequest(`/playlists/${playlistId}`, {
      method: "PUT",
      body: JSON.stringify(playlistData),
    });
  }

  async deletePlaylist(playlistId) {
    return this.makeRequest(`/playlists/${playlistId}`, {
      method: "DELETE",
    });
  }

  async addSongToPlaylist(playlistId, songId) {
    return this.makeRequest(`/playlists/${playlistId}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  }

  async removeSongFromPlaylist(playlistId, songId) {
    return this.makeRequest(`/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
    });
  }

  // Favorites Methods
  async getFavorites() {
    return this.makeRequest("/user/favorites");
  }

  async addToFavorites(songId) {
    return this.makeRequest("/user/favorites", {
      method: "POST",
      body: JSON.stringify({ songId }),
    });
  }

  async removeFromFavorites(songId) {
    return this.makeRequest(`/user/favorites/${songId}`, {
      method: "DELETE",
    });
  }

  // Listening History Methods
  async getListeningHistory(limit = 50) {
    return this.makeRequest(`/user/history?limit=${limit}`);
  }

  async addToHistory(songId, duration = null) {
    return this.makeRequest("/user/history", {
      method: "POST",
      body: JSON.stringify({ songId, duration }),
    });
  }

  async clearHistory() {
    return this.makeRequest("/user/history", {
      method: "DELETE",
    });
  }

  // Analytics Methods
  async trackPlay(songId, duration) {
    return this.makeRequest("/analytics/play", {
      method: "POST",
      body: JSON.stringify({ songId, duration }),
    });
  }

  async trackSkip(songId, position) {
    return this.makeRequest("/analytics/skip", {
      method: "POST",
      body: JSON.stringify({ songId, position }),
    });
  }

  async getAnalytics(timeframe = "7d") {
    return this.makeRequest(`/analytics?timeframe=${timeframe}`);
  }

  // Social Features
  async followUser(userId) {
    return this.makeRequest("/social/follow", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async unfollowUser(userId) {
    return this.makeRequest(`/social/follow/${userId}`, {
      method: "DELETE",
    });
  }

  async getFollowers() {
    return this.makeRequest("/social/followers");
  }

  async getFollowing() {
    return this.makeRequest("/social/following");
  }

  async sharePlaylist(playlistId, userIds) {
    return this.makeRequest("/social/share", {
      method: "POST",
      body: JSON.stringify({ playlistId, userIds }),
    });
  }

  // Core Request Method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    const config = {
      method: "GET",
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    let lastError;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);

        if (response.status === 401) {
          // Token expired, try to refresh
          if (this.token && attempt === 0) {
            try {
              await this.refreshToken();
              config.headers["Authorization"] = `Bearer ${this.token}`;
              continue; // Retry with new token
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.handleAuthError();
              throw new Error("Authentication failed");
            }
          } else {
            this.handleAuthError();
            throw new Error("Authentication required");
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      } catch (error) {
        lastError = error;

        // Don't retry for certain errors
        if (
          error.message.includes("Authentication") ||
          error.message.includes("400") ||
          error.message.includes("404")
        ) {
          throw error;
        }

        // Wait before retrying
        if (attempt < this.retryAttempts - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  // Utility Methods
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  handleAuthError() {
    this.token = null;
    localStorage.removeItem("soundwave_token");

    // Redirect to login or show auth modal
    if (typeof showLogin === "function") {
      showLogin();
    } else {
      window.location.href = "/login";
    }
  }

  // File Upload with Progress
  async uploadWithProgress(endpoint, file, metadata, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("audio", file);
      formData.append("metadata", JSON.stringify(metadata));

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed: Network error"));
      });

      xhr.open("POST", `${this.baseURL}${endpoint}`);

      if (this.token) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.token}`);
      }

      xhr.send(formData);
    });
  }

  // Batch Operations
  async batchUpload(files, metadata, onProgress) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileMetadata = {
        ...metadata,
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
      };

      try {
        const result = await this.uploadWithProgress(
          "/songs/upload",
          file,
          fileMetadata,
          (progress) => {
            const overallProgress = (i / total) * 100 + progress / total;
            onProgress(overallProgress, file.name, progress);
          }
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        results.push({ error: error.message, file: file.name });
      }
    }

    return results;
  }

  // Offline Support
  async syncOfflineData() {
    const offlineData = this.getOfflineData();

    if (offlineData.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    for (const item of offlineData) {
      try {
        await this.makeRequest(item.endpoint, item.options);
        this.removeOfflineItem(item.id);
        synced++;
      } catch (error) {
        console.error("Failed to sync offline item:", error);
        failed++;
      }
    }

    return { synced, failed };
  }

  addOfflineItem(endpoint, options) {
    const offlineData = this.getOfflineData();
    const item = {
      id: Date.now() + Math.random(),
      endpoint,
      options,
      timestamp: Date.now(),
    };

    offlineData.push(item);
    localStorage.setItem("soundwave_offline", JSON.stringify(offlineData));
  }

  getOfflineData() {
    const data = localStorage.getItem("soundwave_offline");
    return data ? JSON.parse(data) : [];
  }

  removeOfflineItem(id) {
    const offlineData = this.getOfflineData();
    const filtered = offlineData.filter((item) => item.id !== id);
    localStorage.setItem("soundwave_offline", JSON.stringify(filtered));
  }

  clearOfflineData() {
    localStorage.removeItem("soundwave_offline");
  }
}

// Initialize API instance
const api = new SoundWaveAPI();

// Export for global use
window.SoundWaveAPI = api;

// Auto-sync offline data when online
window.addEventListener("online", () => {
  api.syncOfflineData().then((result) => {
    if (result.synced > 0) {
      showNotification(`Synced ${result.synced} offline actions`, "success");
    }
    if (result.failed > 0) {
      showNotification(`Failed to sync ${result.failed} actions`, "warning");
    }
  });
});

// Handle offline actions
window.addEventListener("offline", () => {
  showNotification(
    "You are offline. Actions will be synced when connection is restored.",
    "info"
  );
});

// Enhanced error handling for API calls
function handleAPIError(error, context = "") {
  console.error(`API Error ${context}:`, error);

  if (error.message.includes("Authentication")) {
    showNotification("Please sign in to continue", "warning");
  } else if (error.message.includes("Network")) {
    showNotification("Network error. Please check your connection.", "error");
  } else {
    showNotification(`Error: ${error.message}`, "error");
  }
}

// API wrapper functions for easier use
const APIWrapper = {
  // Authentication
  async login(email, password) {
    try {
      return await api.login(email, password);
    } catch (error) {
      handleAPIError(error, "login");
      throw error;
    }
  },

  async register(userData) {
    try {
      return await api.register(userData);
    } catch (error) {
      handleAPIError(error, "register");
      throw error;
    }
  },

  // Music operations
  async uploadSong(file, metadata, onProgress) {
    try {
      return await api.uploadWithProgress(
        "/songs/upload",
        file,
        metadata,
        onProgress
      );
    } catch (error) {
      handleAPIError(error, "upload");
      throw error;
    }
  },

  async getSongs(params) {
    try {
      return await api.getSongs(params);
    } catch (error) {
      handleAPIError(error, "get songs");
      return []; // Return empty array on error
    }
  },

  async searchSongs(query, filters) {
    try {
      return await api.searchSongs(query, filters);
    } catch (error) {
      handleAPIError(error, "search");
      return [];
    }
  },

  // Playlist operations
  async createPlaylist(playlistData) {
    try {
      return await api.createPlaylist(playlistData);
    } catch (error) {
      handleAPIError(error, "create playlist");
      throw error;
    }
  },

  async addToFavorites(songId) {
    try {
      return await api.addToFavorites(songId);
    } catch (error) {
      // Store offline if network error
      if (error.message.includes("Network")) {
        api.addOfflineItem("/user/favorites", {
          method: "POST",
          body: JSON.stringify({ songId }),
        });
        showNotification("Added to favorites (will sync when online)", "info");
      } else {
        handleAPIError(error, "add to favorites");
      }
    }
  },

  async trackPlay(songId, duration) {
    try {
      return await api.trackPlay(songId, duration);
    } catch (error) {
      // Analytics can fail silently
      console.warn("Failed to track play:", error);
    }
  },
};

// Export wrapper for global use
window.APIWrapper = APIWrapper;

// Declare missing variables
let showLogin;
let showNotification;
