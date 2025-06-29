// Notes Management
class NotesManager {
  constructor() {
    this.currentNote = null;
    this.notes = [];
    this.currentCategory = "";
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadNotes();
  }

  setupEventListeners() {
    // Category buttons
    const categoryBtns = document.querySelectorAll(".category-btn");
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.getAttribute("data-category");
        this.switchCategory(category);
      });
    });

    // Auto-save functionality
    const noteTitle = document.getElementById("noteTitle");
    const noteContent = document.getElementById("noteContent");

    if (noteTitle && noteContent) {
      let saveTimeout;

      const autoSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          if (this.currentNote && (noteTitle.value || noteContent.value)) {
            this.saveNote(false); // Silent save
          }
        }, 2000);
      };

      noteTitle.addEventListener("input", autoSave);
      noteContent.addEventListener("input", autoSave);
    }
  }

  switchCategory(category) {
    this.currentCategory = category;

    // Update category buttons
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-category") === category) {
        btn.classList.add("active");
      }
    });

    this.loadNotes();
  }

  async loadNotes() {
    try {
      const auth = window.auth; // Declare auth variable
      const api = window.api; // Declare api variable

      if (auth.isLoggedIn()) {
        const response = await api.getNotes(this.currentCategory);
        this.notes = response;
      } else {
        const localNotes = JSON.parse(
          localStorage.getItem("calculatorNotes") || "[]"
        );
        this.notes = this.currentCategory
          ? localNotes.filter((note) => note.category === this.currentCategory)
          : localNotes;
      }

      this.displayNotes();
    } catch (error) {
      console.error("Failed to load notes:", error);
      const showToast = window.showToast; // Declare showToast variable
      showToast("Failed to load notes", "error");

      // Fallback to local storage
      const localNotes = JSON.parse(
        localStorage.getItem("calculatorNotes") || "[]"
      );
      this.notes = this.currentCategory
        ? localNotes.filter((note) => note.category === this.currentCategory)
        : localNotes;
      this.displayNotes();
    }
  }

  displayNotes() {
    const notesList = document.getElementById("notesList");

    if (this.notes.length === 0) {
      notesList.innerHTML = `
                  <div class="empty-state">
                      <div class="empty-icon">📝</div>
                      <h4>No notes yet</h4>
                      <p>Create your first note to get started</p>
                  </div>
              `;
      return;
    }

    notesList.innerHTML = this.notes
      .map(
        (note) => `
              <div class="note-item ${
                this.currentNote && this.currentNote.id === note.id
                  ? "active"
                  : ""
              }" 
                   onclick="notesManager.loadNote(${JSON.stringify(
                     note
                   ).replace(/"/g, "&quot;")})">
                  <div class="note-title">${note.title || "Untitled"}</div>
                  <div class="note-preview">${this.getPreview(
                    note.content
                  )}</div>
                  <div class="note-meta">
                      <span class="note-category">${note.category}</span>
                      <span class="note-date">${this.formatDate(
                        note.updated_at || note.timestamp
                      )}</span>
                  </div>
              </div>
          `
      )
      .join("");
  }

  getPreview(content) {
    if (!content) return "No content";
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  }

  createNote() {
    this.currentNote = {
      id: Date.now(),
      title: "",
      content: "",
      category: document.getElementById("noteCategory").value || "general",
      timestamp: new Date().toISOString(),
    };

    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    document.getElementById("noteCategory").value = this.currentNote.category;

    // Focus on title input
    document.getElementById("noteTitle").focus();

    const showToast = window.showToast; // Declare showToast variable
    showToast("New note created", "success");
  }

  loadNote(note) {
    this.currentNote = note;

    document.getElementById("noteTitle").value = note.title || "";
    document.getElementById("noteContent").value = note.content || "";
    document.getElementById("noteCategory").value = note.category || "general";

    // Update active note in list
    document.querySelectorAll(".note-item").forEach((item) => {
      item.classList.remove("active");
    });
    event.target.closest(".note-item").classList.add("active");
  }

  async saveNote(showNotification = true) {
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();
    const category = document.getElementById("noteCategory").value;

    if (!title && !content) {
      if (showNotification) {
        const showToast = window.showToast; // Declare showToast variable
        showToast("Please enter a title or content", "warning");
      }
      return;
    }

    if (!this.currentNote) {
      this.currentNote = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
      };
    }

    this.currentNote.title = title || "Untitled";
    this.currentNote.content = content;
    this.currentNote.category = category;
    this.currentNote.updated_at = new Date().toISOString();

    try {
      const auth = window.auth; // Declare auth variable
      const api = window.api; // Declare api variable

      if (auth.isLoggedIn()) {
        if (this.currentNote.id && typeof this.currentNote.id === "string") {
          // Update existing note
          await api.updateNote(this.currentNote.id, {
            title: this.currentNote.title,
            content: this.currentNote.content,
            category: this.currentNote.category,
          });
        } else {
          // Create new note
          const response = await api.saveNote({
            title: this.currentNote.title,
            content: this.currentNote.content,
            category: this.currentNote.category,
          });
          this.currentNote.id = response.id;
        }
      } else {
        // Save to local storage
        const localNotes = JSON.parse(
          localStorage.getItem("calculatorNotes") || "[]"
        );
        const existingIndex = localNotes.findIndex(
          (note) => note.id === this.currentNote.id
        );

        if (existingIndex !== -1) {
          localNotes[existingIndex] = this.currentNote;
        } else {
          localNotes.push(this.currentNote);
        }

        localStorage.setItem("calculatorNotes", JSON.stringify(localNotes));
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      const showToast = window.showToast; // Declare showToast variable
      showToast("Failed to save note", "error");
    }

    if (showNotification && window.statisticsManager) {
      window.statisticsManager.incrementNotes();
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}

window.auth = window.auth || {
  isLoggedIn: () => false, // Default to offline mode
};

window.api = window.api || {
  getNotes: async () => [],
  saveNote: async () => ({ id: Date.now() }),
  updateNote: async () => true,
  deleteNote: async () => true,
};

window.showToast =
  window.showToast ||
  ((message, type) => {
    console.log(`Toast: ${message} (${type})`);
  });
