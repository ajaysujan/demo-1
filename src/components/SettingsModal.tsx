import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Globe, 
  Volume2, 
  User, 
  Trash2, 
  Check, 
  Play, 
  Sparkles, 
  Shield, 
  GraduationCap, 
  ClipboardList, 
  ImageIcon, 
  Calendar,
  Layers
} from 'lucide-react';
import { femaleSpeech, VoiceSettings } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  username: string;
  onUpdateUsername: (name: string) => void;
  onClearChatHistory: () => void;
  currentLanguage: string;
  onChangeLanguage: (lang: string) => void;
  onOpenTeacherMode?: () => void;
  onOpenQuiz?: () => void;
  onOpenImageCreator?: () => void;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (US / UK / India)', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', name: 'Hinglish (Hindi in Roman script)', native: 'Hinglish' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  username,
  onUpdateUsername,
  onClearChatHistory,
  currentLanguage,
  onChangeLanguage,
  onOpenTeacherMode,
  onOpenQuiz,
  onOpenImageCreator,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'speech' | 'tools' | 'ai' | 'profile' | 'data'>('general');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(femaleSpeech.getSettings());
  const [tempName, setTempName] = useState(username);
  const [targetExam, setTargetExam] = useState('mp_board_12');
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setVoiceSettings(femaleSpeech.getSettings());
      setTempName(username);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, username]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleVoiceSettingChange = (field: keyof VoiceSettings, value: any) => {
    const updated = { ...voiceSettings, [field]: value };
    setVoiceSettings(updated);
    femaleSpeech.saveSettings({ [field]: value });
  };

  const handleTestVoiceAudio = () => {
    setIsTestingVoice(true);
    const testPhrase = currentLanguage === 'hi' 
      ? 'नमस्ते! मैं ऑरा हूँ, आपकी पढ़ाई की साथी। मेरी आवाज़ एकदम स्वाभाविक है!'
      : 'Hello! I am Aura, your personal study assistant. My voice is working cleanly and naturally!';
    femaleSpeech.testVoice(testPhrase);
    setTimeout(() => setIsTestingVoice(false), 3000);
  };

  const handleSaveProfile = () => {
    if (tempName.trim()) {
      onUpdateUsername(tempName.trim());
      showToast('Profile updated successfully');
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[780px] h-[84vh] max-h-[700px] rounded-[32px] border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDark ? 'bg-[#0f192d] border-[#253858] text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Settings (सेटिंग्स)</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalize your AURA learning experience, realistic voice & tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/50 dark:hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 right-6 z-20 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in slide-in-from-top-2 duration-200 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Body with Left Tabs and Right Panels */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Navigation Tabs */}
          <div className={`w-[205px] shrink-0 border-r p-3 space-y-1 overflow-y-auto ${
            isDark ? 'border-[#1e2e4a] bg-[#0c1424]' : 'border-slate-100 bg-slate-50/70'
          }`}>
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>General & Lang</span>
            </button>
            <button
              onClick={() => setActiveTab('speech')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'speech'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice & Speech</span>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tools & Modules</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Syllabus & Curriculum</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personalization</span>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Data Controls</span>
            </button>
          </div>

          {/* Right Panel View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Interface & Languages
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Choose the language for responses and display labels
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onChangeLanguage(lang.code);
                          showToast(`Language switched to ${lang.name}`);
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          currentLanguage === lang.code
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{lang.name}</div>
                          <div className="text-[10px] text-slate-400">{lang.native}</div>
                        </div>
                        {currentLanguage === lang.code && (
                          <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Theme (डार्क/लाइट मोड)</div>
                    <div className="text-[11px] text-slate-400">Toggle dark and light visual modes</div>
                  </div>
                  <button
                    onClick={onToggleTheme}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. SPEECH & VOICE TAB */}
            {activeTab === 'speech' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Realistic Voice Engine (आवाज़ सेटिंग्स)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Ultra-realistic natural female voice tuning with real-time test
                  </p>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/30 border border-blue-200 dark:border-blue-900/60 mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-blue-950 dark:text-blue-200">
                        Test Voice Output (आवाज़ चेक करें)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Click to hear realistic female voice live
                      </div>
                    </div>
                    <button
                      onClick={handleTestVoiceAudio}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>Realistic Studio Voice (Kore)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Recommended
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Uses human-timbre neural audio for crystal-clear natural speech
                      </div>
                    </div>
                    <button
                      onClick={() => handleVoiceSettingChange('useRealisticAI', !voiceSettings.useRealisticAI)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        voiceSettings.useRealisticAI ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        voiceSettings.useRealisticAI ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Speech Rate Slider */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Speaking Speed (बोलने की गति)</span>
                      <span className="text-blue-600 font-bold">{voiceSettings.rate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={voiceSettings.rate}
                      onChange={(e) => handleVoiceSettingChange('rate', parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Slower (0.75x)</span>
                      <span>Natural (0.98x)</span>
                      <span>Faster (1.5x)</span>
                    </div>
                  </div>

                  {/* Pitch Slider */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Voice Tone / Pitch (आवाज़ का पिच)</span>
                      <span className="text-pink-600 font-bold">{voiceSettings.pitch}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={voiceSettings.pitch}
                      onChange={(e) => handleVoiceSettingChange('pitch', parseFloat(e.target.value))}
                      className="w-full accent-pink-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Deeper</span>
                      <span>Natural Female (1.05)</span>
                      <span>Higher</span>
                    </div>
                  </div>

                  {/* Auto-Speak Responses */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Auto-Speak Responses</div>
                      <div className="text-[11px] text-slate-400">उत्तर आने पर अपने आप बोलकर सुनाए</div>
                    </div>
                    <button
                      onClick={() => handleVoiceSettingChange('autoSpeak', !voiceSettings.autoSpeak)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        voiceSettings.autoSpeak ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        voiceSettings.autoSpeak ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TOOLS & MODULES TAB */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Tools & Learning Modules (अध्ययन टूल्स)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Quickly launch board learning modules directly from settings
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTeacherMode?.();
                      }}
                      className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-left hover:border-rose-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                        <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Teacher Mode (टीचर मोड)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        1-on-1 personalized mentorship session with Aura for exam guidance
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenQuiz?.();
                      }}
                      className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 text-left hover:border-purple-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs">
                        <ClipboardList className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Practice MCQ Test (ऑब्जेक्टिव टेस्ट)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Class 12 board objective test with instant marks and celebration
                      </p>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenImageCreator?.();
                      }}
                      className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-left hover:border-indigo-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Diagram Creator (चित्र स्टूडियो)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Generate science diagrams, circuits, and visual charts
                      </p>
                    </button>
                    <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-left">
                      <div className="flex items-center gap-2 mb-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>MP Board 2026 Timetable</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Syllabus blueprint, key chapters, and last 30 days revision timetable
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. AI & CURRICULUM TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Learning Focus & Board Standard
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Tailors formulas, derivations, and explanations to your exam syllabus
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'mp_board_12', title: 'Class 12 MP Board (Science & General)', sub: 'Focused on MPBSE Blueprint, 5-star derivations and formulas' },
                      { id: 'cbse_12', title: 'Class 12 CBSE / NCERT', sub: 'Conceptual rigor and NCERT exemplar problem solving' },
                      { id: 'class_11', title: 'Class 11 Foundation', sub: 'Fundamentals, core laws, and conceptual building' },
                      { id: 'jee_neet', title: 'JEE Main & NEET Exam Prep', sub: 'High speed numericals, shortcuts, and MCQs' },
                    ].map((exam) => (
                      <button
                        key={exam.id}
                        onClick={() => {
                          setTargetExam(exam.id);
                          showToast(`Exam focus set to ${exam.title}`);
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          targetExam === exam.id
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{exam.title}</div>
                          <div className="text-[10px] text-slate-400">{exam.sub}</div>
                        </div>
                        {targetExam === exam.id && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. PERSONALIZATION TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Student Profile
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    How AURA addresses you during study sessions
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Student Name</label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-[#0b1322] border-[#253858]' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DATA CONTROLS */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Data & History
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Manage session history stored on your local browser
                  </p>
                  <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                    <div className="text-xs font-bold text-red-700 dark:text-red-300">
                      Clear Current Chat History
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Deletes all messages and attachments from the active study session.
                    </p>
                    <button
                      onClick={() => {
                        onClearChatHistory();
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Chat History</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
