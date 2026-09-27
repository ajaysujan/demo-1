import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_QUIZ, QuizItem } from '../data/curriculum';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  X, 
  ArrowRight, 
  Flame, 
  Sparkles, 
  Zap, 
  Volume2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { femaleSpeech } from '../utils/speech';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onAskAuraExplain?: (question: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onAskAuraExplain,
}) => {
  const [selectedClass, setSelectedClass] = useState<'all' | '12' | '11'>('12');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [customQuestions, setCustomQuestions] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredQuestionBank = useMemo(() => {
    const all = [...SAMPLE_QUIZ, ...customQuestions];
    return all.filter((item) => {
      const matchClass = selectedClass === 'all' || item.targetClass === parseInt(selectedClass);
      const matchSubject = selectedSubject === 'all' || item.subject.toLowerCase() === selectedSubject.toLowerCase();
      return matchClass && matchSubject;
    });
  }, [selectedClass, selectedSubject, customQuestions]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [selectedClass, selectedSubject]);

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

  const currentQ = filteredQuestionBank[currentIndex] || SAMPLE_QUIZ[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setTotalAttempted((prev) => prev + 1);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      femaleSpeech.playAudioTone();
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });

      if ((streak + 1) % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setAiError(null);
    if (currentIndex + 1 < filteredQuestionBank.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleGenerateNextAI = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject === 'all' ? (currentQ?.subject || 'Physics') : selectedSubject,
          targetClass: selectedClass === 'all' ? 12 : parseInt(selectedClass),
          chapter: currentQ?.chapter || 'All Chapters',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate MCQ');
      const data = await res.json();
      if (data.mcq && data.mcq.question && Array.isArray(data.mcq.options)) {
        const newMCQ: QuizItem = {
          id: Date.now(),
          subject: data.mcq.subject || 'General',
          targetClass: (data.mcq.targetClass || 12) as 11 | 12,
          chapter: data.mcq.chapter || 'Important Concepts',
          question: data.mcq.question,
          options: data.mcq.options,
          correctIndex: typeof data.mcq.correctIndex === 'number' ? data.mcq.correctIndex : 0,
          explanation: data.mcq.explanation || 'Board exam conceptual explanation.',
          yearTag: '⚡ High-Yield Practice',
        };
        setCustomQuestions((prev) => [newMCQ, ...prev]);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
      }
    } catch (e: any) {
      console.warn('MCQ generation error:', e);
      setAiError('प्रश्न निर्माण में समस्या आई, पुनः प्रयास करें।');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const accuracy = totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[760px] rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all max-h-[92vh] flex flex-col overflow-hidden ${
          isDark ? 'bg-[#0f172a] border-[#223555] text-white' : 'bg-white border-[#d8e2ee] text-[#0f172a]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>वस्तुनिष्ठ प्रश्न अभ्यास (Unlimited Objective Practice)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  MCQ Bank
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Class 11 & 12 • Physics, Chem, Bio, Maths, History, Hindi, English
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

        {/* Filter Bar: Class & Subject Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 p-2 rounded-2xl bg-slate-50 dark:bg-[#141e33] border border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Class:</span>
            {[
              { id: '12', label: 'Class 12' },
              { id: '11', label: 'Class 11' },
              { id: 'all', label: 'All (दोनों)' },
            ].map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedClass === cls.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'physics', label: 'Physics' },
              { id: 'chemistry', label: 'Chemistry' },
              { id: 'biology', label: 'Biology' },
              { id: 'mathematics', label: 'Maths' },
              { id: 'history', label: 'History' },
              { id: 'hindi', label: 'Hindi' },
              { id: 'english', label: 'English' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === sub.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#1b2742] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Score & Streak Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-950/30 dark:to-purple-950/30 border border-slate-200 dark:border-slate-800 mb-3 shrink-0 text-xs font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Score: {score}</span>
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span>Accuracy: {accuracy}%</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-500 font-extrabold animate-pulse">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Streak: {streak} 🔥</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Q {currentIndex + 1} of {filteredQuestionBank.length}
            </span>
          </div>
        </div>

        {/* Active Question Box */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {currentQ ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {currentQ.subject} • Class {currentQ.targetClass} • {currentQ.chapter}
                </span>
                {currentQ.yearTag && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {currentQ.yearTag}
                  </span>
                )}
              </div>

              {/* Question Statement */}
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                <span className="text-blue-600 mr-2">Q{currentIndex + 1}.</span>
                <span>{currentQ.question}</span>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let optionStyle = isDark 
                    ? 'border-[#223555] bg-[#111c33] hover:border-blue-400 text-slate-200' 
                    : 'border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-slate-800 shadow-xs';

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200';
                    } else {
                      optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-99 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isAnswered && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isAnswered && isSelected && !isCorrect
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">{opt}</span>
                      </div>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation upon Answering */}
              {isAnswered && (
                <div className="mt-4 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>उत्तर की व्याख्या (Step-by-Step Explanation):</span>
                    </span>
                    <button
                      onClick={() => femaleSpeech.speak(currentQ.explanation)}
                      className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>सुनें (Listen)</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {currentQ.explanation}
                  </p>

                  {onAskAuraExplain && (
                    <button
                      onClick={() => {
                        onAskAuraExplain(`इस प्रश्न को NCERT के अनुसार समझाएं: "${currentQ.question}" जिसका सही उत्तर "${currentQ.options[currentQ.correctIndex]}" है।`);
                        onClose();
                      }}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111c33] border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>AURA से विस्तार में पूछें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {aiError && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  {aiError}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              कोई प्रश्न उपलब्ध नहीं है।
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 shrink-0">
          <button
            onClick={handleGenerateNextAI}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Generate a completely new objective question"
          >
            <Zap className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAI ? 'बन रहा है...' : 'नया प्रश्न लाएं (Infinite)'}</span>
          </button>
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
          >
            <span>अगला प्रश्न (Next Question)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
