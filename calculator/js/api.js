// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

class ApiClient {
  constructor() {
    this.token = localStorage.getItem("authToken");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Calculation methods
  async saveCalculation(calculationData) {
    return this.request("/calculations", {
      method: "POST",
      body: JSON.stringify(calculationData),
    });
  }

  async getCalculations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/calculations?${queryString}`);
  }

  async deleteCalculation(id) {
    return this.request(`/calculations/${id}`, {
      method: "DELETE",
    });
  }

  // Notes methods
  async saveNote(noteData) {
    return this.request("/notes", {
      method: "POST",
      body: JSON.stringify(noteData),
    });
  }

  async getNotes(category = "") {
    const queryString = category ? `?category=${category}` : "";
    return this.request(`/notes${queryString}`);
  }

  async updateNote(id, noteData) {
    return this.request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: "DELETE",
    });
  }

  // Statistics methods
  async getStats() {
    return this.request("/stats");
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

// Create global API instance
const api = new ApiClient();
