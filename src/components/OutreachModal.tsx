import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Copy, Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Contact } from "../types";
import { geminiService } from "../services/geminiService";
import { cn } from "../lib/utils";

interface OutreachModalProps {
  contact: Contact;
  companyName: string;
  onClose: () => void;
}

export function OutreachModal({ contact, companyName, onClose }: OutreachModalProps) {
  const [purpose, setPurpose] = useState("partnership");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const purposes = [
    { id: "partnership", label: "Partnership", icon: "🤝" },
    { id: "sponsorship", label: "Sponsorship", icon: "💎" },
    { id: "freelance", label: "Freelance Pitch", icon: "🎨" },
    { id: "job", label: "Job Inquiry", icon: "💼" },
    { id: "media", label: "Media Inquiry", icon: "🎙️" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const selectedPurpose = purposes.find(p => p.id === purpose)?.label || purpose;
      const text = await geminiService.generateOutreach(contact.value, companyName, selectedPurpose);
      setMessage(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card-bg border border-white/10 rounded-3xl shadow-2xl overflow-hidden shadow-black"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/10">
              <Wand2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Outreach Generator</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Target: {contact.value}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Outreach Category</label>
            <div className="flex flex-wrap gap-2">
              {purposes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-tight",
                    purpose === p.id 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                  )}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[300px] relative">
            <AnimatePresence mode="wait">
              {!message && !loading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <Sparkles className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Select a category and trigger the AI to craft a professional message.</p>
                </motion.div>
              )}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/50 backdrop-blur-sm z-10"
                >
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="font-bold text-sm tracking-tight animate-pulse text-white">Synthesizing Message...</p>
                </motion.div>
              )}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-white/5 rounded-2xl p-6 relative group"
                >
                  <pre className="whitespace-pre-wrap font-sans text-slate-300 text-[11px] leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar italic">
                    {message}
                  </pre>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 bg-blue-500/5 border-t border-blue-500/10 flex items-center justify-between">
          <p className="text-[10px] text-blue-300/60 max-w-[240px] leading-tight">
            Connector AI analyzes company metadata to personalize outreach. Always review before sending.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2 text-xs uppercase tracking-tight"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              {message ? "Re-Synthesize" : "Draft Message"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
