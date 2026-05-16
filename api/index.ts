import express from "express";
import path from "path";
import fs from "fs";
import dns from "dns";

const { resolveMx } = dns.promises;

const app = express();
app.use(express.json());

// For Vercel, we use /tmp for temp db if needed, but it's not persistent.
// Ideally, the user should move to Firebase.
const DB_PATH = "/tmp/db.json";
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ history: [], saved: [] }));
}

const getDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch (e) {
    return { history: [], saved: [] };
  }
};
const saveDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// API Routes
app.get("/api/db", (req, res) => {
  res.json(getDB());
});

app.post("/api/history", (req, res) => {
  const { query, result } = req.body;
  const db = getDB();
  db.history.unshift({ id: Date.now().toString(), query, result, timestamp: new Date().toISOString() });
  db.history = db.history.slice(0, 50);
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
  const { value } = req.body;
  try {
    if (value.includes("@")) {
      const domain = value.split("@")[1];
      try {
        const mx = await resolveMx(domain);
        if (mx && mx.length > 0) return res.json({ status: "verified", message: "MX Records found" });
      } catch (e) {}
    }
    res.json({ status: "failed", message: "Verification failed or unverified" });
  } catch (error) {
    res.json({ status: "failed" });
  }
});

export default app;
