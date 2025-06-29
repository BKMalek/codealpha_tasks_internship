// Calculator Logic
class Calculator {
  constructor() {
    this.currentExpression = "";
    this.currentResult = "0";
    this.memory = 0;
    this.isResultDisplayed = false;
    this.currentMode = "scientific";
    this.history = [];
    this.statisticsData = [];
    this.graphFunctions = [];

    this.init();
  }

  init() {
    this.updateDisplay();
    this.initializeModes();
    this.initializeKeyboard();
  }

  initializeModes() {
    const modeBtns = document.querySelectorAll(".mode-btn");
    modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        this.switchMode(mode);
      });
    });
  }

  switchMode(mode) {
    this.currentMode = mode;

    // Update mode buttons
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-mode") === mode) {
        btn.classList.add("active");
      }
    });

    // Update calculator grids
    document.querySelectorAll(".calculator-grid").forEach((grid) => {
      grid.classList.remove("active");
    });

    const targetGrid = document.getElementById(`${mode}Grid`);
    if (targetGrid) {
      targetGrid.classList.add("active");
    }

    // Initialize mode-specific features
    if (mode === "graphing") {
      this.initializeGraphing();
    }

    window.showToast(`Switched to ${mode} calculator`, "success");
  }

  // Basic Calculator Functions
  addNumber(num) {
    if (this.isResultDisplayed) {
      this.currentExpression = "";
      this.isResultDisplayed = false;
    }

    this.currentExpression += num;
    this.updateDisplay();
  }

  addOperator(op) {
    if (this.isResultDisplayed) {
      this.currentExpression = this.currentResult;
      this.isResultDisplayed = false;
    }

    const lastChar = this.currentExpression.slice(-1);
    if (
      ["+", "-", "*", "/", "^", "%"].includes(lastChar) &&
      ["+", "-", "*", "/", "^", "%"].includes(op)
    ) {
      this.currentExpression = this.currentExpression.slice(0, -1) + op;
    } else {
      this.currentExpression += op;
    }

    this.updateDisplay();
  }

  addFunction(func) {
    if (this.isResultDisplayed) {
      this.currentExpression = "";
      this.isResultDisplayed = false;
    }

    this.currentExpression += func;
    this.updateDisplay();
  }

  addConstant(value) {
    if (this.isResultDisplayed) {
      this.currentExpression = "";
      this.isResultDisplayed = false;
    }

    this.currentExpression += value.toString();
    this.updateDisplay();
  }

  clearAll() {
    this.currentExpression = "";
    this.currentResult = "0";
    this.updateDisplay();
    this.closeSolutionPanel();
  }

  backspace() {
    if (this.isResultDisplayed) {
      this.clearAll();
      return;
    }

    this.currentExpression = this.currentExpression.slice(0, -1);
    this.updateDisplay();
  }

  toggleSign() {
    if (this.currentResult !== "0" && this.currentResult !== "") {
      if (this.currentResult.startsWith("-")) {
        this.currentResult = this.currentResult.substring(1);
      } else {
        this.currentResult = "-" + this.currentResult;
      }
      this.currentExpression = this.currentResult;
      this.updateDisplay();
    }
  }

  // Mathematical Functions
  sin(x) {
    return Math.sin((x * Math.PI) / 180);
  }
  cos(x) {
    return Math.cos((x * Math.PI) / 180);
  }
  tan(x) {
    return Math.tan((x * Math.PI) / 180);
  }
  asin(x) {
    return (Math.asin(x) * 180) / Math.PI;
  }
  acos(x) {
    return (Math.acos(x) * 180) / Math.PI;
  }
  atan(x) {
    return (Math.atan(x) * 180) / Math.PI;
  }
  log(x) {
    return Math.log10(x);
  }
  ln(x) {
    return Math.log(x);
  }
  sqrt(x) {
    return Math.sqrt(x);
  }
  cbrt(x) {
    return Math.cbrt(x);
  }
  abs(x) {
    return Math.abs(x);
  }
  factorial(n) {
    if (n < 0) return Number.NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  // Safe Evaluation
  safeEval(expression) {
    try {
      const jsExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/sin\(/g, "this.sin(")
        .replace(/cos\(/g, "this.cos(")
        .replace(/tan\(/g, "this.tan(")
        .replace(/asin\(/g, "this.asin(")
        .replace(/acos\(/g, "this.acos(")
        .replace(/atan\(/g, "this.atan(")
        .replace(/log\(/g, "this.log(")
        .replace(/ln\(/g, "this.ln(")
        .replace(/sqrt\(/g, "this.sqrt(")
        .replace(/cbrt\(/g, "this.cbrt(")
        .replace(/abs\(/g, "this.abs(")
        .replace(/factorial\(/g, "this.factorial(");

      const result = eval(jsExpression);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid calculation");
      }

      return result;
    } catch (error) {
      throw new Error("Error");
    }
  }

  // Calculate Result
  async calculate() {
    if (this.currentExpression === "") return;

    try {
      const result = this.safeEval(this.currentExpression);
      const roundedResult = Math.round(result * 1000000000) / 1000000000;

      // Save to history
      this.addToHistory(this.currentExpression, roundedResult.toString());

      // Save to server if authenticated
      if (window.auth.isLoggedIn()) {
        try {
          await window.api.saveCalculation({
            expression: this.currentExpression,
            result: roundedResult.toString(),
            type: this.currentMode,
            steps: this.generateSteps(this.currentExpression),
          });
        } catch (error) {
          console.error("Failed to save calculation:", error);
        }
      }

      this.currentResult = roundedResult.toString();
      this.isResultDisplayed = true;
      this.updateDisplay();

      window.showToast("Calculation completed!", "success");
    } catch (error) {
      this.currentResult = "Error";
      this.updateDisplay();
      window.showToast("Invalid expression", "error");

      setTimeout(() => {
        this.currentResult = "0";
        this.currentExpression = "";
        this.updateDisplay();
      }, 2000);
    }

    if (window.statisticsManager) {
      window.statisticsManager.incrementCalculation(this.currentMode);
    }
  }

  // Display Updates
  updateDisplay() {
    document.getElementById("displayExpression").textContent =
      this.currentExpression || "0";
    document.getElementById("displayResult").textContent = this.currentResult;

    // Update history display
    const historyElement = document.getElementById("displayHistory");
    if (this.history.length > 0) {
      const lastCalculation = this.history[0];
      historyElement.textContent = `${lastCalculation.expression} = ${lastCalculation.result}`;
    }
  }

  // Step-by-step Solutions
  showSteps() {
    if (this.currentExpression === "") {
      window.showToast("Enter an expression first", "warning");
      return;
    }

    const steps = this.generateSteps(this.currentExpression);
    const solutionContent = document.getElementById("solutionContent");

    solutionContent.innerHTML = this.formatSteps(steps);
    document.getElementById("solutionPanel").classList.add("active");

    window.showToast("Steps generated!", "success");
  }

  generateSteps(expression) {
    const steps = [];

    // Basic step generation
    steps.push({
      step: 1,
      description: "Original Expression",
      equation: expression,
      explanation: "Starting with the given expression",
    });

    if (
      expression.includes("sin(") ||
      expression.includes("cos(") ||
      expression.includes("tan(")
    ) {
      steps.push({
        step: 2,
        description: "Evaluate Trigonometric Functions",
        equation: "Calculate trigonometric values",
        explanation:
          "Convert degrees to radians and apply trigonometric functions",
      });
    }

    if (expression.includes("sqrt(") || expression.includes("cbrt(")) {
      steps.push({
        step: 2,
        description: "Evaluate Root Functions",
        equation: "Calculate square/cube roots",
        explanation: "Simplify radical expressions",
      });
    }

    steps.push({
      step: steps.length + 1,
      description: "Apply Order of Operations",
      equation: "Follow PEMDAS/BODMAS",
      explanation:
        "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
    });

    try {
      const result = this.safeEval(expression);
      steps.push({
        step: steps.length + 1,
        description: "Final Result",
        equation: result.toString(),
        explanation: "Simplified final answer",
      });
    } catch (error) {
      steps.push({
        step: steps.length + 1,
        description: "Error",
        equation: "Invalid expression",
        explanation: "Please check your input",
      });
    }

    return steps;
  }

  formatSteps(steps) {
    return steps
      .map(
        (step) => `
            <div class="solution-step">
                <div class="step-header">
                    <strong>Step ${step.step}: ${step.description}</strong>
                </div>
                <div class="step-equation">${step.equation}</div>
                <div class="step-explanation">${step.explanation}</div>
            </div>
        `
      )
      .join("");
  }

  closeSolutionPanel() {
    document.getElementById("solutionPanel").classList.remove("active");
  }

  // Memory Functions
  memoryStore() {
    this.memory = Number.parseFloat(this.currentResult) || 0;
    window.showToast(`Memory stored: ${this.memory}`, "success");
  }

  memoryRecall() {
    this.currentResult = this.memory.toString();
    this.currentExpression = this.memory.toString();
    this.updateDisplay();
    window.showToast(`Memory recalled: ${this.memory}`, "success");
  }

  memoryClear() {
    this.memory = 0;
    window.showToast("Memory cleared", "success");
  }

  // History Management
  addToHistory(expression, result) {
    this.history.unshift({
      expression,
      result,
      timestamp: new Date().toISOString(),
      type: this.currentMode,
    });

    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }

    localStorage.setItem("calculatorHistory", JSON.stringify(this.history));
  }

  // Statistics Functions
  parseData() {
    const dataInput = document.getElementById("dataInput").value;
    if (!dataInput.trim()) {
      window.showToast("Please enter data first", "warning");
      return;
    }

    this.statisticsData = dataInput
      .split(/[,\s]+/)
      .map((x) => Number.parseFloat(x))
      .filter((x) => !isNaN(x));
    window.showToast(
      `Parsed ${this.statisticsData.length} data points`,
      "success"
    );

    this.updateStatsDisplay();
  }

  calculateMean() {
    if (this.statisticsData.length === 0) {
      window.showToast("No data available. Parse data first.", "warning");
      return;
    }

    const mean =
      this.statisticsData.reduce((a, b) => a + b, 0) /
      this.statisticsData.length;
    this.currentResult = mean.toFixed(4);
    this.updateDisplay();
    this.addToHistory(
      `Mean of [${this.statisticsData.join(", ")}]`,
      this.currentResult
    );
  }

  calculateMedian() {
    if (this.statisticsData.length === 0) {
      window.showToast("No data available. Parse data first.", "warning");
      return;
    }

    const sorted = [...this.statisticsData].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    this.currentResult = median.toString();
    this.updateDisplay();
    this.addToHistory(
      `Median of [${this.statisticsData.join(", ")}]`,
      this.currentResult
    );
  }

  calculateMode() {
    if (this.statisticsData.length === 0) {
      window.showToast("No data available. Parse data first.", "warning");
      return;
    }

    const frequency = {};
    this.statisticsData.forEach((num) => {
      frequency[num] = (frequency[num] || 0) + 1;
    });

    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(
      (key) => frequency[key] === maxFreq
    );

    this.currentResult = modes.join(", ");
    this.updateDisplay();
    this.addToHistory(
      `Mode of [${this.statisticsData.join(", ")}]`,
      this.currentResult
    );
  }

  calculateStdDev() {
    if (this.statisticsData.length === 0) {
      window.showToast("No data available. Parse data first.", "warning");
      return;
    }

    const mean =
      this.statisticsData.reduce((a, b) => a + b, 0) /
      this.statisticsData.length;
    const variance =
      this.statisticsData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      this.statisticsData.length;
    const stdDev = Math.sqrt(variance);

    this.currentResult = stdDev.toFixed(4);
    this.updateDisplay();
    this.addToHistory(
      `Std Dev of [${this.statisticsData.join(", ")}]`,
      this.currentResult
    );
  }

  calculateVariance() {
    if (this.statisticsData.length === 0) {
      window.showToast("No data available. Parse data first.", "warning");
      return;
    }

    const mean =
      this.statisticsData.reduce((a, b) => a + b, 0) /
      this.statisticsData.length;
    const variance =
      this.statisticsData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      this.statisticsData.length;

    this.currentResult = variance.toFixed(4);
    this.updateDisplay();
    this.addToHistory(
      `Variance of [${this.statisticsData.join(", ")}]`,
      this.currentResult
    );
  }

  calculateRange() {
    if (this.statisticsData.length === 0) {
      window.showToast("No data available. Parse data first.", "warning");
      return;
    }

    const range =
      Math.max(...this.statisticsData) - Math.min(...this.statisticsData);
    this.currentResult = range.toString();
    this.updateDisplay();
    this.addToHistory(
      `Range of [${this.statisticsData.join(", ")}]`,
      this.currentResult
    );
  }

  updateStatsDisplay() {
    const resultsDiv = document.getElementById("statsResults");
    if (this.statisticsData.length > 0) {
      resultsDiv.innerHTML = `
                <h4>Data Summary</h4>
                <p><strong>Count:</strong> ${this.statisticsData.length}</p>
                <p><strong>Data:</strong> [${this.statisticsData.join(
                  ", "
                )}]</p>
                <p><strong>Min:</strong> ${Math.min(...this.statisticsData)}</p>
                <p><strong>Max:</strong> ${Math.max(...this.statisticsData)}</p>
            `;
    }
  }

  // Graphing Functions
  initializeGraphing() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    this.clearGraph();
  }

  plotFunction() {
    const functionInput = document.getElementById("functionInput").value;
    if (!functionInput.trim()) {
      window.showToast("Please enter a function", "warning");
      return;
    }

    try {
      this.drawFunction(functionInput);
      this.graphFunctions.push(functionInput);
      this.updateFunctionList();
      window.showToast("Function plotted!", "success");
    } catch (error) {
      window.showToast("Invalid function", "error");
    }
  }

  drawFunction(func) {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 40;

    // Draw axes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawAxes(ctx, canvas);

    // Draw function
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();

    let firstPoint = true;

    for (let x = -canvas.width / 2; x < canvas.width / 2; x += 1) {
      const realX = x / scale;
      let realY;

      try {
        const expression = func.replace(/x/g, `(${realX})`);
        realY = this.safeEval(expression);

        if (isFinite(realY)) {
          const canvasX = centerX + x;
          const canvasY = centerY - realY * scale;

          if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
      } catch (error) {
        // Skip invalid points
      }
    }

    ctx.stroke();
  }

  drawAxes(ctx, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;

    // Draw grid
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();
  }

  clearGraph() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawAxes(ctx, canvas);

    this.graphFunctions = [];
    this.updateFunctionList();
    window.showToast("Graph cleared", "success");
  }

  updateFunctionList() {
    const functionList = document.getElementById("graphFunctions");
    functionList.innerHTML = "";

    this.graphFunctions.forEach((func, index) => {
      const item = document.createElement("div");
      item.className = "function-item";
      item.innerHTML = `
                <span>f${index + 1}(x) = ${func}</span>
                <button onclick="calculator.removeFunction(${index})">Remove</button>
            `;
      functionList.appendChild(item);
    });
  }

  removeFunction(index) {
    this.graphFunctions.splice(index, 1);
    this.clearGraph();
    this.graphFunctions.forEach((func) => this.drawFunction(func));
    this.updateFunctionList();
  }

  // Keyboard Support
  initializeKeyboard() {
    document.addEventListener("keydown", (event) => {
      if (document.querySelector(".view.active").id !== "calculatorView")
        return;

      const key = event.key;

      if (key >= "0" && key <= "9") {
        this.addNumber(key);
      } else if (key === ".") {
        this.addNumber(".");
      } else if (key === "+") {
        this.addOperator("+");
      } else if (key === "-") {
        this.addOperator("-");
      } else if (key === "*") {
        this.addOperator("*");
      } else if (key === "/") {
        event.preventDefault();
        this.addOperator("/");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        this.calculate();
      } else if (key === "Escape") {
        this.clearAll();
      } else if (key === "Backspace") {
        this.backspace();
      } else if (key === "(") {
        this.addOperator("(");
      } else if (key === ")") {
        this.addOperator(")");
      } else if (key === "%") {
        this.addOperator("%");
      }
    });
  }

  // Save and Share Functions
  async saveCalculation() {
    if (!this.currentExpression || !this.currentResult) {
      window.showToast("No calculation to save", "warning");
      return;
    }

    if (!window.auth.isLoggedIn()) {
      window.showToast("Please login to save calculations", "warning");
      return;
    }

    try {
      await window.api.saveCalculation({
        expression: this.currentExpression,
        result: this.currentResult,
        type: this.currentMode,
        steps: this.generateSteps(this.currentExpression),
      });

      window.showToast("Calculation saved!", "success");
    } catch (error) {
      window.showToast("Failed to save calculation", "error");
    }
  }

  shareCalculation() {
    if (!this.currentExpression || !this.currentResult) {
      window.showToast("No calculation to share", "warning");
      return;
    }

    const shareData = {
      title: "ProCalc Calculation",
      text: `${this.currentExpression} = ${this.currentResult}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(shareData.text)
        .then(() => {
          window.showToast("Calculation copied to clipboard!", "success");
        })
        .catch(() => {
          window.showToast("Failed to copy calculation", "error");
        });
    }
  }
}

// Global calculator functions for HTML onclick handlers
function addNumber(num) {
  calculator.addNumber(num);
}
function addOperator(op) {
  calculator.addOperator(op);
}
function addFunction(func) {
  calculator.addFunction(func);
}
function addConstant(value) {
  calculator.addConstant(value);
}
function clearAll() {
  calculator.clearAll();
}
function backspace() {
  calculator.backspace();
}
function toggleSign() {
  calculator.toggleSign();
}
function calculate() {
  calculator.calculate();
}
function showSteps() {
  calculator.showSteps();
}
function closeSolutionPanel() {
  calculator.closeSolutionPanel();
}
function memoryStore() {
  calculator.memoryStore();
}
function memoryRecall() {
  calculator.memoryRecall();
}
function memoryClear() {
  calculator.memoryClear();
}
function parseData() {
  calculator.parseData();
}
function calculateMean() {
  calculator.calculateMean();
}
function calculateMedian() {
  calculator.calculateMedian();
}
function calculateMode() {
  calculator.calculateMode();
}
function calculateStdDev() {
  calculator.calculateStdDev();
}
function calculateVariance() {
  calculator.calculateVariance();
}
function calculateRange() {
  calculator.calculateRange();
}
function plotFunction() {
  calculator.plotFunction();
}
function clearGraph() {
  calculator.clearGraph();
}
function saveCalculation() {
  calculator.saveCalculation();
}
function shareCalculation() {
  calculator.shareCalculation();
}

// Create global calculator instance
const calculator = new Calculator();

// Declare global variables
window.auth = {
  isLoggedIn: () => {
    // Implement your authentication check here
    return true; // Placeholder
  },
};

window.api = {
  saveCalculation: async (data) => {
    // Implement your API call here
    console.log("Calculation saved:", data); // Placeholder
  },
};

window.showToast =
  window.showToast ||
  ((message, type) => {
    console.log(`Toast: ${message} (${type})`);
  });
