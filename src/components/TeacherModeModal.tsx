import React, { useEffect } from 'react';
import { GraduationCap, Heart, Volume2, Sparkles, CheckCircle, X, ArrowLeft } from 'lucide-react';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (prompt: string) => void;
  isDark: boolean;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  isDark,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const teacherPrompts = [
    {
      title: '🎯 Class 12 MP Board 30-Day Study Strategy',
      prompt: 'Aura Ma\'am, कृपया मुझे MP Board परीक्षा के लिए अगले 30 दिनों का विषयवार टाइमटेबल और रिविजन रणनीति बताएं।',
    },
    {
      title: '⚡ कमजोर विषयों को मजबूत करने का प्लान',
      prompt: 'मैडम, मुझे फिजिक्स के डेरिवेशंस और केमिस्ट्री के न्यूमेरिकल्स में डर लगता है। कृपया इन्हें 0 से तैयार करने का तरीका बताएं।',
    },
    {
      title: '🌟 90%+ बोर्ड स्कोरर टॉपर की उत्तर पुस्तिका तकनीक',
      prompt: 'Aura, बोर्ड परीक्षा में 5 में से 5 पूरे अंक प्राप्त करने के लिए उत्तर कैसे लिखना चाहिए? मुख्य बिंदु समझाएं।',
    },
    {
      title: '🧘 तनाव मुक्ति एवं दैनिक रिवीजन गाइड',
      prompt: 'परीक्षा के समय घबराहट और याद किया हुआ भूलने की समस्या से कैसे बचें?',
    },
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[640px] rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all ${
          isDark ? 'bg-[#111c33] border-[#293d63] text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
        }`}
      >
        {/* Top bar with Close buttons */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>वापस</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-xs font-bold text-red-600 dark:text-red-400 transition-all cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
            <span>बंद करें</span>
          </button>
        </div>

        {/* Persona Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111c33] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300">
              <Heart className="w-3 h-3 fill-current" />
              <span>Dedicated Female Tutor & Mentor</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-0.5">टीचर मोड (Aura - आपकी पर्सनल मेंटर)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              व्यक्तिगत मार्गदर्शन, दैनिक स्टडी प्लान और 24/7 शंका समाधान
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            isDark ? 'border-[#223555] bg-[#0b1322]' : 'border-slate-100 bg-slate-50'
          }`}>
            <Volume2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>सुमधुर आवाज़ (Hindi/English TTS)</span>
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            isDark ? 'border-[#223555] bg-[#0b1322]' : 'border-slate-100 bg-slate-50'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>ChatGPT-शैली में सरल समझ</span>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            मार्गदर्शन सत्र चुनें (Select Mentorship Session)
          </div>
          {teacherPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onStartSession(item.prompt);
                onClose();
              }}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                isDark 
                  ? 'border-[#203152] bg-[#0b1322] hover:border-pink-500 text-slate-200' 
                  : 'border-slate-200 bg-slate-50 hover:border-pink-500 hover:bg-pink-50/50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="font-semibold">{item.title}</span>
              </div>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-bold shrink-0">प्रारंभ करें →</span>
            </button>
          ))}
        </div>

        <div className="text-center text-[11px] text-slate-400 italic">
          "कठिन से कठिन विषय भी सरल बन जाएगा जब आप सही तरीके से अभ्यास करेंगे।"
        </div>
      </div>
    </div>
  );
};
