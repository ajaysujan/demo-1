import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Volume2, 
  X, 
  Sparkles, 
  Send, 
  Zap, 
  Play,
  Globe,
  AlertCircle
} from 'lucide-react';
import { femaleSpeech } from '../utils/speech';

interface AIAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQueryToMainChat: (query: string, reply: string) => void;
  isDark: boolean;
}

export const AIAssistantOverlay: React.FC<AIAssistantOverlayProps> = ({
  isOpen,
  onClose,
  onSendQueryToMainChat,
  isDark,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'aura'; text: string }>>([
    {
      role: 'aura',
      text: 'नमस्ते! मैं ऑरा हूँ। आप मुझसे बोलकर कोई भी प्रश्न पूछ सकते हैं।'
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    const unsub = femaleSpeech.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, transcript, isThinking]);

  const handleClose = () => {
    stopListening();
    femaleSpeech.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    onClose();
  };

  const handleProcessUserSpeech = async (spokenText: string) => {
    const query = spokenText.trim();
    if (!query) return;

    stopListening();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    femaleSpeech.playAudioTone();

    setConversationHistory((prev) => [...prev, { role: 'user', text: query }]);
    setTranscript('');
    setTypedInput('');
    setIsThinking(true);
    setSpeechError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          history: conversationHistory.slice(-4),
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await res.json();
      const reply = data.answer || 'माफ कीजिए, मुझे उत्तर नहीं मिला।';
      setConversationHistory((prev) => [...prev, { role: 'aura', text: reply }]);
      onSendQueryToMainChat(query, reply);

      if (autoSpeakEnabled) {
        femaleSpeech.speak(reply);
      }
    } catch (err: any) {
      console.error('AI Assistant Error:', err);
      const errMsg = 'नेटवर्क में त्रुटि हुई। कृपया पुनः प्रयास करें।';
      setConversationHistory((prev) => [...prev, { role: 'aura', text: errMsg }]);
      if (autoSpeakEnabled) {
        femaleSpeech.speak(errMsg);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const startListening = () => {
    setSpeechError(null);
    femaleSpeech.stop();
    femaleSpeech.playAudioTone();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('आपके ब्राउज़र में वॉइस रिकॉग्निशन समर्थित नहीं है।');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        const cleaned = currentTranscript.trim();
        setTranscript(cleaned);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          if (cleaned.length > 2) {
            handleProcessUserSpeech(cleaned);
          }
        }, 1300);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('माइक्रोफ़ोन अनुमति की आवश्यकता है।');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`त्रुटि: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        const pending = transcriptRef.current.trim();
        if (pending.length > 2 && !isThinking) {
          handleProcessUserSpeech(pending);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition start exception:', err);
      setSpeechError('माइक्रोफ़ोन प्रारंभ करने में विफल।');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const handleTestVoice = () => {
    const phrase = speechLanguage === 'hi-IN'
      ? 'नमस्ते! मेरी आवाज़ एकदम स्पष्ट और स्वाभाविक है। आप क्या पढ़ना चाहते हैं?'
      : 'Hello! My voice is working cleanly and naturally. I am ready to explain any topic step-by-step!';
    femaleSpeech.testVoice(phrase);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[700px] h-[86vh] max-h-[780px] rounded-[36px] p-[2px] animated-shimmer-border shadow-[0_25px_90px_rgba(37,99,235,0.45)] flex flex-col overflow-hidden"
      >
        <div className={`w-full h-full rounded-[34px] flex flex-col overflow-hidden transition-colors ${
          isDark ? 'bg-[#0b1322] text-white' : 'bg-white text-[#0f172a]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full animate-fluid-aurora flex items-center justify-center text-white shadow-md shadow-pink-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-1.5 leading-tight">
                  <span>AURA Assistant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300">
                    Live Realistic Voice
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  लाइव वॉइस में पूछें और उत्तर सुनें
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => {
                  const next = speechLanguage === 'hi-IN' ? 'en-US' : 'hi-IN';
                  setSpeechLanguage(next);
                  if (isListening) {
                    stopListening();
                    setTimeout(() => startListening(), 200);
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-100"
                title="Switch Speech Recognition Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{speechLanguage === 'hi-IN' ? 'हिंदी' : 'English'}</span>
              </button>

              {/* Test Audio Button */}
              <button
                onClick={handleTestVoice}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer"
                title="Test Realistic Voice Output"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Test Voice</span>
              </button>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
                title="Close Assistant (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Interactive Speech Orb & Controls */}
          <div className="py-4 px-6 flex flex-col items-center justify-center shrink-0 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 via-purple-50/20 to-transparent dark:from-blue-950/25 dark:via-purple-950/10">
            <div className="relative flex items-center justify-center my-1.5">
              <div className={`absolute w-36 h-36 rounded-full blur-xl transition-all duration-500 opacity-60 ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 via-pink-500 to-indigo-500 scale-125 animate-pulse'
                  : isSpeaking
                  ? 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 scale-120 animate-fluid-aurora'
                  : isThinking
                  ? 'bg-gradient-to-r from-amber-400 to-violet-500 animate-spin scale-110'
                  : 'bg-gradient-to-r from-blue-400 to-purple-400 scale-100'
              }`} />

              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative w-22 h-22 rounded-full flex flex-col items-center justify-center text-white cursor-pointer shadow-2xl transition-all duration-300 active:scale-95 z-10 ${
                  isListening 
                    ? 'bg-gradient-to-tr from-red-500 to-rose-600 ring-4 ring-red-400/50 scale-105'
                    : isThinking
                    ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 ring-4 ring-amber-400/40'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-pink-500 to-indigo-600 ring-4 ring-pink-400/50'
                    : 'animate-fluid-aurora ring-4 ring-white/40 dark:ring-slate-700/60 hover:scale-105'
                }`}
                title={isListening ? 'रोकें / Stop Listening' : 'बोलें / Tap to Speak'}
              >
                {isListening ? (
                  <Mic className="w-8 h-8 animate-pulse text-white" />
                ) : isThinking ? (
                  <Zap className="w-8 h-8 animate-spin text-white" />
                ) : isSpeaking ? (
                  <Volume2 className="w-8 h-8 animate-pulse text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
                <span className="text-[10px] font-extrabold tracking-wide mt-1">
                  {isListening ? 'Listening...' : isThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Tap to Speak'}
                </span>
              </button>
            </div>

            {/* Status and Equalizer Wave */}
            <div className="flex items-center gap-2 mt-2">
              {isSpeaking && (
                <div className="flex items-center gap-1 h-4">
                  <span className="w-1 bg-pink-500 rounded-full animate-sound-wave-1" />
                  <span className="w-1 bg-pink-500 rounded-full animate-sound-wave-2" />
                  <span className="w-1 bg-pink-500 rounded-full animate-sound-wave-3" />
                  <span className="w-1 bg-pink-500 rounded-full animate-sound-wave-4" />
                </div>
              )}
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isListening 
                  ? 'सुन रही हूँ... बोलिए'
                  : isThinking 
                  ? 'उत्तर तैयार कर रही हूँ...'
                  : isSpeaking 
                  ? 'बोल रही हूँ...'
                  : 'माइक दबाकर प्रश्न पूछें'}
              </div>
            </div>

            {speechError && (
              <div className="mt-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            {transcript && (
              <div className="mt-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#16233d] border border-blue-200 dark:border-blue-900 shadow-sm max-w-lg w-full text-center animate-in fade-in duration-150">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                  आपने पूछा (You asked):
                </span>
                <span className="text-sm font-semibold italic text-slate-800 dark:text-slate-100">
                  "{transcript}"
                </span>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleProcessUserSpeech(transcript)}
                    className="px-3.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
                  >
                    भेजें (Send Now)
                  </button>
                  <button
                    onClick={() => setTranscript('')}
                    className="px-2 py-1 text-[11px] text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    रद्द करें (Cancel)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversation History Stream */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3.5">
            {conversationHistory.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-slate-400">
                  {item.role === 'user' ? 'You' : 'AURA'}
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[88%] text-[13.5px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                    item.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : isDark
                      ? 'bg-[#15233d] border border-[#233555] text-slate-100 rounded-tl-sm'
                      : 'bg-slate-100 text-[#152238] rounded-tl-sm'
                  }`}
                >
                  {item.text}
                </div>
                {item.role === 'aura' && (
                  <button
                    onClick={() => femaleSpeech.speak(item.text)}
                    className="mt-1 px-2 py-0.5 text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>फिर से सुनें (Listen Again)</span>
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Questions Chips */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0e172a] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                महत्वपूर्ण प्रश्न (Quick Questions):
              </span>
              <button
                onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <span>स्वचालित आवाज़:</span>
                <span className={`font-bold ${autoSpeakEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {autoSpeakEnabled ? 'चालू (ON)' : 'बंद (OFF)'}
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "कूलॉम का नियम समझाइए",
                "क्लास 12 में 90% कैसे लाएं?",
                "DNA की द्विकुंडली संरचना क्या है?",
                "राउल्ट का नियम क्या है?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleProcessUserSpeech(suggestion)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    isDark
                      ? 'border-[#223555] bg-[#16233d] text-blue-300 hover:border-blue-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-xs'
                  }`}
                >
                  ⚡ {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Integrated Typed Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b1322] shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (typedInput.trim()) {
                  handleProcessUserSpeech(typedInput);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="यहाँ टाइप करें या माइक दबाकर बोलें..."
                className={`flex-1 px-4 py-2 rounded-2xl border text-xs outline-none transition-colors ${
                  isDark 
                    ? 'bg-[#141e33] border-[#223555] text-white placeholder:text-slate-500 focus:border-blue-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer shrink-0 ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600'
                }`}
                title="Speak"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!typedInput.trim() || isThinking}
                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
