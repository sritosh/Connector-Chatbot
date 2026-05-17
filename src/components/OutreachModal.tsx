import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Copy, RotateCcw, Sparkles, CheckCircle2, ChevronDown, Wand2 } from "lucide-react";
import { Contact, RelevanceLabel } from "../types";
import { geminiService } from "../services/geminiService";

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  companyName: string;
  defaultIntent: string;
}

const TONES = ["Professional", "Friendly", "Confident", "Formal", "Startup Casual"];
const LENGTHS = ["Short", "Medium", "Detailed"];
const INTENTS = [
  "Sponsorship Pitch", 
  "Freelance Proposal", 
  "Internship Request", 
  "Partnership Inquiry", 
  "Creator Collaboration", 
  "Job Application", 
  "Media Inquiry"
];

export const OutreachModal: React.FC<OutreachModalProps> = ({ 
  isOpen, 
  onClose, 
  contact, 
  companyName,
  defaultIntent 
}) => {
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [intent, setIntent] = useState(defaultIntent || "Partnership Inquiry");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState("");

  const generate = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const text = await geminiService.generateOutreach({
        contactValue: contact.value,
        companyName,
        intent,
        tone,
        length,
        context: context.trim()
      });
      
      // Simulate typing effect
      let currentText = "";
      const words = text.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + " ";
        setMessage(currentText);
        await new Promise(r => setTimeout(r, 20));
      }
    } catch (e) {
      console.error(e);
      setMessage("Failed to generate message. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIntent(defaultIntent || "Partnership Inquiry");
      setMessage("");
    }
  }, [isOpen, defaultIntent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Wand2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Outreach Architect</h2>
                <p className="text-xs text-slate-400">Crafting personalized message for {contact.value}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px] max-h-[85vh]">
            {/* Sidebar Controls */}
            <div className="p-6 border-r border-white/5 space-y-6 bg-black/20 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Outreach Type</label>
                <div className="space-y-1">
                  {INTENTS.map(i => (
                    <button
                      key={i}
                      onClick={() => setIntent(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        intent === i ? "bg-blue-500/20 text-blue-400 font-medium border border-blue-500/20" : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tone & Length</label>
                <div className="grid grid-cols-1 gap-4">
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white text-xs rounded-lg p-2 outline-none focus:border-blue-500/50"
                  >
                    {TONES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                  <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    {LENGTHS.map(l => (
                      <button
                        key={l}
                        onClick={() => setLength(l)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-medium transition-all ${
                          length === l ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Custom Context (Optional)</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe your specific background, achievements, or what you want to mention..."
                  className="w-full h-24 bg-white/5 border border-white/10 text-white text-[11px] rounded-lg p-3 outline-none focus:border-blue-500/50 resize-none custom-scrollbar placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={generate}
                disabled={generating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {generating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Architecting..." : "Generate Message"}
              </button>
            </div>

            {/* Main Content Area */}
            <div className="col-span-2 p-8 flex flex-col relative bg-gradient-to-br from-transparent to-blue-500/[0.02] overflow-hidden">
              <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/5 p-6 overflow-y-auto custom-scrollbar font-serif leading-relaxed text-slate-300 text-sm whitespace-pre-wrap">
                {message || (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Sparkles className="w-12 h-12 text-blue-400" />
                    <p className="text-xs">Select options and click generate <br/>to create your message.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-slate-500 font-medium">Ready for Outreach</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    disabled={!message || generating}
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold rounded-xl transition-all border border-white/10"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    {copied ? "Copied" : "Copy to Clipboard"}
                  </button>
                  <button
                    disabled={!message || generating}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-slate-200 disabled:opacity-30 text-xs font-bold rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Connect Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
