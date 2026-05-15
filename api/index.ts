import express from "express";
import path from "path";
import fs from "fs";
import dns from "dns";
import { GoogleGenAI, Type } from "@google/genai";

const { resolveMx } = dns.promises;

// Lazy init Gemini
let genAI: GoogleGenAI | null = null;
const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in server environment");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

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

app.post("/api/discover", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) return res.status(400).json({ error: "Company name required" });

  try {
    const ai = getAI();
    const prompt = `SEARCH FOR PUBLIC BUSINESS CONTACTS & LINKEDIN LEADS: "${companyName}".
    Find ONLY public professional data: 
    1. Standard: Partnerships, Sponsorships, Media/PR, Careers, Support, General.
    2. Social & Digital: Official socials (Twitter, Instagram).
    3. LinkedIn Leads: Find LinkedIn profiles of specific key decision makers (e.g., Marketing Head, Marketing Manager, Founder, CEO).
    
    Return JSON format. Use High/Medium/Low confidence based on source officiality.
    For LinkedIn leads, use the type 'LinkedIn' or 'Executive'.
    Be fast and accurate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            contacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { 
                    type: Type.STRING,
                    enum: ['Partnership', 'Sponsorship', 'Careers', 'Media', 'Support', 'General', 'Social', 'LinkedIn', 'Executive']
                  },
                  value: { type: Type.STRING },
                  source: { type: Type.STRING },
                  confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                },
                required: ['id', 'type', 'value', 'source', 'confidence']
              }
            }
          },
          required: ['companyName', 'contacts']
        }
      }
    });

    const text = response.text;
    res.json(JSON.parse(text || "{}"));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/outreach", async (req, res) => {
  const { contactValue, companyName, purpose } = req.body;
  try {
    const ai = getAI();
    const prompt = `Write a professional, concise, and modern outreach message for ${companyName}.
    Target: ${contactValue}
    Purpose: ${purpose}
    Tone: Professional, ambitious, and strategic.
    Avoid corporate fluff. Be direct. Max 150 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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
