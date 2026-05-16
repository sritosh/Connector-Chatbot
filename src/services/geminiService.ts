import { SearchResult, Contact } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy init Gemini
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please check your settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export interface OutreachOptions {
  contactValue: string;
  companyName: string;
  intent: string;
  tone: string;
  length: string;
}

export const geminiService = {
  async discoverContacts(companyName: string, intent: string = "General Networking"): Promise<SearchResult> {
    const ai = getAI();
    
    const prompt = `DATABASE SEARCH & INTELLIGENCE: "${companyName}"
    User Intent: ${intent}

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
      model: "gemini-3-flash-preview",
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
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text) as SearchResult;
    
    // Sort by relevance score
    if (data.contacts) {
      data.contacts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
    
    return data;
  },

  async generateOutreach(options: OutreachOptions): Promise<string> {
    const ai = getAI();
    
    const prompt = `Write a high-performance, human-like outreach message.
    Company: ${options.companyName}
    Target: ${options.contactValue}
    Intent/Purpose: ${options.intent}
    Tone: ${options.tone || 'Professional'}
    Target Length: ${options.length || 'Medium'}

    GUIDELINES:
    - AI-Native quality: No fluff, no "I hope this email finds you well".
    - Personalization: Mention the likely platform context if relevant.
    - Call to Action: Clear and low-friction.
    - Formatting: Clean and readable.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.text;
    if (!text) throw new Error("Failed to generate outreach");
    return text;
  }
};
