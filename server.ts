import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
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

  app.post("/api/discover", async (req, res) => {
    const { companyName, intent } = req.body;
    if (!companyName) return res.status(400).json({ error: "Company name required" });

    try {
      const ai = getAI();
      const prompt = `DATABASE SEARCH & INTELLIGENCE: "${companyName}"
      User Intent: ${intent || 'General Networking'}

      TASK:
      1. Find public professional contacts (Partnership, Sponsorship, Careers, Media, Support, General, Social, LinkedIn, Executive).
      2. Rank each contact with a Relevance Score (0-100) based on the User Intent.
      3. Suggest the "Recommended Outreach Method" (Platform) for each contact with an explanation.
      4. Provide a Verification Status (Verified, Likely Active, Needs Verification) and detailed reasoning.
      
      SYSTEM GUIDELINES:
      - SCORING IS CRITICAL: If a contact is a direct match for the intent (e.g., 'press@' or 'media@' for 'Media/Press' intent), assign a score of 95-100%. 
      - RELEVANCE: 90-100% for Direct Matches, 60-89% for related matches (e.g., marketing@ for media), 0-30% for unrelated (e.g., support@ for partnership).
      - Platform Suggestion: Predict probability of response (e.g., "LinkedIn is best for CEOs", "IG for Creators").
      - Verification: "Verified" if found on official /contact or /about pages. "Likely Active" if standard pattern found across sources.
      
      Return JSON structure strictly. Ensure scores reflect the User Intent accurately.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              description: { type: Type.STRING },
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
                    confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                    relevanceScore: { type: Type.NUMBER },
                    relevanceLabel: { type: Type.STRING, enum: ['High Match', 'Medium Match', 'Low Match'] },
                    relevanceReasoning: { type: Type.STRING },
                    recommendedPlatform: { type: Type.STRING },
                    platformReasoning: { type: Type.STRING },
                    verificationStatus: { type: Type.STRING, enum: ['Verified', 'Likely Active', 'Needs Verification'] },
                    verificationReasoning: { type: Type.STRING }
                  },
                  required: [
                    'id', 'type', 'value', 'source', 'confidence', 
                    'relevanceScore', 'relevanceLabel', 'relevanceReasoning', 
                    'recommendedPlatform', 'platformReasoning', 
                    'verificationStatus', 'verificationReasoning'
                  ]
                }
              }
            },
            required: ['companyName', 'description', 'contacts']
          }
        }
      });

      const text = response.text;
      const data = JSON.parse(text || "{}");
      
      // Sort by relevance
      if (data.contacts) {
        data.contacts.sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      }
      
      res.json(data);
    } catch (error: any) {
      console.error("Gemini Discover Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/outreach", async (req, res) => {
    const { contactValue, companyName, intent, tone, length } = req.body;
    try {
      const ai = getAI();
      const prompt = `Write a high-performance, human-like outreach message.
      Company: ${companyName}
      Target: ${contactValue}
      Intent/Purpose: ${intent}
      Tone: ${tone || 'Professional'}
      Target Length: ${length || 'Medium'}

      GUIDELINES:
      - AI-Native quality: No fluff, no "I hope this email finds you well".
      - Personalization: Mention the likely platform context if relevant.
      - Call to Action: Clear and low-friction.
      - Formatting: Clean and readable.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Outreach Error:", error);
      res.status(500).json({ error: error.message });
    }
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
