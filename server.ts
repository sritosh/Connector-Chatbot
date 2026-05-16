import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dns from "dns";

const { resolveMx } = dns.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple JSON DB for history and saved contacts
  const DB_PATH = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ history: [], saved: [] }));
  }

  const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const saveDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

  // API Routes
  app.get("/api/db", (req, res) => {
    try {
      res.json(getDB());
    } catch (e) {
      res.json({ history: [], saved: [] });
    }
  });

  app.post("/api/history", (req, res) => {
    const { query, result } = req.body;
    const db = getDB();
    db.history.unshift({ id: Date.now().toString(), query, result, timestamp: new Date().toISOString() });
    db.history = db.history.slice(0, 50); // Keep last 50
    saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/save", (req, res) => {
    const { contact } = req.body;
    const db = getDB();
    if (!db.saved.find((c: any) => c.value === contact.value)) {
      db.saved.push({ ...contact, savedAt: new Date().toISOString() });
      saveDB(db);
    }
    res.json({ success: true });
  });

  app.delete("/api/save/:id", (req, res) => {
    const { id } = req.params;
    const db = getDB();
    db.saved = db.saved.filter((c: any) => c.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/verify", async (req, res) => {
    const { type, value } = req.body;
    
    try {
      if (value.includes("@")) {
        // Email Verification
        const domain = value.split("@")[1];
        try {
          const mx = await resolveMx(domain);
          if (mx && mx.length > 0) {
            return res.json({ status: "verified", message: "MX Records found" });
          }
        } catch (e) {
          return res.json({ status: "failed", message: "No MX Records" });
        }
      } else if (/^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s()-]/g, ""))) {
        // Phone Verification (Simple regex check + delay)
        await new Promise(r => setTimeout(r, 1000));
        return res.json({ status: "verified", message: "Valid Format" });
      } else if (value.startsWith("http")) {
        // URL Verification
        return res.json({ status: "verified", message: "Valid Link" });
      }
      
      res.json({ status: "unverified", message: "Unknown format" });
    } catch (error) {
      res.json({ status: "failed", message: "Verification failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
