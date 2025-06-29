const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, "calculator.db");
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err);
          reject(err);
        } else {
          console.log("📁 Connected to SQLite database");
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
      `CREATE TABLE IF NOT EXISTS calculations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                expression TEXT NOT NULL,
                result TEXT NOT NULL,
                type TEXT DEFAULT 'basic',
                steps TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,
      `CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,
      `CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type)`,
      `CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category)`,
    ];

    for (const table of tables) {
      await this.run(table);
    }
    console.log("✅ Database tables created/verified");
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // User methods
  async createUser(userData) {
    const { username, email, password } = userData;
    const result = await this.run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
    return result.id;
  }

  async getUserByEmail(email) {
    return await this.get("SELECT * FROM users WHERE email = ?", [email]);
  }

  async getUserById(id) {
    return await this.get(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [id]
    );
  }

  // Calculation methods
  async saveCalculation(calculationData) {
    const { userId, expression, result, type, steps } = calculationData;
    const calcResult = await this.run(
      "INSERT INTO calculations (user_id, expression, result, type, steps) VALUES (?, ?, ?, ?, ?)",
      [userId, expression, result, type, steps]
    );
    return calcResult.id;
  }

  async getUserCalculations(userId, options = {}) {
    const { page = 1, limit = 50, type } = options;
    const offset = (page - 1) * limit;

    let sql = "SELECT * FROM calculations WHERE user_id = ?";
    const params = [userId];

    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const calculations = await this.all(sql, params);

    // Parse steps JSON
    return calculations.map((calc) => ({
      ...calc,
      steps: calc.steps ? JSON.parse(calc.steps) : [],
    }));
  }

  async deleteCalculation(id, userId) {
    const result = await this.run(
      "DELETE FROM calculations WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.changes > 0;
  }

  // Note methods
  async saveNote(noteData) {
    const { userId, title, content, category } = noteData;
    const result = await this.run(
      "INSERT INTO notes (user_id, title, content, category) VALUES (?, ?, ?, ?)",
      [userId, title, content, category]
    );
    return result.id;
  }

  async getUserNotes(userId, category = null) {
    let sql = "SELECT * FROM notes WHERE user_id = ?";
    const params = [userId];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    sql += " ORDER BY updated_at DESC";

    return await this.all(sql, params);
  }

  async updateNote(id, userId, noteData) {
    const { title, content, category } = noteData;
    const result = await this.run(
      "UPDATE notes SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [title, content, category, id, userId]
    );
    return result.changes > 0;
  }

  async deleteNote(id, userId) {
    const result = await this.run(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.changes > 0;
  }

  // Statistics methods
  async getUserStats(userId) {
    const [totalCalculations, totalNotes, calculationsByType, recentActivity] =
      await Promise.all([
        this.get(
          "SELECT COUNT(*) as count FROM calculations WHERE user_id = ?",
          [userId]
        ),
        this.get("SELECT COUNT(*) as count FROM notes WHERE user_id = ?", [
          userId,
        ]),
        this.all(
          `
                SELECT type, COUNT(*) as count 
                FROM calculations 
                WHERE user_id = ? 
                GROUP BY type
            `,
          [userId]
        ),
        this.all(
          `
                SELECT 'calculation' as type, expression as title, created_at 
                FROM calculations 
                WHERE user_id = ? 
                UNION ALL 
                SELECT 'note' as type, title, created_at 
                FROM notes 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            `,
          [userId, userId]
        ),
      ]);

    return {
      totalCalculations: totalCalculations.count,
      totalNotes: totalNotes.count,
      calculationsByType,
      recentActivity,
    };
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
        } else {
          console.log("Database connection closed");
        }
        resolve();
      });
    });
  }
}

module.exports = new Database();
