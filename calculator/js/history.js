// History Management
class HistoryManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.currentFilter = "";
    this.auth = window.auth || { isLoggedIn: () => false };
    this.api = window.api || {
      getCalculations: async () => [],
      deleteCalculation: async () => true,
    };
    this.calculator = window.calculator;
    this.switchView = window.switchView || (() => {});
    this.showToast =
      window.showToast ||
      ((msg, type) => console.log(`Toast: ${msg} (${type})`));
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const historyFilter = document.getElementById("historyFilter");
    if (historyFilter) {
      historyFilter.addEventListener("change", (e) => {
        this.currentFilter = e.target.value;
        this.currentPage = 1;
        this.loadHistory();
      });
    }
  }

  async loadHistory() {
    if (!this.auth.isLoggedIn()) {
      this.showLocalHistory();
      return;
    }

    try {
      const params = {
        page: this.currentPage,
        limit: this.itemsPerPage,
      };

      if (this.currentFilter) {
        params.type = this.currentFilter;
      }

      const response = await this.api.getCalculations(params);
      this.displayHistory(response);
    } catch (error) {
      console.error("Failed to load history:", error);
      this.showToast("Failed to load history", "error");
      this.showLocalHistory();
    }
  }

  showLocalHistory() {
    const localHistory = JSON.parse(
      localStorage.getItem("calculatorHistory") || "[]"
    );
    let filteredHistory = localHistory;

    if (this.currentFilter) {
      filteredHistory = localHistory.filter(
        (item) => item.type === this.currentFilter
      );
    }

    this.displayHistory(filteredHistory);
  }

  displayHistory(historyData) {
    const historyList = document.getElementById("historyList");
    const historyArray = Array.isArray(historyData)
      ? historyData
      : historyData.calculations || [];

    if (historyArray.length === 0) {
      historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No calculations yet</h3>
                    <p>Start calculating to see your history here</p>
                </div>
            `;
      return;
    }

    historyList.innerHTML = historyArray
      .map(
        (item) => `
            <div class="history-item" onclick="historyManager.useHistoryItem('${
              item.expression
            }', '${item.result}')">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-meta">
                    <span class="history-type">${item.type || "basic"}</span>
                    <span class="history-time">${this.formatDate(
                      item.created_at || item.timestamp
                    )}</span>
                    ${
                      this.auth.isLoggedIn()
                        ? `<button onclick="event.stopPropagation(); historyManager.deleteHistoryItem(${item.id})" class="delete-btn">🗑️</button>`
                        : ""
                    }
                </div>
            </div>
        `
      )
      .join("");

    // Update pagination if needed
    if (historyData.totalPages && historyData.totalPages > 1) {
      this.updatePagination(historyData.totalPages);
    }
  }

  useHistoryItem(expression, result) {
    this.calculator.currentExpression = expression;
    this.calculator.currentResult = result;
    this.calculator.updateDisplay();

    // Switch to calculator view
    this.switchView("calculator");
    this.showToast("History item loaded", "success");
  }

  async deleteHistoryItem(id) {
    if (!confirm("Are you sure you want to delete this calculation?")) {
      return;
    }

    try {
      await this.api.deleteCalculation(id);
      this.showToast("Calculation deleted", "success");
      this.loadHistory();
    } catch (error) {
      console.error("Failed to delete calculation:", error);
      this.showToast("Failed to delete calculation", "error");
    }
  }

  async clearHistory() {
    if (
      !confirm(
        "Are you sure you want to clear all history? This action cannot be undone."
      )
    ) {
      return;
    }

    if (this.auth.isLoggedIn()) {
      try {
        // Delete all calculations from server
        const response = await this.api.getCalculations();
        const calculations = response.calculations || response;

        for (const calc of calculations) {
          await this.api.deleteCalculation(calc.id);
        }

        this.showToast("History cleared", "success");
        this.loadHistory();
      } catch (error) {
        console.error("Failed to clear history:", error);
        this.showToast("Failed to clear history", "error");
      }
    } else {
      localStorage.removeItem("calculatorHistory");
      this.showToast("Local history cleared", "success");
      this.loadHistory();
    }
  }

  async exportHistory() {
    let historyData;

    if (this.auth.isLoggedIn()) {
      try {
        const response = await this.api.getCalculations({ limit: 1000 });
        historyData = response.calculations || response;
      } catch (error) {
        console.error("Failed to fetch history for export:", error);
        historyData = JSON.parse(
          localStorage.getItem("calculatorHistory") || "[]"
        );
      }
    } else {
      historyData = JSON.parse(
        localStorage.getItem("calculatorHistory") || "[]"
      );
    }

    if (historyData.length === 0) {
      this.showToast("No history to export", "warning");
      return;
    }

    const exportData = historyData.map((item) => ({
      Expression: item.expression,
      Result: item.result,
      Type: item.type || "basic",
      Date: this.formatDate(item.created_at || item.timestamp),
    }));

    // Convert to CSV
    const csvContent = this.convertToCSV(exportData);
    this.downloadFile("calculation-history.csv", csvContent, "text/csv");

    this.showToast("History exported successfully!", "success");
  }

  convertToCSV(data) {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }

  downloadFile(filename, content, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  formatDate(dateString) {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  updatePagination(totalPages) {
    const paginationContainer = document.getElementById("historyPagination");
    if (!paginationContainer) return;

    let paginationHTML = "";

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<button onclick="historyManager.goToPage(${
        this.currentPage - 1
      })">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        paginationHTML += `<button class="active">${i}</button>`;
      } else {
        paginationHTML += `<button onclick="historyManager.goToPage(${i})">${i}</button>`;
      }
    }

    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `<button onclick="historyManager.goToPage(${
        this.currentPage + 1
      })">Next</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadHistory();
  }
}

// Global functions
function clearHistory(historyManager) {
  historyManager.clearHistory();
}

function exportHistory(historyManager) {
  historyManager.exportHistory();
}

// Create global history manager instance
const historyManager = new HistoryManager();
window.historyManager = historyManager;
