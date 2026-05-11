export interface Contact {
  id: string;
  type: 'Partnership' | 'Sponsorship' | 'Careers' | 'Media' | 'Support' | 'General' | 'Social';
  value: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  verificationStatus?: 'verified' | 'unverified' | 'failed' | 'verifying';
}

export interface SearchResult {
  companyName: string;
  description: string;
  contacts: Contact[];
}

export interface HistoryItem {
  id: string;
  query: string;
  result: SearchResult;
  timestamp: string;
}

export interface SavedContact extends Contact {
  savedAt: string;
}

export interface DBState {
  history: HistoryItem[];
  saved: SavedContact[];
}
