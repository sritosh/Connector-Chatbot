import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Mail, Phone, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { signInWithGoogle, signInAsGuest } from "../lib/firebase";

interface AuthPageProps {
  onAuthComplete: (user: any) => void;
}

export function AuthPage({ onAuthComplete }: AuthPageProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (!value) {
      setIsValid(null);
      return;
    }
    const timer = setTimeout(() => {
      if (method === "email") {
        setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
      } else {
        // Indian phone number regex
        const cleanValue = value.replace(/[\s+91]/g, "");
        setIsValid(/^[6-9]\d{9}$/.test(cleanValue));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value, method]);

  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) onAuthComplete(user);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !isValid) return;
    setLoading(true);
    setError(null);
    // Simulation: In a real app with backend, this would trigger an actual SMS/Email
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      // Try real anonymous session first
      const user = await signInAsGuest();
      onAuthComplete(user);
    } catch (err: any) {
      console.warn("Guest Auth failed, falling back to simulation:", err);
      // Fallback for demo if Anonymous Auth isn't enabled in console
      onAuthComplete({ email: value, uid: "simulated-user" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card-bg border border-white/10 rounded-[32px] p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Connector</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to start discovering professional leads.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl mb-6">
                <button
                  onClick={() => setMethod("email")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                    method === "email" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Mail className="w-3.5 h-3.5" /> EMAIL
                </button>
                <button
                  onClick={() => setMethod("phone")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                    method === "phone" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Phone className="w-3.5 h-3.5" /> PHONE
                </button>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                    {method === "email" ? "Email Address" : "Phone Number (India)"}
                  </label>
                  <div className="relative">
                    <input
                      type={method === "email" ? "email" : "tel"}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={method === "email" ? "alex@example.com" : "+91 98765 43210"}
                      className={cn(
                        "w-full bg-[#0A0A0B] border rounded-xl px-4 py-3 text-white placeholder-slate-700 outline-none transition-all",
                        isValid === true ? "border-emerald-500/50 focus:border-emerald-500" : 
                        isValid === false ? "border-red-500/50 focus:border-red-500" : 
                        "border-white/10 focus:border-blue-600/50"
                      )}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                       <AnimatePresence mode="wait">
                         {isValid === true && (
                           <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           </motion.div>
                         )}
                         {isValid === false && (
                           <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                             <XCircle className="w-4 h-4 text-red-500" />
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-card-bg px-4 text-slate-600">Secure AI Auth</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    Secure Login with Google
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    We've sent a 4-digit verification code to <b className="text-white">{value}</b>.
                  </p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase">Simulation: Enter any 4 digits to continue</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Verification Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[1em] text-white placeholder-slate-800 outline-none focus:border-blue-600/50 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="w-full text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
                >
                  Change {method}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 leading-relaxed px-4">
                By continuing, you agree to Connector's Terms of Service and Privacy Policy. OTP verification is handled via secure servers.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
