import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "fs/promises";

// Database setup using JSON file
const DB_FILE = './database.json';

interface DatabaseSchema {
  settings: {
    id: number;
    whatsapp: string;
    email: string;
    whatsapp_message: string;
    email_subject: string;
    email_body: string;
  }[];
  testimonials: {
    id: number;
    text: string;
    initial: string;
    name: string;
    loc: string;
    date: string;
    rating: number;
  }[];
  life_paths: {
    id: number;
    name: string;
    desc: string;
  }[];
}

const defaultData: DatabaseSchema = {
  settings: [{
    id: 1,
    whatsapp: "917039516551",
    email: "7s.evolve@gmail.com",
    whatsapp_message: "Hello! I would like to book a session.",
    email_subject: "Book a Session",
    email_body: "Hi Team Seven,\n\nI want to book a session."
  }],
  life_paths: [
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
  ],
  testimonials: [
    { id: 1, text: '"My session was nothing short of revelatory. The accuracy with which the numbers reflected my life\'s patterns left me speechless. I finally understand why certain things kept repeating."', initial: 'P', name: 'Priya Malhotra', loc: 'Mumbai, India', date: 'October 2023', rating: 5 },
    { id: 2, text: '"I was at a complete crossroads in my career. The reading gave me the courage and clarity to make a decision I\'d been avoiding for two years. Genuinely life-changing."', initial: 'R', name: 'Rohan Kapoor', loc: 'Bangalore, India', date: 'November 2023', rating: 5 },
    { id: 3, text: '"The relationship compatibility reading transformed how my partner and I communicate. Understanding our numbers made everything feel less like conflict and more like growth."', initial: 'A', name: 'Anjali Singh', loc: 'Delhi, India', date: 'January 2024', rating: 5 },
    { id: 4, text: '"Simply incredible. The insights into my personal year cycle explained exactly what I was feeling."', initial: 'S', name: 'Sarah T.', loc: 'London, UK', date: 'March 2024', rating: 5 }
  ]
};

let db: DatabaseSchema;

async function setupDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    db = JSON.parse(data);
  } catch (err) {
    db = defaultData;
    await saveDb();
  }
}

async function saveDb() {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  await setupDb();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  // Use simple JWT secret
  const JWT_SECRET = "supersecret123";

  app.use(cors());
  app.use(express.json());

  // API ROUTES
  
  // Public routes
  app.get("/api/settings", (req, res) => {
    res.json(db.settings[0]);
  });

  app.get("/api/life_paths", (req, res) => {
    res.json(db.life_paths);
  });

  app.get("/api/testimonials", (req, res) => {
    res.json(db.testimonials);
  });

  // Admin login
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (email === "masteradmin@sevenastro.com" && password === "@Master_admin_2026") {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "10h" });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
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
    const { whatsapp, email, whatsapp_message, email_subject, email_body } = req.body;
    db.settings[0] = { id: 1, whatsapp, email, whatsapp_message, email_subject, email_body };
    await saveDb();
    res.json({ success: true });
  });

  app.put("/api/life_paths/:id", requireAuth, async (req, res) => {
    const { name, desc } = req.body;
    const id = parseInt(req.params.id);
    const index = db.life_paths.findIndex(lp => lp.id === id);
    if (index !== -1) {
      db.life_paths[index] = { id, name, desc };
      await saveDb();
    }
    res.json({ success: true });
  });

  app.post("/api/life_paths", requireAuth, async (req, res) => {
    const { id, name, desc } = req.body;
    const numId = parseInt(id);
    if (isNaN(numId)) {
        return res.status(400).json({ error: "Invalid ID." });
    }
    const exists = db.life_paths.find(lp => lp.id === numId);
    if (exists) {
      return res.status(400).json({ error: "Life path number already exists." });
    }
    db.life_paths.push({ id: numId, name, desc });
    db.life_paths.sort((a, b) => a.id - b.id);
    await saveDb();
    res.json({ success: true, lifePath: { id: numId, name, desc } });
  });

  app.delete("/api/life_paths/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    db.life_paths = db.life_paths.filter(lp => lp.id !== id);
    await saveDb();
    res.json({ success: true });
  });

  app.post("/api/testimonials", requireAuth, async (req, res) => {
    if (db.testimonials.length >= 7) {
      return res.status(400).json({ error: "Maximum 7 testimonials allowed." });
    }
    const { text, initial, name, loc, date, rating } = req.body;
    const nextId = db.testimonials.length > 0 ? Math.max(...db.testimonials.map(t => t.id)) + 1 : 1;
    
    db.testimonials.push({ id: nextId, text, initial, name, loc, date: date || 'October 2023', rating: rating ? parseInt(rating) : 5 });
    await saveDb();
    
    res.json({ id: nextId });
  });

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
    db.testimonials = db.testimonials.filter(t => t.id !== parseInt(req.params.id));
    await saveDb();
    res.json({ success: true });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
