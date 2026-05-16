export type ContactType = 'Partnership' | 'Sponsorship' | 'Careers' | 'Media' | 'Support' | 'General' | 'Social' | 'LinkedIn' | 'Executive';
export type RelevanceLabel = 'High Match' | 'Medium Match' | 'Low Match';
export type VerificationState = 'Verified' | 'Likely Active' | 'Needs Verification';

export interface Contact {
  id: string;
  type: ContactType;
  value: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  relevanceScore?: number; // 0-100
  relevanceLabel?: RelevanceLabel;
  relevanceReasoning?: string;
  recommendedPlatform?: string;
  platformReasoning?: string;
  verificationStatus?: VerificationState;
  verificationReasoning?: string;
}

export interface SearchResult {
  companyName: string;
  description: string;
  intent?: string;
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
