const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const db = require("./database/db");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Auth Routes
app.post(
  "/api/auth/register",
  [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userId = await db.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: { id: userId, username, email },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.post(
  "/api/auth/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get user
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback_secret",
        {
          expiresIn: "7d",
        }
      );

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Calculator Routes
app.post(
  "/api/calculations",
  authMiddleware,
  [
    body("expression").isLength({ min: 1 }).trim(),
    body("result").exists(),
    body("type")
      .optional()
      .isIn(["basic", "scientific", "statistics", "graphing"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { expression, result, type = "basic", steps } = req.body;
      const userId = req.user.userId;

      const calculationId = await db.saveCalculation({
        userId,
        expression,
        result,
        type,
        steps: JSON.stringify(steps || []),
      });

      res.status(201).json({
        message: "Calculation saved",
        id: calculationId,
      });
    } catch (error) {
      console.error("Save calculation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get("/api/calculations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 50, type } = req.query;

    const calculations = await db.getUserCalculations(userId, {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      type,
    });

    res.json(calculations);
  } catch (error) {
    console.error("Get calculations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/calculations/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await db.deleteCalculation(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Calculation not found" });
    }

    res.json({ message: "Calculation deleted" });
  } catch (error) {
    console.error("Delete calculation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Notes Routes
app.post(
  "/api/notes",
  authMiddleware,
  [
    body("title").isLength({ min: 1 }).trim().escape(),
    body("content").isLength({ min: 1 }).trim(),
    body("category")
      .optional()
      .isIn(["math", "physics", "chemistry", "general"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, category = "general" } = req.body;
      const userId = req.user.userId;

      const noteId = await db.saveNote({
        userId,
        title,
        content,
        category,
      });

      res.status(201).json({
        message: "Note saved",
        id: noteId,
      });
    } catch (error) {
      console.error("Save note error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get("/api/notes", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category } = req.query;

    const notes = await db.getUserNotes(userId, category);
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put(
  "/api/notes/:id",
  authMiddleware,
  [
    body("title").isLength({ min: 1 }).trim().escape(),
    body("content").isLength({ min: 1 }).trim(),
    body("category")
      .optional()
      .isIn(["math", "physics", "chemistry", "general"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content, category } = req.body;
      const userId = req.user.userId;

      const updated = await db.updateNote(id, userId, {
        title,
        content,
        category,
      });
      if (!updated) {
        return res.status(404).json({ message: "Note not found" });
      }

      res.json({ message: "Note updated" });
    } catch (error) {
      console.error("Update note error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.delete("/api/notes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await db.deleteNote(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Statistics Routes
app.get("/api/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await db.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Initialize database and start server
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });

module.exports = app;
