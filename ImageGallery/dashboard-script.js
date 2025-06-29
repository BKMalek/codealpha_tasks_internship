// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "auth.html";
    return;
  }

  // Initialize dashboard
  const initDashboard = () => {
    loadUserData();
    loadDashboardStats();
    loadRecentActivity();
    loadTopVibes();
    setupCharts();
    setupTimeFilters();
  };

  // Load user data
  const loadUserData = () => {
    const userName = localStorage.getItem("userName") || "Creative Soul";
    const userEmail =
      localStorage.getItem("userEmail") || "user@visualvibe.com";

    // Update welcome message
    const welcomeMessage = document.querySelector(".welcome-message h1");
    if (welcomeMessage) {
      welcomeMessage.innerHTML = `Welcome back, <span class="gradient-text">${userName}</span>!`;
    }

    // Update user avatar
    const userAvatar = document.querySelector(".user-avatar img");
    if (userAvatar) {
      userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userName
      )}&background=ff3366&color=fff&size=45`;
    }
  };

  // Load dashboard stats
  const loadDashboardStats = () => {
    const stats = {
      totalVibes: 127,
      totalLikes: 2840,
      totalViews: 15600,
      totalFollowers: 892,
    };

    // Animate counters
    Object.keys(stats).forEach((key) => {
      const element = document.querySelector(`[data-stat="${key}"]`);
      if (element) {
        animateCounter(element, stats[key]);
      }
    });

    // Update stat changes
    const changes = {
      totalVibes: "+12%",
      totalLikes: "+28%",
      totalViews: "+15%",
      totalFollowers: "+8%",
    };

    Object.keys(changes).forEach((key) => {
      const changeElement = document.querySelector(`[data-change="${key}"]`);
      if (changeElement) {
        changeElement.textContent = changes[key];
        changeElement.className = changes[key].startsWith("+")
          ? "stat-change positive"
          : "stat-change negative";
      }
    });
  };

  // Animate counter
  const animateCounter = (element, target) => {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  };

  // Load recent activity
  const loadRecentActivity = () => {
    const activities = [
      {
        type: "like",
        message: "Sarah liked your photo 'Sunset Dreams'",
        time: "2 minutes ago",
        icon: "fas fa-heart",
      },
      {
        type: "follow",
        message: "Alex started following you",
        time: "15 minutes ago",
        icon: "fas fa-user-plus",
      },
      {
        type: "comment",
        message: "Maya commented on 'Urban Vibes'",
        time: "1 hour ago",
        icon: "fas fa-comment",
      },
      {
        type: "upload",
        message: "You uploaded 'Portrait Magic'",
        time: "3 hours ago",
        icon: "fas fa-upload",
      },
      {
        type: "feature",
        message: "Your photo was featured in 'Nature Collection'",
        time: "1 day ago",
        icon: "fas fa-star",
      },
    ];

    const activityList = document.querySelector(".activity-list");
    if (activityList) {
      activityList.innerHTML = activities
        .map(
          (activity) => `
            <div class="activity-item">
              <div class="activity-icon">
                <i class="${activity.icon}"></i>
              </div>
              <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
              </div>
            </div>
          `
        )
        .join("");
    }
  };

  // Load top vibes
  const loadTopVibes = () => {
    const topVibes = [
      {
        title: "Sunset Dreams",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
        likes: 234,
        views: 1520,
        downloads: 89,
      },
      {
        title: "Urban Vibes",
        image:
          "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=100&h=100&fit=crop",
        likes: 189,
        views: 892,
        downloads: 45,
      },
      {
        title: "Portrait Magic",
        image:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        likes: 456,
        views: 2340,
        downloads: 123,
      },
    ];

    const topVibesList = document.querySelector(
      ".top-vibes .dashboard-card .card-content"
    );
    if (topVibesList) {
      topVibesList.innerHTML = topVibes
        .map(
          (vibe) => `
            <div class="top-vibe-item">
              <div class="vibe-thumbnail">
                <img src="${vibe.image}" alt="${vibe.title}">
              </div>
              <div class="vibe-stats">
                <h4>${vibe.title}</h4>
                <div class="stats-row">
                  <span><i class="fas fa-heart"></i> ${vibe.likes}</span>
                  <span><i class="fas fa-eye"></i> ${vibe.views}</span>
                  <span><i class="fas fa-download"></i> ${vibe.downloads}</span>
                </div>
              </div>
            </div>
          `
        )
        .join("");
    }
  };

  // Setup charts
  const setupCharts = () => {
    const chartContainer = document.querySelector(".chart-container");
    if (chartContainer) {
      // Simple chart simulation
      chartContainer.innerHTML = `
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-bar" style="height: 45%"></div>
              <div class="chart-bar" style="height: 90%"></div>
              <div class="chart-bar" style="height: 70%"></div>
              <div class="chart-bar" style="height: 85%"></div>
              <div class="chart-bar" style="height: 95%"></div>
            </div>
            <div class="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        `;
    }

    // Add chart styles
    const chartStyles = `
        .chart-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1rem;
        }
        
        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          gap: 0.5rem;
        }
        
        .chart-bar {
          flex: 1;
          background: linear-gradient(135deg, #ff3366 0%, #6c63ff 50%, #00d9b2 100%);
          border-radius: 4px 4px 0 0;
          min-height: 20px;
          transition: all 0.3s ease;
        }
        
        .chart-bar:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }
        
        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #6c757d;
        }
      `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = chartStyles;
    document.head.appendChild(styleSheet);
  };

  // Setup time filters
  const setupTimeFilters = () => {
    const timeFilters = document.querySelectorAll(".time-filter");
    const chartBtns = document.querySelectorAll(".chart-btn");

    timeFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        updateDashboardData(filter.value);
      });
    });

    chartBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        chartBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updateChart(btn.dataset.chart);
      });
    });
  };

  // Update dashboard data based on time filter
  const updateDashboardData = (timeRange) => {
    // Simulate data update based on time range
    console.log(`Updating dashboard data for: ${timeRange}`);
    // In a real app, this would fetch new data from the API
  };

  // Update chart based on selection
  const updateChart = (chartType) => {
    console.log(`Updating chart to: ${chartType}`);
    // In a real app, this would update the chart visualization
  };

  // Initialize dashboard
  initDashboard();
});
