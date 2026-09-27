import React, { useState, useEffect } from 'react';
import { SubjectDetails, PYQuestion } from '../data/curriculum';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  Send, 
  Search, 
  Calendar, 
  Flame 
} from 'lucide-react';

interface SubjectModalProps {
  subject: SubjectDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  isDark: boolean;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  subject,
  isOpen,
  onClose,
  onSelectPrompt,
  isDark,
}) => {
  const [selectedClass, setSelectedClass] = useState<'12' | '11'>('12');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chapters' | 'pyq' | 'formulas' | 'important'>('chapters');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setSearchQuery('');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !subject) return null;

  const currentCurriculum = selectedClass === '12' ? subject.class12 : subject.class11;
  const chapters = currentCurriculum?.chapters || subject.chapters;
  const keyFormulas = currentCurriculum?.keyFormulas || subject.keyFormulas;
  const importantQuestions = currentCurriculum?.importantQuestions || subject.importantQuestions;
  const pyqs: PYQuestion[] = currentCurriculum?.previousYearQuestions || subject.previousYearQuestions || [];

  const filterText = searchQuery.toLowerCase().trim();
  const filteredChapters = chapters.filter(ch => ch.toLowerCase().includes(filterText));
  const filteredFormulas = keyFormulas.filter(f => f.toLowerCase().includes(filterText));
  const filteredImpQuestions = importantQuestions.filter(q => q.toLowerCase().includes(filterText));
  const filteredPYQs = pyqs.filter(p => p.question.toLowerCase().includes(filterText) || p.year.toLowerCase().includes(filterText));

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[820px] rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all max-h-[90vh] flex flex-col overflow-hidden ${
          isDark ? 'bg-[#0f172a] border-[#223555] text-white' : 'bg-white border-[#d8e2ee] text-[#0f172a]'
        }`}
      >
        {/* Top Action Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50">
              {subject.icon}
            </span>
            <div>
              <h3 className="text-xl font-black tracking-tight leading-tight flex items-center gap-2">
                <span>{subject.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {subject.hindiName}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                NCERT & State Board Complete Syllabus, Formulas & PYQs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-xs font-bold text-red-600 dark:text-red-400 transition-all cursor-pointer active:scale-95"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
            <span>बंद करें</span>
          </button>
        </div>

        {/* Class Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3 shrink-0">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-[#16233d] border border-slate-200 dark:border-slate-800 self-start">
            <button
              onClick={() => setSelectedClass('12')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === '12'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
            >
              कक्षा 12th Board
            </button>
            <button
              onClick={() => setSelectedClass('11')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedClass === '11'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
            >
              कक्षा 11th
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="चैप्टर, फॉर्मूला या PYQ खोजें..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                isDark 
                  ? 'bg-[#141e33] border-[#223555] text-white placeholder:text-slate-500 focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* View Selection Navigation Tabs */}
        <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'chapters'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>अध्याय (Chapters - {filteredChapters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pyq')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'pyq'
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>बोर्ड प्रश्न (PYQs 2019-2024)</span>
          </button>
          <button
            onClick={() => setActiveTab('important')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'important'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>5-स्टार महत्वपूर्ण प्रश्न</span>
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'formulas'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>सूत्र व नियम (Key Formulas)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* 1. CHAPTERS TAB */}
          {activeTab === 'chapters' && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Class {selectedClass} अध्याय (Click to Study / Ask)</span>
                <span>{filteredChapters.length} Chapters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredChapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectPrompt(`Class ${selectedClass} ${subject.name}: ${ch} को NCERT के अनुसार आसान भाषा में समझाएं`);
                      onClose();
                    }}
                    className={`text-left p-3 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between group cursor-pointer active:scale-98 ${
                      isDark 
                        ? 'border-[#203152] bg-[#111c33] hover:border-blue-500 hover:bg-[#16233d] text-slate-200' 
                        : 'border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/60 text-slate-800 shadow-xs'
                    }`}
                  >
                    <span className="font-semibold leading-relaxed pr-2">{ch}</span>
                    <Send className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. PREVIOUS YEAR QUESTIONS (PYQs) TAB */}
          {activeTab === 'pyq' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Class {selectedClass} विगत वर्षों के प्रश्न (Click to Get Full Solution)</span>
              </div>
              {filteredPYQs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">कोई प्रश्न नहीं मिला</div>
              ) : (
                filteredPYQs.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectPrompt(`[Previous Year Question - ${item.year}]: "${item.question}" का बोर्ड परीक्षा मानक के अनुसार पूर्ण हल समझाएं।`);
                      onClose();
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer group active:scale-99 ${
                      isDark 
                        ? 'border-[#203152] bg-[#111c33] hover:border-purple-500 text-slate-200' 
                        : 'border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/40 text-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        ⭐ {item.year}
                      </span>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline flex items-center gap-1">
                        <span>हल देखें</span>
                        <Send className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {item.question}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* 3. 5-STAR IMPORTANT QUESTIONS */}
          {activeTab === 'important' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>अपेक्षित बोर्ड प्रश्न (Click to Ask AURA)</span>
              </div>
              {filteredImpQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(`[Class ${selectedClass} Important Question]: "${q}" का उत्तर एवं मार्किंग स्कीम समझाएं।`);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer group active:scale-99 ${
                    isDark 
                      ? 'border-[#203152] bg-[#111c33] hover:border-amber-500 text-slate-200' 
                      : 'border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50/40 text-slate-800 shadow-xs'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-xs font-medium leading-relaxed">
                    {q}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:underline shrink-0 flex items-center gap-1 mt-0.5">
                    <span>Ask</span>
                    <Send className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 4. FORMULAS & RULES */}
          {activeTab === 'formulas' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>महत्वपूर्ण सूत्र व इकाइयां (Quick Revision)</span>
              </div>
              {filteredFormulas.map((formula, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(`इस सूत्र का उपयोग और 1-2 उदाहरण (Numerical) बताएं: "${formula}"`);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-xs font-mono font-medium transition-all cursor-pointer group hover:border-emerald-500 ${
                    isDark 
                      ? 'border-[#203152] bg-[#111c33] text-emerald-300 hover:bg-[#16233d]' 
                      : 'border-emerald-100 bg-emerald-50/60 text-emerald-950 hover:bg-emerald-50 shadow-xs'
                  }`}
                  title="Click to ask AURA to explain with numericals"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-emerald-700 dark:text-emerald-400 text-[10px] uppercase">
                      Formula #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 flex items-center gap-1">
                      <span>Click to Practice Numericals</span>
                      <Send className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="mt-1 leading-relaxed whitespace-pre-wrap">
                    {formula}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
