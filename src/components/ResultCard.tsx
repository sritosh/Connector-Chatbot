import React, { useState } from "react";
import { Copy, ExternalLink, MessageSquare, Bookmark, Check, ShieldCheck, ShieldAlert, Shield, CheckCircle2, AlertCircle, HelpCircle, Linkedin, UserCircle, Mail, Instagram, Twitter, Globe, Info, Sparkles } from "lucide-react";
import { Contact } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ResultCardProps {
  contact: Contact;
  onSave: (contact: Contact) => void;
  onGenerateOutreach: (contact: Contact) => void;
  isSaved?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ contact, onSave, onGenerateOutreach, isSaved }) => {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHostname = (url: string) => {
    try {
      if (url.startsWith('http')) {
        return new URL(url).hostname;
      }
      return url;
    } catch {
      return url;
    }
  };

  const isLinkedIn = contact.type === 'LinkedIn';
  const isExecutive = contact.type === 'Executive';

  const getPlatformIcon = (platform: string = "") => {
    const p = platform.toLowerCase();
    if (p.includes("linkedin")) return <Linkedin className="w-3.5 h-3.5" />;
    if (p.includes("email")) return <Mail className="w-3.5 h-3.5" />;
    if (p.includes("instagram")) return <Instagram className="w-3.5 h-3.5" />;
    if (p.includes("twitter")) return <Twitter className="w-3.5 h-3.5" />;
    return <Globe className="w-3.5 h-3.5" />;
  };

  const verificationColors = {
    "Verified": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Likely Active": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Needs Verification": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  }[contact.verificationStatus || "Needs Verification"];

  const relevanceColors = {
    "High Match": "from-emerald-500 to-teal-500",
    "Medium Match": "from-amber-500 to-orange-500",
    "Low Match": "from-slate-500 to-zinc-500",
  }[contact.relevanceLabel || "Low Match"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 hover:border-white/20 transition-all group flex flex-col relative overflow-hidden",
        isLinkedIn && "hover:border-blue-500/30",
        isExecutive && "hover:border-purple-500/30"
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none",
        isLinkedIn ? "bg-blue-500" : isExecutive ? "bg-purple-500" : "bg-blue-600"
      )} />

      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
            isLinkedIn ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
            isExecutive ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
            "bg-blue-500/10 text-blue-500 border-blue-500/10"
          )}>
            {contact.type}
          </span>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border",
            verificationColors
          )}>
            {contact.verificationStatus === "Verified" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Info className="w-2.5 h-2.5" />}
            {contact.verificationStatus?.toUpperCase() || "UNVERIFIED"}
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSave(contact)}
            className={cn(
              "p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all active:scale-95",
              isSaved ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-slate-500"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
          <a
            href={contact.source.startsWith('http') ? contact.source : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-white/10 text-slate-500 hover:bg-white/5 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Info */}
      <div className="mb-6 flex-1">
        <div className="flex items-start gap-4 mb-2">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            {isLinkedIn ? (
              <Linkedin className="w-6 h-6 text-blue-400" />
            ) : isExecutive ? (
              <UserCircle className="w-6 h-6 text-purple-400" />
            ) : (
              <Mail className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight truncate mb-1">
              {contact.value}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Source: {getHostname(contact.source)}
            </p>
          </div>
        </div>
      </div>

      {/* AI Intelligence Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 space-y-4">
        {/* Relevance Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relevance Score</span>
              <div 
                onMouseEnter={() => setShowReasoning(true)}
                onMouseLeave={() => setShowReasoning(false)}
                className="cursor-help"
              >
                <HelpCircle className="w-3 h-3 text-slate-600 hover:text-slate-400" />
              </div>
            </div>
            <span className="text-xs font-bold text-white">{contact.relevanceScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${contact.relevanceScore}%` }}
              className={cn("h-full bg-gradient-to-r", relevanceColors)}
            />
          </div>
          <AnimatePresence>
            {showReasoning && contact.relevanceReasoning && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[10px] text-slate-500 mt-2 italic leading-relaxed"
              >
                “{contact.relevanceReasoning}”
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Platform Suggestion */}
        <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              {getPlatformIcon(contact.recommendedPlatform)}
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Suggested Platform</p>
              <p className="text-[11px] font-bold text-white">{contact.recommendedPlatform}</p>
            </div>
          </div>
          <div className="group/tip relative">
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 border border-white/10 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
              {contact.platformReasoning}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white text-[11px] font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          {copied ? "COPIED" : "COPY"}
        </button>
        <button
          onClick={() => onGenerateOutreach(contact)}
          className={cn(
            "flex items-center justify-center gap-2 py-3 text-white text-[11px] font-bold rounded-xl transition-all active:scale-95 shadow-lg",
            isLinkedIn ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20" : 
            isExecutive ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20" :
            "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          WRITE AI
        </button>
      </div>
    </motion.div>
  );
}
