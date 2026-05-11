import React, { useState, useEffect } from "react";
import { Copy, ExternalLink, MessageSquare, Bookmark, Check, ShieldCheck, ShieldAlert, Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Contact } from "../types";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface ResultCardProps {
  contact: Contact;
  onSave: (contact: Contact) => void;
  onGenerateOutreach: (contact: Contact) => void;
  isSaved?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ contact, onSave, onGenerateOutreach, isSaved }) => {
  const [copied, setCopied] = useState(false);
  const [vStatus, setVStatus] = useState<'verified' | 'unverified' | 'failed' | 'verifying'>(contact.verificationStatus || 'unverified');

  useEffect(() => {
    if (vStatus === 'unverified') {
      verifyContact();
    }
  }, []);

  const verifyContact = async () => {
    setVStatus('verifying');
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contact.type, value: contact.value }),
      });
      const data = await res.json();
      setVStatus(data.status);
    } catch (e) {
      setVStatus('failed');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceIcon = {
    High: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    Medium: <Shield className="w-4 h-4 text-amber-500" />,
    Low: <ShieldAlert className="w-4 h-4 text-zinc-500" />,
  }[contact.confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all group flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-500/10 rounded text-[10px] font-bold text-blue-500 uppercase tracking-widest border border-blue-500/10">
            {contact.type}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            {contact.confidence === 'High' ? 'AI ANALYZED' : contact.confidence.toUpperCase()}
          </div>
          <AnimatePresence mode="wait">
            {vStatus === 'verifying' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-bold border border-blue-500/20"
              >
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> VERIFYING
              </motion.div>
            )}
            {vStatus === 'verified' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold border border-emerald-500/20"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
              </motion.div>
            )}
            {vStatus === 'failed' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-bold border border-red-500/20"
              >
                <XCircle className="w-2.5 h-2.5" /> INVALID
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSave(contact)}
            className={cn(
              "p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors",
              isSaved ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-slate-500"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
          </button>
          <a
            href={contact.source}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-white/10 text-slate-500 hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="mb-6 flex-1">
        <p className="text-white font-medium text-lg leading-snug mb-1 truncate">
          {contact.value}
        </p>
        <p className="text-[10px] text-slate-600 truncate">
          Source: {new URL(contact.source).hostname}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/10 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
        <button
          onClick={() => onGenerateOutreach(contact)}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition-colors"
        >
          <MessageSquare className="w-3 h-3" /> Write AI
        </button>
      </div>
    </motion.div>
  );
}
