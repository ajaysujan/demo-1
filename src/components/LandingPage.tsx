import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Moon, 
  Sun, 
  Paperclip, 
  Mic, 
  ArrowUp, 
  LogIn, 
  UserPlus, 
  BookOpen, 
  FileText, 
  Star, 
  BarChart3, 
  GraduationCap, 
  X,
  Sparkles,
  Bot,
  CheckCircle2,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LandingPageProps {
  onLoginSuccess: (username: string) => void;
  onAskDirect: (question: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  onAskDirect,
  isDark,
  onToggleTheme,
}) => {
  const [question, setQuestion] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('ajay_sujan');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Ajay Sujan');
  const [isListening, setIsListening] = useState(false);
  const [isLoggingInAnim, setIsLoggingInAnim] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickDemoLogin = () => {
    setIsLoggingInAnim(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#7c3aed', '#ec4899', '#06b6d4'],
    });
    setTimeout(() => {
      onLoginSuccess(name || 'Ajay Sujan');
    }, 600);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsLoggingInAnim(true);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#7c3aed', '#ec4899'],
    });
    setTimeout(() => {
      onLoginSuccess(authMode === 'create' ? (name || username) : username);
    }, 500);
  };

  const handleLandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (q) {
      onAskDirect(q);
    } else {
      setShowAuthModal(true);
      setAuthMode('login');
    }
  };

  // Web speech recognition for mic
  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0b1322] text-[#e8efff]' : 'bg-[#f4f8fe] text-[#15233d]'
    }`}>
      {/* Dynamic Animated Fluid Shifting Color Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] left-[15%] w-[550px] h-[550px] rounded-full blur-[110px] opacity-60 animate-float-orb-1 animate-color-cycle mix-blend-multiply dark:mix-blend-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500" />
        <div className="absolute top-[25%] right-[10%] w-[650px] h-[650px] rounded-full blur-[130px] opacity-50 animate-float-orb-2 animate-color-cycle mix-blend-multiply dark:mix-blend-screen bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" />
        <div className={`absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1300px] h-[850px] rounded-full blur-[140px] opacity-75 ${
          isDark 
            ? 'bg-gradient-to-b from-[#1e3a8a]/40 via-[#312e81]/30 to-transparent'
            : 'bg-gradient-to-b from-[#dbeafe]/80 via-[#ede9fe]/50 to-[#f4f8fe]'
        }`} />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 py-5 flex items-center justify-between">
        {/* Brand Logo with animated glowing ring */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500" />
            <svg viewBox="0 0 40 40" className="w-10 h-10 text-[#2563eb] transition-transform duration-500 group-hover:rotate-180" fill="none">
              <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" opacity="0.8" />
              <circle cx="20" cy="20" r="4.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="text-[22px] font-extrabold tracking-tight leading-none text-[#14233c] dark:text-white">
              AURA
            </div>
            <div className="text-[11px] font-medium text-[#64748b] dark:text-[#94a3b8] tracking-normal mt-0.5">
              School Learning System
            </div>
          </div>
        </div>

        {/* Top Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              isDark 
                ? 'border-[#2d3f5e] bg-[#132037] text-amber-300 hover:bg-[#1a2d4f]'
                : 'border-[#cbd5e1] bg-white/80 text-[#334155] hover:bg-white shadow-sm'
            }`}
            title="Toggle Dark Mode"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              isDark 
                ? 'border-[#2d3f5e] bg-[#132037] text-[#cbd5e1]'
                : 'border-[#cbd5e1] bg-white/80 text-[#334155] shadow-sm'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>English / हिंदी</span>
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 w-full max-w-[860px] mx-auto px-4 sm:px-6 pt-4 pb-12 flex flex-col items-center text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dbeafe]/80 dark:bg-[#1e293b] text-[#2563eb] dark:text-[#60a5fa] text-[13px] font-semibold mb-6 shadow-sm border border-[#bfdbfe]/50 dark:border-blue-900/40 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 fill-current text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>AURA • Your Learning Companion</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-[#111827] dark:text-white leading-[1.12] mb-3">
          Welcome to AURA
        </h1>

        {/* Subheading */}
        <div className="text-lg sm:text-[19px] font-semibold text-[#475569] dark:text-[#94a3b8] mb-2">
          Learn &nbsp;•&nbsp; Practice &nbsp;•&nbsp; Grow
        </div>

        {/* Description */}
        <p className="max-w-[620px] text-sm sm:text-[14.5px] text-[#64748b] dark:text-[#94a3b8] leading-relaxed mb-8">
          Your personal study companion for Class 11-12 Board exams. Ask questions, solve doubts, get study material, take tests and achieve your goals.
        </p>

        {/* Ask AURA Card */}
        <div className={`w-full rounded-2xl border transition-all duration-300 text-left p-6 sm:p-7 shadow-[0_15px_45px_rgba(37,99,235,0.08)] ${
          isDark 
            ? 'bg-[#111c33]/90 border-[#233555] shadow-[0_15px_45px_rgba(0,0,0,0.3)]'
            : 'bg-white/95 border-[#dbe6f5]'
        }`}>
          {/* Card Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] dark:bg-[#1e293b] flex items-center justify-center text-[#2563eb] dark:text-[#60a5fa] relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>
              <div className="text-[17px] font-bold text-[#0f172a] dark:text-white">
                Ask AURA
              </div>
              <div className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8]">
                Type your question or start a conversation...
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLandingSubmit} className="space-y-4">
            <div className={`relative rounded-xl border transition-all ${
              isDark 
                ? 'bg-[#0b1322] border-[#223555] focus-within:border-[#3b82f6]'
                : 'bg-white border-[#d1d5db] focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#dbeafe]'
            }`}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleLandingSubmit(e);
                  }
                }}
                rows={3}
                placeholder="e.g. Physics ka question poochho (Coulomb's Law, Derivations, Formula)..."
                className="w-full bg-transparent px-4 py-3.5 text-[15px] outline-none resize-none placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b]"
              />

              {/* Bottom controls */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#f1f5f9] dark:border-[#1a2844]">
                {/* Mode Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestion((prev) => prev ? `${prev} [गहन चिंतन]` : 'Physics Class 12 कूलॉम का नियम व व्युत्पत्ति समझाएं')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isDark 
                        ? 'border-[#2d3f5e] bg-[#16233d] text-[#93c5fd] hover:border-blue-500'
                        : 'border-[#cbd5e1] bg-[#f8fafc] text-[#2563eb] hover:bg-blue-50'
                    }`}
                  >
                    <span>⚡ DeepThink</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestion((prev) => prev ? `${prev} [Smart Search]` : 'Class 12 MP Board 2026 Physics paper pattern')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isDark 
                        ? 'border-[#2d3f5e] bg-[#16233d] text-[#93c5fd] hover:border-blue-500'
                        : 'border-[#cbd5e1] bg-[#f8fafc] text-[#2563eb] hover:bg-blue-50'
                    }`}
                  >
                    <Globe className="w-3 h-3 text-[#2563eb]" />
                    <span>Search</span>
                  </button>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(true);
                      setAuthMode('login');
                    }}
                    className="p-2 text-[#64748b] hover:text-[#2563eb] rounded-lg transition-colors cursor-pointer"
                    title="Attach file or photo"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      isListening 
                        ? 'text-red-500 bg-red-50 dark:bg-red-950/40 animate-pulse'
                        : 'text-[#64748b] hover:text-[#2563eb]'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Input'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Send"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons below card - Login & Create Account */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="group relative flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-[14.5px] transition-all shadow-lg shadow-blue-500/30 active:scale-95 cursor-pointer overflow-hidden"
          >
            <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('create');
              setShowAuthModal(true);
            }}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-[14.5px] border transition-all active:scale-95 cursor-pointer ${
              isDark 
                ? 'border-[#334668] bg-[#16233d] text-white hover:bg-[#1d2d4f]'
                : 'border-[#cbd5e1] bg-white text-[#1e293b] hover:bg-slate-50 shadow-sm'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#2563eb]" />
            <span>Create Account</span>
          </button>
        </div>
      </main>

      {/* 5 Bottom Feature Columns */}
      <div className="relative z-10 w-full border-t border-[#e2e8f0] dark:border-[#1e293b] bg-white/50 dark:bg-[#0b1322]/80 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-7 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e2e8f0] dark:divide-[#1e293b]">
          {/* 1. 6 Subjects */}
          <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
            <BookOpen className="w-5 h-5 text-[#2563eb] mb-2" />
            <div className="font-bold text-[13.5px] text-[#0f172a] dark:text-white mb-0.5">
              6 Subjects
            </div>
            <div className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8] leading-tight">
              Physics, Chemistry, Biology,<br />Maths, Hindi, English
            </div>
          </div>
          {/* 2. Tests */}
          <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
            <FileText className="w-5 h-5 text-[#2563eb] mb-2" />
            <div className="font-bold text-[13.5px] text-[#0f172a] dark:text-white mb-0.5">
              Tests
            </div>
            <div className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8] leading-tight">
              MCQ + Subjective
            </div>
          </div>
          {/* 3. Important Questions */}
          <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
            <Star className="w-5 h-5 text-[#2563eb] mb-2" />
            <div className="font-bold text-[13.5px] text-[#0f172a] dark:text-white mb-0.5">
              Important Questions
            </div>
            <div className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8] leading-tight">
              Board Exam Focused
            </div>
          </div>
          {/* 4. Progress */}
          <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
            <BarChart3 className="w-5 h-5 text-[#2563eb] mb-2" />
            <div className="font-bold text-[13.5px] text-[#0f172a] dark:text-white mb-0.5">
              Progress
            </div>
            <div className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8] leading-tight">
              Track Your Growth
            </div>
          </div>
          {/* 5. Teacher Mode */}
          <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
            <GraduationCap className="w-5 h-5 text-[#2563eb] mb-2" />
            <div className="font-bold text-[13.5px] text-[#0f172a] dark:text-white mb-0.5">
              Teacher Mode
            </div>
            <div className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8] leading-tight">
              Learn Smartly
            </div>
          </div>
        </div>
        {/* Footer Subtext */}
        <div className="border-t border-[#e2e8f0]/60 dark:border-[#1e293b]/60 py-3.5 text-center text-xs text-[#64748b] dark:text-[#94a3b8] font-medium">
          AURA &nbsp;•&nbsp; Class 12 MP Board &nbsp;•&nbsp; Built for Your Success
        </div>
      </div>

      {/* LOGIN & AUTH MODAL with Dynamic Moving Color Animation */}
      {showAuthModal && (
        <div 
          onClick={() => setShowAuthModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] rounded-[32px] p-[2.5px] animated-shimmer-border shadow-[0_25px_80px_rgba(37,99,235,0.35)] animate-in zoom-in-95 duration-200"
          >
            <div className={`relative w-full rounded-[30px] p-7 sm:p-8 overflow-hidden transition-all ${
              isDark 
                ? 'bg-[#0f192d] text-white' 
                : 'bg-white text-[#0f172a]'
            }`}>
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-30 animate-color-cycle bg-gradient-to-r from-blue-500 to-pink-500 pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20 animate-color-cycle bg-gradient-to-r from-cyan-400 to-indigo-600 pointer-events-none" />

              {/* Header with Clear Close Button */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-500 animate-bounce" />
                  <span>Instant Student Portal</span>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all cursor-pointer"
                  title="Close Modal (Escape)"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>

              {/* Title & Floating Animated AI Orb */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-12 h-12 rounded-2xl animate-fluid-aurora flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
                    {authMode === 'login' ? 'Login to AURA' : 'Create Account'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {authMode === 'login' 
                      ? 'Welcome back! Start your study session'
                      : 'Join AURA today for board prep'}
                  </p>
                </div>
              </div>

              {/* Fast 1-Click Login Button with shifting color shimmer */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoggingInAnim}
                className="w-full mb-4 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-[14.5px] flex items-center justify-center gap-2.5 shadow-xl shadow-blue-500/25 active:scale-98 transition-all cursor-pointer group"
              >
                {isLoggingInAnim ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                    <span>⚡ Quick Fast Login (1-Click)</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-[#0f192d] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or enter credentials
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'create' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Ajay Sujan"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        isDark 
                          ? 'bg-[#0b1322] border-[#293d63] focus:border-blue-500' 
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-600'
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="ajay_sujan"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-[#0b1322] border-[#293d63] focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-[#0b1322] border-[#293d63] focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-600'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingInAnim}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {isLoggingInAnim ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Create Account')}
                </button>
              </form>

              {/* Toggle Mode */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'create' : 'login')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  {authMode === 'login' 
                    ? 'New student? Register' 
                    : 'Already have account? Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 hover:text-red-500 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
