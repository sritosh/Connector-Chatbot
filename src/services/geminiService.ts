import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const geminiService = {
  async discoverContacts(companyName: string): Promise<SearchResult> {
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
      contents: prompt,
      config: {
        // @ts-ignore
        tools: [{ googleSearch: {} }],
        // @ts-ignore
        toolConfig: { includeServerSideToolInvocations: true },
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
                  confidence: { 
                    type: Type.STRING,
                    enum: ['High', 'Medium', 'Low']
                  }
                },
                required: ['id', 'type', 'value', 'source', 'confidence']
              }
            }
          },
          required: ['companyName', 'description', 'contacts']
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as SearchResult;
  },

  async generateOutreach(contactValue: string, companyName: string, purpose: string): Promise<string> {
    const prompt = `Write a professional, concise, and modern outreach message for ${companyName}.
    Target: ${contactValue}
    Purpose: ${purpose}
    Tone: Professional yet human.
    Format: Subject Line and Email Body.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Could not generate message.";
  }
};
