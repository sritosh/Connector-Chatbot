import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { ResultCard } from "./ResultCard";
import { Search, Loader2, Zap, History as HistoryIcon, Bookmark, Globe, X, XCircle } from "lucide-react";
import { geminiService } from "../services/geminiService";
import { SearchResult, Contact, DBState, HistoryItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { OutreachModal } from "./OutreachModal";
import { cn } from "../lib/utils";

interface DashboardProps {
  onGoHome: () => void;
}

export function Dashboard({ onGoHome }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [db, setDb] = useState<DBState>({ history: [], saved: [] });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchDB();
  }, []);

  const fetchDB = async () => {
    try {
      const res = await fetch("/api/db");
      const data = await res.json();
      setDb(data);
    } catch (e) {
      console.error("Failed to fetch DB", e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await geminiService.discoverContacts(query);
      setResult(data);
      
      // Save to history
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, result: data }),
      });
      fetchDB();
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (contact: Contact) => {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact }),
    });
    fetchDB();
  };

  const handleDeleteSaved = async (id: string) => {
    await fetch(`/api/save/${id}`, { method: "DELETE" });
    fetchDB();
  };

  const categories = (result && result.contacts) ? Array.from(new Set(result.contacts.map(c => c.type))) : [];

  return (
    <div className="flex h-screen bg-brand-bg text-slate-200 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onGoHome={onGoHome} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Search Header */}
        <div className="p-8 pb-4">
          <div className="max-w-3xl mx-auto w-full relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
              <form onSubmit={handleSearch} className="relative h-16 bg-card-bg border border-white/10 rounded-2xl flex items-center px-4 gap-4 shadow-2xl focus-within:border-blue-500/50 transition-all">
                <Search className={cn("w-6 h-6 text-blue-500 shrink-0 transition-transform", loading && "scale-90 opacity-50")} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brands, startups, or companies..."
                  className="bg-transparent border-none outline-none text-lg text-white flex-1 placeholder-slate-700 font-medium h-full"
                />
                <div className="flex items-center gap-3 shrink-0">
                   {query && !loading && (
                     <button 
                       type="button"
                       onClick={() => setQuery("")}
                       className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   )}
                   <button 
                     type="submit"
                     disabled={loading || !query.trim()}
                     className="bg-blue-600 text-white h-11 px-6 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                   >
                     {loading ? (
                       <>
                         <Loader2 className="w-4 h-4 animate-spin" />
                         <span className="hidden sm:inline">Searching...</span>
                       </>
                     ) : (
                       "Scan Web"
                     )}
                   </button>
                </div>
              </form>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto mt-6">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 space-y-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <Zap className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse fill-current" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white text-xl font-bold tracking-tight">AI Discovery in Progress</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">We're scanning official domains and social metadata for <b>{query}</b></p>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 max-w-sm">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 text-center">Speed Tip</p>
                    <p className="text-[11px] text-slate-400 text-center italic">Searching for specific brand names (e.g. "Nike" vs "Shoes") yields 3x faster results.</p>
                  </div>
                </motion.div>
              )}

              {!loading && activeTab === "search" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Public Contact Data</h2>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase">AI Analyzed</span>
                    </div>
                    <p className="text-xs text-slate-500">Found {result.contacts?.length || 0} insights for <b className="text-white">{result.companyName}</b></p>
                  </div>

                  {(!result.contacts || result.contacts.length === 0) ? (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
                      <XCircle className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm">No specific business contacts found for this entity.</p>
                      <button 
                        onClick={() => setQuery("")}
                        className="mt-4 text-xs text-blue-500 hover:underline font-bold uppercase tracking-widest"
                      >
                        Try different brand
                      </button>
                    </div>
                  ) : (
                    categories.map(category => (
                      <div key={category} className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {result.contacts.filter(c => c.type === category).map((contact, idx) => (
                            <ResultCard
                              key={`${category}-${contact.value}-${idx}`}
                              contact={contact}
                              onSave={handleSaveContact}
                              onGenerateOutreach={setSelectedContact}
                              isSaved={db.saved?.some(s => s.value === contact.value) || false}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {!loading && activeTab === "search" && !result && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Discover</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Start by searching a company name to reveal categorized public business contacts.</p>
                </div>
              )}

              {activeTab === "saved" && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Saved Leads</h2>
                    <p className="text-xs text-slate-600 mt-1">Bookmarked contacts for your outreach campaigns.</p>
                  </div>
                  
                  {db.saved?.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
                      <Bookmark className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm">Your lead list is currently empty.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {db.saved?.map((contact, idx) => (
                        <ResultCard
                          key={`saved-${contact.id || idx}`}
                          contact={contact}
                          onSave={() => handleDeleteSaved(contact.id)}
                          onGenerateOutreach={setSelectedContact}
                          isSaved={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Search Logs</h2>
                  </div>
                  <div className="space-y-3">
                    {db.history?.map((item: HistoryItem) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setResult(item.result);
                          setQuery(item.query);
                          setActiveTab("search");
                        }}
                        className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-blue-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                            <HistoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{item.query}</p>
                            <p className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded text-slate-500 uppercase tracking-tight">
                          {item.result.contacts.length} Contacts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                 <div className="max-w-2xl space-y-8">
                    <div className="border-b border-white/5 pb-6">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">System Preferences</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-200">Email Verification Mode</p>
                          <p className="text-[10px] text-slate-500 mt-1">Cross-reference with public MX records for validity</p>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-lg" />
                        </div>
                      </div>

                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between opacity-60">
                        <div>
                          <p className="font-semibold text-slate-200 text-red-400">Flush Database</p>
                          <p className="text-[10px] text-slate-500 mt-1">Permanently delete all search history and leads</p>
                        </div>
                        <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-red-500/20 transition-colors">
                          Execute
                        </button>
                      </div>
                    </div>
                 </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600">
          <p>CONNECTOR v1.0.4 — Aggregating public business data from official sources only.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Compliance</a>
            <a href="#" className="hover:text-slate-400">Terms</a>
          </div>
        </footer>

        <AnimatePresence>
          {selectedContact && (
            <OutreachModal
              contact={selectedContact}
              companyName={result?.companyName || "the company"}
              onClose={() => setSelectedContact(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
