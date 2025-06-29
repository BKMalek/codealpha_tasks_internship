// Statistics Management
class StatisticsManager {
  constructor() {
    this.stats = {
      totalCalculations: 0,
      totalNotes: 0,
      calculationsByType: {},
      recentActivity: [],
      streakDays: 0,
      mostUsedType: "Scientific",
    };
    this.chart = null;
    this.init();
  }

  init() {
    this.loadStats();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Auto-refresh stats when view becomes active
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const target = mutation.target;
          if (
            target.id === "statisticsView" &&
            target.classList.contains("active")
          ) {
            this.loadStats();
          }
        }
      });
    });

    const statisticsView = document.getElementById("statisticsView");
    if (statisticsView) {
      observer.observe(statisticsView, { attributes: true });
    }
  }

  async loadStats() {
    try {
      // Load from local storage for offline mode
      await this.loadLocalStats();
      this.updateStatsDisplay();
      this.updateChart();
      this.updateActivityList();
    } catch (error) {
      console.error("Failed to load statistics:", error);
      this.showDefaultStats();
    }
  }

  async loadLocalStats() {
    // Get calculator history
    const history = JSON.parse(
      localStorage.getItem("calculatorHistory") || "[]"
    );
    const notes = JSON.parse(localStorage.getItem("calculatorNotes") || "[]");

    // Calculate basic stats
    this.stats.totalCalculations = history.length;
    this.stats.totalNotes = notes.length;

    // Calculate calculations by type
    this.stats.calculationsByType = {};
    history.forEach((item) => {
      const type = item.type || "basic";
      this.stats.calculationsByType[type] =
        (this.stats.calculationsByType[type] || 0) + 1;
    });

    // Find most used type
    let maxCount = 0;
    let mostUsed = "Scientific";
    for (const [type, count] of Object.entries(this.stats.calculationsByType)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    this.stats.mostUsedType = mostUsed;

    // Calculate streak (simplified - just check if used today)
    const today = new Date().toDateString();
    const hasActivityToday = history.some((item) => {
      const itemDate = new Date(
        item.timestamp || item.created_at || Date.now()
      ).toDateString();
      return itemDate === today;
    });
    this.stats.streakDays = hasActivityToday ? 1 : 0;

    // Recent activity
    this.stats.recentActivity = [
      ...history.slice(0, 5).map((item) => ({
        type: "calculation",
        title: item.expression || "Calculation",
        time: item.timestamp || item.created_at || Date.now(),
      })),
      ...notes.slice(0, 5).map((note) => ({
        type: "note",
        title: note.title || "Note",
        time: note.updated_at || note.timestamp || Date.now(),
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);
  }

  updateStatsDisplay() {
    // Update stat cards
    const totalCalculationsEl = document.getElementById("totalCalculations");
    const totalNotesEl = document.getElementById("totalNotes");
    const mostUsedTypeEl = document.getElementById("mostUsedType");
    const streakDaysEl = document.getElementById("streakDays");

    if (totalCalculationsEl)
      totalCalculationsEl.textContent = this.stats.totalCalculations;
    if (totalNotesEl) totalNotesEl.textContent = this.stats.totalNotes;
    if (mostUsedTypeEl) mostUsedTypeEl.textContent = this.stats.mostUsedType;
    if (streakDaysEl) streakDaysEl.textContent = this.stats.streakDays;

    // Animate numbers
    this.animateNumbers();
  }

  animateNumbers() {
    const numberElements = document.querySelectorAll(".stat-number");
    numberElements.forEach((el) => {
      const finalValue = Number.parseInt(el.textContent) || 0;
      let currentValue = 0;
      const increment = Math.ceil(finalValue / 20);

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          currentValue = finalValue;
          clearInterval(timer);
        }
        el.textContent = currentValue;
      }, 50);
    });
  }

  updateChart() {
    const canvas = document.getElementById("usageChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Prepare data
    const data = Object.entries(this.stats.calculationsByType);
    if (data.length === 0) {
      this.drawEmptyChart(ctx, canvas);
      return;
    }

    // Draw pie chart
    this.drawPieChart(ctx, canvas, data);
  }

  drawEmptyChart(ctx, canvas) {
    ctx.fillStyle = "#64748b";
    ctx.font = "16px Inter";
    ctx.textAlign = "center";
    ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
  }

  drawPieChart(ctx, canvas, data) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const total = data.reduce((sum, [, count]) => sum + count, 0);
    const colors = [
      "#2563eb",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
    ];

    let currentAngle = -Math.PI / 2;

    data.forEach(([type, count], index) => {
      const sliceAngle = (count / total) * 2 * Math.PI;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(type, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw legend
    this.drawLegend(ctx, canvas, data, colors);
  }

  drawLegend(ctx, canvas, data, colors) {
    const legendX = 10;
    let legendY = 10;

    ctx.font = "12px Inter";
    ctx.textAlign = "left";

    data.forEach(([type, count], index) => {
      // Draw color box
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(legendX, legendY, 12, 12);

      // Draw text
      ctx.fillStyle = "#1f2937";
      ctx.fillText(`${type}: ${count}`, legendX + 18, legendY + 9);

      legendY += 20;
    });
  }

  updateActivityList() {
    const activityList = document.getElementById("activityList");
    if (!activityList) return;

    if (this.stats.recentActivity.length === 0) {
      activityList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <p>No recent activity</p>
          </div>
        `;
      return;
    }

    activityList.innerHTML = this.stats.recentActivity
      .map(
        (activity) => `
        <div class="activity-item">
          <div class="activity-icon">
            ${activity.type === "calculation" ? "🧮" : "📝"}
          </div>
          <div class="activity-info">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-time">${this.formatTime(activity.time)}</div>
          </div>
        </div>
      `
      )
      .join("");
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  showDefaultStats() {
    // Show default/demo stats
    this.stats = {
      totalCalculations: 0,
      totalNotes: 0,
      calculationsByType: {},
      recentActivity: [],
      streakDays: 0,
      mostUsedType: "Scientific",
    };

    this.updateStatsDisplay();
    this.updateChart();
    this.updateActivityList();
  }

  // Method to be called when new calculations are made
  incrementCalculation(type = "basic") {
    this.stats.totalCalculations++;
    this.stats.calculationsByType[type] =
      (this.stats.calculationsByType[type] || 0) + 1;

    // Update most used type
    let maxCount = 0;
    let mostUsed = "Scientific";
    for (const [calcType, count] of Object.entries(
      this.stats.calculationsByType
    )) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = calcType.charAt(0).toUpperCase() + calcType.slice(1);
      }
    }
    this.stats.mostUsedType = mostUsed;

    // Add to recent activity
    this.stats.recentActivity.unshift({
      type: "calculation",
      title: "New Calculation",
      time: Date.now(),
    });

    if (this.stats.recentActivity.length > 10) {
      this.stats.recentActivity = this.stats.recentActivity.slice(0, 10);
    }

    // Update display if statistics view is active
    const statisticsView = document.getElementById("statisticsView");
    if (statisticsView && statisticsView.classList.contains("active")) {
      this.updateStatsDisplay();
      this.updateChart();
      this.updateActivityList();
    }
  }

  // Method to be called when new notes are created
  incrementNotes() {
    this.stats.totalNotes++;

    // Add to recent activity
    this.stats.recentActivity.unshift({
      type: "note",
      title: "New Note",
      time: Date.now(),
    });

    if (this.stats.recentActivity.length > 10) {
      this.stats.recentActivity = this.stats.recentActivity.slice(0, 10);
    }

    // Update display if statistics view is active
    const statisticsView = document.getElementById("statisticsView");
    if (statisticsView && statisticsView.classList.contains("active")) {
      this.updateStatsDisplay();
      this.updateActivityList();
    }
  }
}

// Create global statistics manager instance
const statisticsManager = new StatisticsManager();

// Make it globally available
window.statisticsManager = statisticsManager;
