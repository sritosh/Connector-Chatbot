import { SearchResult, Contact } from "../types";

export interface OutreachOptions {
  contactValue: string;
  companyName: string;
  intent: string;
  tone: string;
  length: string;
  context?: string;
}

export const geminiService = {
  async discoverContacts(companyName: string, intent: string = "General Networking"): Promise<SearchResult> {
    const res = await fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, intent }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to discover contacts");
    }
    
    return res.json();
  },

  async generateOutreach(options: OutreachOptions): Promise<string> {
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate outreach");
    }

    const data = await res.json();
    return data.text;
  }
};
