import { SearchResult } from "../types";

export const geminiService = {
  async discoverContacts(companyName: string): Promise<SearchResult> {
    const res = await fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to discover contacts");
    }
    
    return res.json();
  },

  async generateOutreach(contactValue: string, companyName: string, purpose: string): Promise<string> {
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactValue, companyName, purpose }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate outreach");
    }

    const data = await res.json();
    return data.text;
  }
};
