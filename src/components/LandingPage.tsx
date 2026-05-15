import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Zap, Shield, Rocket, Globe, ChevronRight, ChevronDown } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left group"
      >
        <span className="font-semibold text-white group-hover:text-blue-500 transition-colors">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200 selection:bg-blue-500/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-brand-bg/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600 w-6 h-6 fill-current" />
            <span className="font-semibold text-xl tracking-tight text-white">CONNECTOR</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 fill-current" /> AI-Powered Discovery
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.05] text-white">
              Find Business Contacts <br />
              <span className="text-slate-600">Instantly with AI</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Connector uses advanced AI to discover publicly available business contacts 
              for brands, startups, and organizations across the web.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all group shadow-2xl shadow-blue-600/20"
              >
                Start Searching <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                View Analytics
              </button>
            </div>
          </motion.div>

          {/* Animated Search Bar Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 max-w-3xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-card-bg border border-white/10 backdrop-blur-sm p-4 rounded-2xl flex items-center shadow-2xl">
              <div className="flex-1 px-4 text-left text-slate-600 font-medium">
                Search "Red Bull Partnerships"...
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-slate-500">A seamless process from discovery to outreach.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: "01", title: "Search Company", desc: "Enter any brand or startup name in our AI search engine." },
              { step: "02", title: "AI Scan", desc: "Our engine performs a real-time scan of official public sources." },
              { step: "03", title: "Categorize", desc: "Contacts are automatically grouped into departments like PR or HR." },
              { step: "04", title: "Outreach", desc: "Generate a personalized professional pitch and hit send." }
            ].map((step, i) => (
              <div key={`step-${i}`} className="relative group text-center">
                <div className="text-4xl font-black text-white/10 mb-4 group-hover:text-blue-600/30 transition-colors">{step.step}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-1/4 -right-4 w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0D0D0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4 text-white">Powerful Discovery Engine</h2>
            <p className="text-slate-500 max-w-md mx-auto">Everything you need to find and reach out to decision makers with professional precision.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Deep Web Scanning", desc: "Our AI identifies official domain patterns to find public business emails and inquiry forms." },
              { icon: Rocket, title: "Lead Categorization", desc: "Contacts are automatically segmented into Partnerships, HR, and Media categories." },
              { icon: Zap, title: "AI Outreach Craft", desc: "Generate context-aware outreach messages based on public mission statements." },
              { icon: Shield, title: "Verified Identity", desc: "Every extracted record includes a direct link to the public source for transparency." },
              { icon: Globe, title: "Corporate Discovery", desc: "Discover connections for global startups and heritage brands across industries." },
              { icon: Rocket, title: "Pipeline Ready", desc: "Save and organize your professional leads for your next major campaign." }
            ].map((feature, i) => (
              <div key={`feature-${i}`} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-500">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about secure discovery.</p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "How does Connector find contacts?",
                a: "Our AI engine analyzes publicly available data from official company domains, news articles, and corporate filings to identify business email patterns and public inquiry points."
              },
              {
                q: "Is the information verified?",
                a: "Yes. Every contact found includes a 'Source' link, allowing you to click directly and see where the information was publicly posted for complete transparency."
              },
              {
                q: "Is searching for contacts legal?",
                a: "Connector only indexes information that organizations have intentionally made public on their websites or official channels. We do not engage in private data scraping or unauthorized access."
              },
              {
                q: "Can I save the leads I find?",
                a: "Absolutely. You can bookmark any contact with a single click and access them anytime from your private 'Saved Contacts' dashboard."
              },
              {
                q: "How do I generate outreach messages?",
                a: "Our AI reads the company's public mission and the contact category to help you draft professional, relevant pitches that get higher response rates."
              }
            ].map((item, i) => (
              <FAQItem key={`faq-${i}`} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Stop wasting hours searching <br /> for contact details manually.</h2>
          <button
            onClick={onStart}
            className="px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
          >
            Try Connector Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-zinc-500 w-5 h-5 fill-current" />
            <span className="font-bold text-zinc-500 tracking-tighter">CONNECTOR</span>
          </div>
          <p className="text-zinc-600 text-sm">
            Connector aggregates publicly available business contact information from public sources.
          </p>
          <div className="flex gap-6 text-zinc-600 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
