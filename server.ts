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
import multer from "multer";

const JSON_DB_PATH = path.resolve(process.cwd(), 'database.json');

function readJsonDb(): any {
  try {
    const content = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("[JSON DB] Failed to read database.json:", err);
    return { settings: [], life_paths: [], testimonials: [], content_pages: [], faqs: [] };
  }
}

function writeJsonDb(data: any) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("[JSON DB] Failed to write database.json:", err);
  }
}

class JsonDbEngine {
  async query(sql: string, params: any[] = []): Promise<[any[], any]> {
    const cleanSql = sql.replace(/\s+/g, " ").trim();
    const data = readJsonDb();
    let resultRows: any[] = [];
    let affectedRowsCount = 0;
    let lastInsertIdVal = 0;

    if (cleanSql.includes("SELECT * FROM settings")) {
      resultRows = data.settings || [];
    } else if (cleanSql.includes("UPDATE settings SET")) {
      if (!data.settings) data.settings = [];
      if (data.settings.length === 0) {
        data.settings.push({ id: 1 });
      }
      data.settings[0].whatsapp = params[0];
      data.settings[0].email = params[1];
      data.settings[0].whatsapp_message = params[2];
      data.settings[0].email_subject = params[3];
      data.settings[0].email_body = params[4];
      data.settings[0].gemini_api_key = params[5];
      data.settings[0].profile_photo = params[6];
      data.settings[0].about_title = params[7];
      data.settings[0].about_para1 = params[8];
      data.settings[0].about_para2 = params[9];
      writeJsonDb(data);
      affectedRowsCount = 1;
    } else if (cleanSql.includes("SELECT * FROM life_paths ORDER")) {
      resultRows = (data.life_paths || []).sort((a: any, b: any) => a.id - b.id);
    } else if (cleanSql.includes("SELECT * FROM life_paths WHERE id=?") || cleanSql.includes("SELECT * FROM life_paths WHERE id = ?")) {
      const matchId = Number(params[0]);
      resultRows = (data.life_paths || []).filter((x: any) => x.id === matchId);
    } else if (cleanSql.includes("UPDATE life_paths SET")) {
      const id = Number(params[2]);
      const item = (data.life_paths || []).find((x: any) => x.id === id);
      if (item) {
        item.name = params[0];
        item.desc = params[1];
        writeJsonDb(data);
      }
      affectedRowsCount = 1;
    } else if (cleanSql.includes("INSERT INTO life_paths")) {
      if (!data.life_paths) data.life_paths = [];
      data.life_paths.push({ id: Number(params[0]), name: params[1], desc: params[2] });
      writeJsonDb(data);
      affectedRowsCount = 1;
    } else if (cleanSql.includes("DELETE FROM life_paths")) {
      const id = Number(params[0]);
      data.life_paths = (data.life_paths || []).filter((x: any) => x.id !== id);
      writeJsonDb(data);
      affectedRowsCount = 1;
    } else if (cleanSql.includes("SELECT * FROM testimonials")) {
      resultRows = (data.testimonials || []).sort((a: any, b: any) => a.id - b.id);
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM testimonials")) {
      resultRows = [{ cnt: (data.testimonials || []).length }];
    } else if (cleanSql.includes("SELECT MAX(id) as maxId FROM testimonials")) {
      const max = (data.testimonials || []).reduce((m: number, x: any) => Math.max(m, x.id || 0), 0);
      resultRows = [{ maxId: max }];
    } else if (cleanSql.includes("INSERT INTO testimonials")) {
      if (!data.testimonials) data.testimonials = [];
      data.testimonials.push({
        id: Number(params[0]),
        text: params[1],
        initial: params[2],
        name: params[3],
        loc: params[4],
        date: params[5],
        rating: Number(params[6]) || 5
      });
      writeJsonDb(data);
      affectedRowsCount = 1;
    } else if (cleanSql.includes("DELETE FROM testimonials")) {
      const id = Number(params[0]);
      data.testimonials = (data.testimonials || []).filter((x: any) => x.id !== id);
      writeJsonDb(data);
      affectedRowsCount = 1;
    } else if (cleanSql.includes("SELECT * FROM content_pages WHERE slug = ?") || cleanSql.includes("SELECT * FROM content_pages WHERE slug=?")) {
      const slug = String(params[0]);
      resultRows = (data.content_pages || []).filter((x: any) => x.slug === slug);
    } else if (cleanSql.includes("SELECT * FROM content_pages")) {
      resultRows = data.content_pages || [];
    } else if (cleanSql.includes("UPDATE content_pages SET")) {
      const slug = String(params[2]);
      const item = (data.content_pages || []).find((x: any) => x.slug === slug);
      if (item) {
        item.title = params[0];
        item.content = params[1];
        writeJsonDb(data);
      }
      affectedRowsCount = 1;
    } else if (cleanSql.includes("SELECT * FROM admins WHERE email = ? AND password = ?")) {
      const email = String(params[0]);
      const pass = String(params[1]);
      resultRows = (data.admins || []).filter((x: any) => x.email === email && x.password === pass);
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM admins")) {
      resultRows = [{ cnt: (data.admins || []).length }];
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM settings")) {
      resultRows = [{ cnt: (data.settings || []).length }];
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM life_paths")) {
      resultRows = [{ cnt: (data.life_paths || []).length }];
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM content_pages")) {
      resultRows = [{ cnt: (data.content_pages || []).length }];
    } else if (cleanSql.includes("SELECT * FROM faqs")) {
      resultRows = (data.faqs || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM faqs")) {
      resultRows = [{ cnt: (data.faqs || []).length }];
    } else if (cleanSql.includes("INSERT INTO faqs")) {
      if (!data.faqs) data.faqs = [];
      const newId = (data.faqs || []).reduce((m: number, x: any) => Math.max(m, x.id || 0), 0) + 1;
      data.faqs.push({
        id: newId,
        question: params[0],
        answer: params[1],
        display_order: 0
      });
      writeJsonDb(data);
      lastInsertIdVal = newId;
    } else if (cleanSql.includes("UPDATE faqs SET display_order")) {
      const id = Number(params[1]);
      const item = (data.faqs || []).find((x: any) => x.id === id);
      if (item) {
        item.display_order = Number(params[0]);
        writeJsonDb(data);
      }
      affectedRowsCount = 1;
    } else if (cleanSql.includes("UPDATE faqs SET")) {
      const id = Number(params[2]);
      const item = (data.faqs || []).find((x: any) => x.id === id);
      if (item) {
        item.question = params[0];
        item.answer = params[1];
        writeJsonDb(data);
      }
      affectedRowsCount = 1;
    } else if (cleanSql.includes("DELETE FROM faqs")) {
      const id = Number(params[0]);
      data.faqs = (data.faqs || []).filter((x: any) => x.id !== id);
      writeJsonDb(data);
      affectedRowsCount = 1;
    } else if (cleanSql.includes("SELECT * FROM services")) {
      resultRows = (data.services || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
    } else if (cleanSql.includes("SELECT COUNT(*) as cnt FROM services")) {
      resultRows = [{ cnt: (data.services || []).length }];
    } else if (cleanSql.includes("INSERT INTO services")) {
      if (!data.services) data.services = [];
      const newId = (data.services || []).reduce((m: number, x: any) => Math.max(m, x.id || 0), 0) + 1;
      data.services.push({
        id: newId,
        title: params[0],
        price: params[1],
        rawPrice: params[2],
        description: params[3],
        iconText: params[4],
        features: params[5],
        display_order: Number(params[6]) || 0
      });
      writeJsonDb(data);
      lastInsertIdVal = newId;
    } else if (cleanSql.includes("UPDATE services SET display_order")) {
      const id = Number(params[1]);
      const item = (data.services || []).find((x: any) => x.id === id);
      if (item) {
        item.display_order = Number(params[0]);
        writeJsonDb(data);
      }
      affectedRowsCount = 1;
    } else if (cleanSql.includes("UPDATE services SET")) {
      const id = Number(params[6]);
      const item = (data.services || []).find((x: any) => x.id === id);
      if (item) {
        item.title = params[0];
        item.price = params[1];
        item.rawPrice = params[2];
        item.description = params[3];
        item.iconText = params[4];
        item.features = params[5];
        writeJsonDb(data);
      }
      affectedRowsCount = 1;
    } else if (cleanSql.includes("DELETE FROM services")) {
      const id = Number(params[0]);
      data.services = (data.services || []).filter((x: any) => x.id !== id);
      writeJsonDb(data);
      affectedRowsCount = 1;
    }

    return [resultRows, { affectedRows: affectedRowsCount, insertId: lastInsertIdVal }];
  }
}

let pool: mysql.Pool | null = null;
let activeEngine: { query(sql: string, params?: any[]): Promise<[any[], any]> } | null = null;

async function getDbPool() {
  if (activeEngine) {
    return activeEngine;
  }

  const finalHost = process.env.DB_HOST?.includes('sevenastro') ? '193.203.184.86' : (process.env.DB_HOST || '193.203.184.86');
  const finalUser = process.env.DB_USER === 'masteradmin' ? 'u709894810_masteradmin' : (process.env.DB_USER || 'u709894810_masteradmin');
  const finalPassword = process.env.DB_PASSWORD || '@Masteradmin_2026';
  const finalName = process.env.DB_NAME === 'sevenastro' ? 'u709894810_sevenastro' : (process.env.DB_NAME || 'u709894810_sevenastro');

  try {
    pool = mysql.createPool({
      host: finalHost,
      user: finalUser,
      password: finalPassword,
      database: finalName,
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000 // Fails fast to avoid freezing the backend
    });

    // Test a quick query to ensure authorization and firewall permit connection
    await pool.query('SELECT 1');

    // Run table migrations with independent try-catch blocks
    try {
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
    } catch (e: any) { console.error("[MYSQL Setup] settings table:", e.message); }

    try {
      await pool.query(`ALTER TABLE settings ADD COLUMN gemini_api_key VARCHAR(500)`);
    } catch (err) {}

    try {
      await pool.query(`ALTER TABLE settings ADD COLUMN about_title VARCHAR(500)`);
    } catch (err) {}

    try {
      await pool.query(`ALTER TABLE settings ADD COLUMN about_para1 TEXT`);
    } catch (err) {}

    try {
      await pool.query(`ALTER TABLE settings ADD COLUMN about_para2 TEXT`);
    } catch (err) {}

    try {
      await pool.query(`ALTER TABLE settings ADD COLUMN profile_photo VARCHAR(500)`);
    } catch (err) {}

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS life_paths (
          id INT PRIMARY KEY,
          name VARCHAR(255),
          \`desc\` TEXT
        )
      `);
    } catch (e: any) { console.error("[MYSQL Setup] life_paths table:", e.message); }

    try {
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
    } catch (e: any) { console.error("[MYSQL Setup] testimonials table:", e.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255)
        )
      `);
    } catch (e: any) { console.error("[MYSQL Setup] admins table:", e.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS content_pages (
          slug VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255),
          content LONGTEXT
        )
      `);
    } catch (e: any) { console.error("[MYSQL Setup] content_pages table:", e.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question VARCHAR(500),
          answer LONGTEXT,
          display_order INT DEFAULT 0
        )
      `);
    } catch (e: any) { console.error("[MYSQL Setup] faqs table:", e.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255),
          price VARCHAR(255),
          rawPrice VARCHAR(255),
          description TEXT,
          iconText VARCHAR(50),
          features TEXT,
          display_order INT DEFAULT 0
        )
      `);
    } catch (e: any) { console.error("[MYSQL Setup] services table:", e.message); }

    // Seed data with individual try-catch blocks
    try {
      const [adminRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM admins');
      if (adminRows[0].cnt === 0) {
        await pool.query(`INSERT INTO admins (email, password) VALUES (?, ?)`, [
          "masteradmin@sevenastro.com", "@Masteradmin_2026"
        ]);
      }
    } catch (e: any) { console.error("[MYSQL Seed] admins:", e.message); }

    try {
      const [settingsRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM settings');
      if (settingsRows[0].cnt === 0) {
        await pool.query(`INSERT INTO settings (id, whatsapp, email, whatsapp_message, email_subject, email_body) VALUES (?, ?, ?, ?, ?, ?)`, [
          1, "917039516551", "7s.evolve@gmail.com", "Hello! I would like to book a session.", "Book a Session", "Hi Team Seven,\n\nI want to book a session."
        ]);
      }
    } catch (e: any) { console.error("[MYSQL Seed] settings:", e.message); }

    try {
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
    } catch (e: any) { console.error("[MYSQL Seed] life_paths:", e.message); }

    try {
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
    } catch (e: any) { console.error("[MYSQL Seed] testimonials:", e.message); }

    try {
      const [pagesRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM content_pages');
      if (pagesRows[0].cnt === 0) {
        await pool.query(`INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)`, ['terms', 'Terms & Conditions', 'Welcome to our Terms & Conditions.']);
        await pool.query(`INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)`, ['privacy', 'Privacy Policy', 'Welcome to our Privacy Policy.']);
        await pool.query(`INSERT INTO content_pages (slug, title, content) VALUES (?, ?, ?)`, ['faq', 'FAQ', '']);
      }
    } catch (e: any) { console.error("[MYSQL Seed] content_pages:", e.message); }

    try {
      const [faqsRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM faqs');
      if (faqsRows[0].cnt === 0) {
        const initialFaqs = [
          { q: "What is Astro-Numerology?", a: "<p>Astro-Numerology is the combined study of numbers, planetary influences, names, and life vibrations. It helps uncover your strengths, challenges, opportunities, relationship patterns, career potential, business growth prospects, and life purpose.</p>" },
          { q: "How can Numerology help me?", a: "<p>Numerology can provide insights into:</p><ul><li>Career and business decisions</li><li>Relationship compatibility</li><li>Marriage timing tendencies</li><li>Name correction and optimization</li><li>Financial growth opportunities</li><li>Personal strengths and weaknesses</li><li>Child naming and life path analysis</li><li>Spiritual growth and self-awareness</li></ul><p>Numerology is a guidance tool that helps you make more informed decisions.</p>" },
          { q: "Is Numerology scientifically proven?", a: "<p>Numerology is an ancient metaphysical science practiced for centuries across different cultures. While it is not recognized as a conventional scientific discipline, many individuals use it as a self-discovery and decision-support tool.</p>" },
          { q: "What information do I need to provide for a consultation?", a: "<p>Depending on the service selected, you may be required to provide:</p><ul><li>Full Name</li><li>Date of Birth</li><li>Time of Birth (if available)</li><li>Place of Birth</li><li>Specific questions or areas of concern</li></ul><p>For business consultations, incorporation dates, brand names, and business details may also be required.</p>" },
          { q: "What is Name Correction and how does it work?", a: "<p>Name Correction involves analyzing the vibrational value of your current name and identifying potential modifications that may better align with your birth numbers and life objectives.</p><p>The process does not change your identity—it aims to optimize the energetic and numerical resonance associated with your name.</p>" },
          { q: "Can changing my name guarantee success?", a: "<p>No. Success depends on multiple factors including actions, mindset, skills, effort, timing, opportunities, and circumstances.</p><p>Name alignment is intended to support your journey by creating a more harmonious energetic vibration, but no guarantees of specific outcomes are made.</p>" },
          { q: "What is included in the Birth Date & Name Analysis?", a: "<p>The analysis may cover:</p><ul><li>Personality traits</li><li>Strengths and challenges</li><li>Life path tendencies</li><li>Career suitability</li><li>Relationship dynamics</li><li>Health awareness indicators</li><li>Financial patterns</li><li>Spiritual inclinations</li><li>Name compatibility and optimization suggestions</li></ul>" },
          { q: "How can Business Numerology benefit my business?", a: "<p>Business Numerology evaluates:</p><ul><li>Business name vibration</li><li>Brand alignment</li><li>Incorporation date influence</li><li>Growth potential</li><li>Leadership compatibility</li><li>Prosperity and stability indicators</li></ul><p>It can help entrepreneurs make more aligned decisions regarding branding and business identity.</p>" },
          { q: "How accurate are the readings?", a: "<p>The quality of insights depends on the information provided and the interpretation of energetic patterns. Many clients find the guidance highly relevant and transformative, though results and experiences vary from person to person.</p>" },
          { q: "What is Reiki Healing?", a: "<p>Reiki is a holistic energy healing practice that promotes relaxation, stress reduction, emotional balance, and overall well-being through the channeling of universal life force energy.</p>" },
          { q: "Can Reiki heal diseases?", a: "<p>Reiki is not a substitute for medical treatment and does not diagnose, treat, cure, or prevent any disease. It is a complementary wellness practice intended to support relaxation and energetic balance.</p>" },
          { q: "Are online consultations as effective as in-person consultations?", a: "<p>Yes. Numerology, spiritual guidance, and Reiki distance healing sessions can be conducted remotely. Many clients from different cities and countries successfully receive guidance online.</p>" },
          { q: "How long does a consultation take?", a: "<p>Consultation duration varies depending on the service selected:</p><ul><li>Single Question Guidance: Usually 10–15 minutes</li><li>Career or Relationship Guidance: 30–60 minutes</li><li>Comprehensive Analysis Sessions: 60–120 minutes</li></ul><p>Specific timelines will be communicated during booking.</p>" },
          { q: "Do you offer emergency or urgent consultations?", a: "<p>Subject to availability, priority consultations may be accommodated. Additional charges may apply for urgent requests.</p>" },
          { q: "Can I ask multiple questions during a Single Question Guidance session?", a: "<p>The Single Question Guidance service is designed to address one specific question only. Additional questions may require a separate booking or a comprehensive consultation.</p>" },
          { q: "Is my information kept confidential?", a: "<p>Absolutely. All personal details, consultation discussions, and reports are treated with strict confidentiality and are never shared with third parties unless required by law.</p>" },
          { q: "Do you provide remedies?", a: "<p>Where appropriate, recommendations may include:</p><ul><li>Name alignment suggestions</li><li>Numerological corrections</li><li>Spiritual practices</li><li>Affirmations</li><li>Reiki guidance</li><li>Lifestyle recommendations</li><li>Color and number alignment guidance</li></ul><p>All remedies are optional and should be followed at your discretion.</p>" },
          { q: "What makes SEVEN – Evolve with Divine Secrets different?", a: "<p>SEVEN combines:</p><ul><li>✨ Astro-Numerology Insights</li><li>✨ Name Vibration Analysis</li><li>✨ Business Numerology Expertise</li><li>✨ Reiki Energy Healing</li><li>✨ Spiritual Guidance & Mentorship</li><li>✨ Practical Life Application</li></ul><p>Our approach focuses not only on predictions but on helping individuals and businesses align with their highest potential.</p>" },
          { q: "What if I am skeptical?", a: "<p>Healthy skepticism is welcome. Our objective is not to convince but to provide meaningful insights that you can evaluate and apply based on your own judgment and experience.</p>" },
          { q: "What is your refund policy?", a: "<p>Due to the personalized nature of our services, all consultations, reports, analyses, and energy healing sessions are non-refundable once booked or delivered. Please review our Terms & Conditions before making a purchase.</p>" }
        ];

        for (const faq of initialFaqs) {
          await pool.query(`INSERT INTO faqs (question, answer) VALUES (?, ?)`, [faq.q, faq.a]);
        }
      }
    } catch (e: any) { console.error("[MYSQL Seed] faqs:", e.message); }

    try {
      const [servicesRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM services');
      if (servicesRows[0].cnt === 0) {
        const initialServices = [
          {
            title: "Child Birth Date & Name Alignment Analysis",
            price: "₹51,000",
            rawPrice: "₹51k",
            description: "Discover the optimal name vibration and cosmic alignment for your child's birth energy.",
            iconText: "👶",
            features: JSON.stringify([
              "Astro-Numerological Compatibility",
              "Name Vibration & Alignment Solutions",
              "Fortunate Starting Letters",
              "Personalized Child Character Insights"
            ]),
            display_order: 0
          },
          {
            title: "Career Path & Success Guidance",
            price: "₹15,000",
            rawPrice: "₹15k",
            description: "Explore your professional potential, ideal sectors, and key timing for career breakthroughs or transitions.",
            iconText: "💼",
            features: JSON.stringify([
              "Career Aptitude Blueprint",
              "Upcoming Opportunities Analysis",
              "Obstacle Mitigation Strategy",
              "Optimal Transition Timelines"
            ]),
            display_order: 1
          },
          {
            title: "Relationship Compatibility Analysis",
            price: "₹51,000",
            rawPrice: "₹51k",
            description: "Decipher the numerical resonance between partners to nourish harmony and conscious relationship growth.",
            iconText: "💑",
            features: JSON.stringify([
              "Vibrational Synergy Mapping",
              "Core Conflict Point Assessment",
              "Communication Bridge Remedies",
              "Auspicious Timeline Tendencies"
            ]),
            display_order: 2
          },
          {
            title: "Birth Date, Name Analysis & Name Correction",
            price: "₹51,000",
            rawPrice: "₹51k",
            description: "A comprehensive analysis of your birth energy and full name correction for lifetime cosmic harmony.",
            iconText: "✨",
            features: JSON.stringify([
              "Lagna & Planetary Signature Review",
              "Full Name Vibration Correction",
              "Spelling Optimization Remedies",
              "Signature Design Formatting"
            ]),
            display_order: 3
          },
          {
            title: "Business Numerology & Prosperity Blueprint",
            price: "₹1,00,005",
            rawPrice: "₹1,00,005",
            description: "Optimize corporate/brand alignment, choose lucky launch dates, and blueprint your business success.",
            iconText: "🏢",
            features: JSON.stringify([
              "Brand Name Spelling Harmonizer",
              "Official Launch / Registration Timing",
              "Key Shareholder Compatibility",
              "Prosperity & Branding Colors Grid"
            ]),
            display_order: 4
          },
          {
            title: "Lucky Numbers, Alphabets & Colour Alignment",
            price: "₹37,000",
            rawPrice: "₹37k",
            description: "Elevate your daily frequency by aligning with your supportive numbers, letters, and visual energies.",
            iconText: "🎨",
            features: JSON.stringify([
              "Fortunate Personal Numbers Selection",
              "Vibrational Color Wardrobe Selection",
              "Daily Routine Harmonizing",
              "Alphabetic Signature Alignment"
            ]),
            display_order: 5
          },
          {
            title: "Focused Insight Session",
            price: "₹1,005",
            rawPrice: "₹1005",
            description: "Directly target a single query or burning question for swift, clear metaphysical clarity (Single Question).",
            iconText: "🎯",
            features: JSON.stringify([
              "Single Question Guidance",
              "Precision Astral Calculations",
              "Actionable Advice Blueprint",
              "Swift Metaphysical Answers"
            ]),
            display_order: 6
          },
          {
            title: "Gemstone, Crystal & Rudraksha Recommendation",
            price: "₹5,001",
            rawPrice: "₹5001",
            description: "Receive personalized astronomical cosmic prescription of specific crystals, powerful Rudrakshas, and precious gemstones to amplify protective fields and lucky energy bands.",
            iconText: "💎",
            features: JSON.stringify([
              "Aura Strengthening Analysis",
              "Planetary Energy Balancers",
              "Gemstone Grade & Weight Advice",
              "Rudraksha Mukhi Recommendations"
            ]),
            display_order: 7
          }
        ];
        for (const s of initialServices) {
          await pool.query(
            `INSERT INTO services (title, price, rawPrice, description, iconText, features, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [s.title, s.price, s.rawPrice, s.description, s.iconText, s.features, s.display_order]
          );
        }
      }
    } catch (e: any) { console.error("[MYSQL Seed] services:", e.message); }

    console.log("[DB ENGINE] Active: MySQL");
    activeEngine = {
      async query(sql: string, params?: any[]) {
        return pool!.query(sql, params);
      }
    };
  } catch (err: any) {
    console.warn(`[DB ENGINE] MySQL connection blocked or failed: ${err.message}. Enabling high-fidelity JSON Engine fallback.`);
    activeEngine = new JsonDbEngine();
  }

  return activeEngine;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  // Use simple JWT secret
  const JWT_SECRET = "supersecret123";

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

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

  app.get("/api/services", async (req, res) => {
    try {
      const db = await getDbPool();
      const [rows]: any = await db.query('SELECT * FROM services ORDER BY display_order ASC, id ASC');
      res.json(rows);
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
      const { 
        whatsapp, 
        email, 
        whatsapp_message, 
        email_subject, 
        email_body, 
        gemini_api_key,
        profile_photo,
        about_title,
        about_para1,
        about_para2
      } = req.body;
      
      await db.query(`
        UPDATE settings SET 
          whatsapp=?, 
          email=?, 
          whatsapp_message=?, 
          email_subject=?, 
          email_body=?, 
          gemini_api_key=?,
          profile_photo=?,
          about_title=?,
          about_para1=?,
          about_para2=?
        WHERE id=1
      `, [
        whatsapp, 
        email, 
        whatsapp_message, 
        email_subject, 
        email_body, 
        gemini_api_key || null,
        profile_photo || null,
        about_title || null,
        about_para1 || null,
        about_para2 || null
      ]);
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/upload", requireAuth, upload.single("photo"), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, url: fileUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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

  app.post("/api/faqs/reorder", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { orderIds } = req.body;
      for (let i = 0; i < orderIds.length; i++) {
        await db.query('UPDATE faqs SET display_order=? WHERE id=?', [i, orderIds[i]]);
      }
      res.json({ success: true });
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

  // Services admin endpoints
  app.post("/api/services", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { title, price, rawPrice, description, iconText, features } = req.body;
      const strFeatures = typeof features === 'string' ? features : JSON.stringify(features || []);
      const [rows]: any = await db.query('SELECT COUNT(*) as cnt FROM services');
      const order = rows[0].cnt;
      const [result]: any = await db.query(
        'INSERT INTO services (title, price, rawPrice, description, iconText, features, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, price, rawPrice, description, iconText, strFeatures, order]
      );
      res.json({ id: result.insertId });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/services/reorder", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { orderIds } = req.body;
      for (let i = 0; i < orderIds.length; i++) {
        await db.query('UPDATE services SET display_order=? WHERE id=?', [i, orderIds[i]]);
      }
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.put("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      const { title, price, rawPrice, description, iconText, features } = req.body;
      const strFeatures = typeof features === 'string' ? features : JSON.stringify(features || []);
      await db.query(
        'UPDATE services SET title=?, price=?, rawPrice=?, description=?, iconText=?, features=? WHERE id=?',
        [title, price, rawPrice, description, iconText, strFeatures, req.params.id]
      );
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.delete("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const db = await getDbPool();
      await db.query('DELETE FROM services WHERE id=?', [req.params.id]);
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
