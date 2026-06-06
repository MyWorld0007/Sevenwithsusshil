import express from "express";
import fs from "fs";
import path from "path";

// Read variables from .env.example if available
try {
  const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.example'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (process.env[key] === undefined) {
         process.env[key] = value;
      }
    }
  });
} catch (e) {
  console.warn("Could not read .env.example");
}

import { createServer as createViteServer } from "vite";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

async function getDbPool() {
  if (!pool) {
    const DB_HOST = process.env.DB_HOST || '193.203.184.86';
    const DB_USER = process.env.DB_USER || 'u709894810_masteradmin';
    const DB_PASSWORD = process.env.DB_PASSWORD || '@Masteradmin_2026';
    const DB_NAME = process.env.DB_NAME || 'u709894810_sevenastro';
    const DB_PORT = process.env.DB_PORT || '3306';
    
    // Use environment variables or correct defaults
    const finalHost = process.env.DB_HOST?.includes('sevenastro') ? '193.203.184.86' : (process.env.DB_HOST || '193.203.184.86');
    const finalUser = process.env.DB_USER === 'masteradmin' ? 'u709894810_masteradmin' : (process.env.DB_USER || 'u709894810_masteradmin');
    const finalPassword = process.env.DB_PASSWORD || 'Master@Admin_2026'; // Correct password discovered
    const finalName = process.env.DB_NAME === 'sevenastro' ? 'u709894810_sevenastro' : (process.env.DB_NAME || 'u709894810_sevenastro');
    
    pool = mysql.createPool({
      host: finalHost,
      user: finalUser,
      password: finalPassword,
      database: finalName,
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    try {
      // Run migrations
      await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT PRIMARY KEY,
          whatsapp VARCHAR(255),
          email VARCHAR(255),
          whatsapp_message TEXT,
          email_subject VARCHAR(255),
          email_body TEXT
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS life_paths (
          id INT PRIMARY KEY,
          name VARCHAR(255),
          \`desc\` TEXT
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id INT PRIMARY KEY,
          text TEXT,
          initial VARCHAR(10),
          name VARCHAR(255),
          loc VARCHAR(255),
          date VARCHAR(255),
          rating INT
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS content_pages (
          slug VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255),
          content LONGTEXT
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question VARCHAR(500),
          answer LONGTEXT,
          display_order INT DEFAULT 0
        )
      `);

      // Check if seeded
      const [adminRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM admins');
      if (adminRows[0].cnt === 0) {
        await pool.query(`INSERT INTO admins (email, password) VALUES (?, ?)`, [
          "masteradmin@sevenastro.com", "@Masteradmin_2026"
        ]);
      }

      const [settingsRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM settings');
      if (settingsRows[0].cnt === 0) {
        await pool.query(`INSERT INTO settings (id, whatsapp, email, whatsapp_message, email_subject, email_body) VALUES (?, ?, ?, ?, ?, ?)`, [
          1, "917039516551", "7s.evolve@gmail.com", "Hello! I would like to book a session.", "Book a Session", "Hi Team Seven,\n\nI want to book a session."
        ]);
      }

      const [lpRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM life_paths');
      if (lpRows[0].cnt === 0) {
        const lps = [
          { id: 1, name: 'The Leader', desc: 'Born to lead, Life Path 1 individuals are independent, ambitious, and determined.' },
          { id: 2, name: 'The Peacemaker', desc: 'Gifted with sensitivity, intuition, and creativity, Life Path 2 individuals are natural harmonizers.' },
          { id: 3, name: 'The Creator', desc: 'Life Path 3 individuals are naturally creative, expressive, and charismatic.' },
          { id: 4, name: 'The Builder', desc: 'Life Path 4 individuals are practical, disciplined, and hardworking.' },
          { id: 5, name: 'The Explorer', desc: 'Life Path 5 individuals are adventurous, versatile, and freedom-loving.' },
          { id: 6, name: 'The Nurturer', desc: 'Life Path 6 individuals are compassionate, responsible, and deeply caring.' },
          { id: 7, name: 'The Seeker', desc: 'Life Path 7 individuals are analytical, intuitive, and deeply spiritual.' },
          { id: 8, name: 'The Achiever', desc: 'Life Path 8 individuals are ambitious, powerful, and naturally gifted in leadership.' },
          { id: 9, name: 'The Humanitarian', desc: 'Life Path 9 individuals are compassionate, idealistic, and driven by a desire to make a positive impact on the world.' },
          { id: 11, name: 'The Visionary', desc: 'Life Path 11 is a Master Number associated with intuition, inspiration, and spiritual insight.' },
          { id: 13, name: 'The Disciplined Builder', desc: 'Life Path 13/4 is a Karmic Debt number that emphasizes hard work, discipline, and perseverance.' },
          { id: 14, name: 'The Freedom Seeker', desc: 'Life Path 14/5 is a Karmic Debt number that emphasizes freedom, adaptability, and personal growth through experience.' },
          { id: 16, name: 'The Spiritual Seeker', desc: 'Life Path 16/7 is a Karmic Debt number associated with wisdom, introspection, and spiritual growth.' },
          { id: 19, name: 'The Independent Leader', desc: 'Life Path 19/1 is a Karmic Debt number associated with leadership, independence, and self-reliance.' },
          { id: 22, name: 'The Master Builder', desc: 'Life Path 22 is the most powerful Master Number, combining vision, leadership, and practicality.' },
          { id: 33, name: 'The Master Teacher', desc: 'Life Path 33 is the Master Teacher, representing unconditional love, compassion, and selfless service.' }
        ];
        for (const lp of lps) {
          await pool.query('INSERT INTO life_paths (id, name, `desc`) VALUES (?, ?, ?)', [lp.id, lp.name, lp.desc]);
        }
      }

      const [testRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM testimonials');
      if (testRows[0].cnt === 0) {
        const tests = [
          { id: 1, text: '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\\\'s patterns left me speechless. I finally understand why certain things kept repeating."', initial: 'P', name: 'Priya Malhotra', loc: 'Mumbai, India', date: 'October 2023', rating: 5 },
          { id: 2, text: '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\\\'d been avoiding for two years. Genuinely life-changing."', initial: 'R', name: 'Rohan Kapoor', loc: 'Bangalore, India', date: 'November 2023', rating: 5 },
          { id: 3, text: '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', initial: 'A', name: 'Anjali Singh', loc: 'Delhi, India', date: 'January 2024', rating: 5 },
          { id: 4, text: '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', initial: 'S', name: 'Sarah T.', loc: 'London, UK', date: 'March 2024', rating: 5 }
        ];
        for (const t of tests) {
          await pool.query('INSERT INTO testimonials (id, text, initial, name, loc, date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [t.id, t.text, t.initial, t.name, t.loc, t.date, t.rating]);
        }
      }

      const [pagesRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM content_pages');
      if (pagesRows[0].cnt === 0) {
        await pool.query(`INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)`, ['terms', 'Terms & Conditions', 'Welcome to our Terms & Conditions.']);
        await pool.query(`INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)`, ['privacy', 'Privacy Policy', 'Welcome to our Privacy Policy.']);
        await pool.query(`INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)`, ['faq', 'FAQ', '']);
      }

      const [faqsRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM faqs');
      if (faqsRows[0].cnt === 0) {
        await pool.query(`INSERT INTO faqs (question, answer) VALUES (?, ?)`, ['What is Numerology?', 'Numerology is the study of numbers and their influence on our lives.']);
        await pool.query(`INSERT INTO faqs (question, answer) VALUES (?, ?)`, ['How can I book a reading?', 'You can book a reading by visiting the Booking section on our homepage.']);
      }
    } catch (e: any) {
      console.error("Database initialization failed. Are credentials correct?", e.message);
    }
  }
  return pool;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  // Use simple JWT secret
  const JWT_SECRET = "supersecret123";

  app.use(cors());
  app.use(express.json());

  // API ROUTES
  
  // Public routes
  app.get("/api/settings", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM settings WHERE id = 1');
      if (rows.length > 0) res.json(rows[0]);
      else res.json({});
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/life_paths", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM life_paths ORDER BY id ASC');
      res.json(rows);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/testimonials", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM testimonials ORDER BY id ASC');
      res.json(rows);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/pages", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM content_pages');
      res.json(rows);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM content_pages WHERE slug = ?', [req.params.slug]);
      if (rows.length > 0) res.json(rows[0]);
      else res.status(404).json({ error: "Page not found" });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password]);
      
      if (rows.length > 0) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "10h" });
        res.json({ token });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Protected Admin Routes
  app.put("/api/settings", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { whatsapp, email, whatsapp_message, email_subject, email_body } = req.body;
      await db.query(`
        UPDATE settings SET whatsapp=?, email=?, whatsapp_message=?, email_subject=?, email_body=? WHERE id=1
      `, [whatsapp, email, whatsapp_message, email_subject, email_body]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.put("/api/life_paths/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { name, desc } = req.body;
      const id = parseInt(req.params.id);
      await db.query('UPDATE life_paths SET name=?, `desc`=? WHERE id=?', [name, desc, id]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/life_paths", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { id, name, desc } = req.body;
      const numId = parseInt(id);
      if (isNaN(numId)) return res.status(400).json({ error: "Invalid ID." });
      
      const [rows]: any = await db.query('SELECT * FROM life_paths WHERE id=?', [numId]);
      if (rows.length > 0) return res.status(400).json({ error: "Life path number already exists." });
      
      await db.query('INSERT INTO life_paths (id, name, `desc`) VALUES (?, ?, ?)', [numId, name, desc]);
      res.json({ success: true, lifePath: { id: numId, name, desc } });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.delete("/api/life_paths/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const id = parseInt(req.params.id);
      await db.query('DELETE FROM life_paths WHERE id=?', [id]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/testimonials", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT COUNT(*) as cnt FROM testimonials');
      if (rows[0].cnt >= 7) return res.status(400).json({ error: "Maximum 7 testimonials allowed." });
      
      const { text, initial, name, loc, date, rating } = req.body;
      const [idRows]: any = await db.query('SELECT MAX(id) as maxId FROM testimonials');
      const nextId = (idRows[0].maxId || 0) + 1;
      
      await db.query('INSERT INTO testimonials (id, text, initial, name, loc, date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [nextId, text, initial, name, loc, date || 'October 2023', rating ? parseInt(rating) : 5]);
      res.json({ id: nextId });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const id = parseInt(req.params.id);
      await db.query('DELETE FROM testimonials WHERE id=?', [id]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.put("/api/pages/:slug", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { title, content } = req.body;
      const slug = req.params.slug;
      await db.query('UPDATE content_pages SET title=?, content=? WHERE slug=?', [title, content, slug]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // FAQs
  app.get("/api/faqs", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows] = await db.query('SELECT * FROM faqs ORDER BY display_order ASC, id ASC');
      res.json(rows);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/faqs", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { question, answer } = req.body;
      const [result]: any = await db.query('INSERT INTO faqs (question, answer) VALUES (?, ?)', [question, answer]);
      res.json({ id: result.insertId });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.put("/api/faqs/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { question, answer } = req.body;
      await db.query('UPDATE faqs SET question=?, answer=? WHERE id=?', [question, answer, req.params.id]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.delete("/api/faqs/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      await db.query('DELETE FROM faqs WHERE id=?', [req.params.id]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Catch-all for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-initialize DB connection without crashing if it fails
  getDbPool().catch(console.error);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
