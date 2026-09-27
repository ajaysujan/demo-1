import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  MessageSquare, 
  Atom, 
  FlaskConical, 
  Dna, 
  Ruler, 
  BookText, 
  FileSignature, 
  ClipboardList, 
  Star, 
  BarChart2, 
  Calendar, 
  GraduationCap, 
  Settings as SettingsIcon, 
  Plus, 
  Moon, 
  Sun, 
  LogOut, 
  Paperclip, 
  ArrowUp, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Image as ImageIcon,
  Mic,
  Brain,
  Search,
  X,
  Trash2,
  Maximize2,
  FileCheck,
  Headphones,
  Sliders,
  History,
  ChevronDown,
  ChevronRight,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react';
import { Message } from '../types';
import { SUBJECTS, SubjectDetails } from '../data/curriculum';
import { femaleSpeech } from '../utils/speech';
import { marked } from 'marked';
import { ImageCreatorModal } from './ImageCreatorModal';
import { QuizModal } from './QuizModal';
import { SubjectModal } from './SubjectModal';
import { TeacherModeModal } from './TeacherModeModal';
import { AIAssistantOverlay } from './AIAssistantOverlay';
import { SettingsModal } from './SettingsModal';

interface DashboardProps {
  username: string;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  initialQuestion?: string;
}

interface AttachedFile {
  name: string;
  size: string;
  url: string;
  type: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

// Ensure marked uses breaks and standard GFM
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const Dashboard: React.FC<DashboardProps> = ({
  username,
  onLogout,
  isDark,
  onToggleTheme,
  initialQuestion,
}) => {
  const [currentUsername, setCurrentUsername] = useState(username);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deepThinkActive, setDeepThinkActive] = useState(false);
  const [smartSearchActive, setSmartSearchActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState<boolean>(true);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});

  // Chat History state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('aura_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(true);

  // Layered Tool Popover state
  const [isChatLayersOpen, setIsChatLayersOpen] = useState(false);

  // AI Assistant Overlay State
  const [isVoiceAssistantOverlayOpen, setIsVoiceAssistantOverlayOpen] = useState(false);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectDetails | null>(null);

  // Active Navigation in Sidebar
  const [activeTab, setActiveTab] = useState<'home' | 'ask' | string>('home');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionInstanceRef = useRef<any>(null);
  const micTranscriptRef = useRef<string>('');

  // Sync speech engine speaking state
  useEffect(() => {
    const unsub = femaleSpeech.subscribe((isSpeaking) => {
      if (!isSpeaking) {
        setSpeakingMessageId(null);
      }
    });
    return () => unsub();
  }, []);

  // Handle initial prompt from landing page
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSend(initialQuestion.trim());
    }
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Robust Speech Recognition for Chat input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningMic(true);
        micTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        micTranscriptRef.current = interim;
        setInputValue(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
        const finalSpoken = micTranscriptRef.current.trim();
        if (finalSpoken) {
          setTimeout(() => {
            handleSend(finalSpoken);
          }, 350);
        }
      };

      speechRecognitionInstanceRef.current = recognition;
    }

    return () => {
      if (speechRecognitionInstanceRef.current) {
        try {
          speechRecognitionInstanceRef.current.stop();
        } catch {}
      }
    };
  }, [currentLanguage]);

  const openAIAssistantModal = () => {
    femaleSpeech.playAudioTone();
    setIsVoiceAssistantOverlayOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: url,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (speakingMessageId === id) {
      femaleSpeech.stop();
      setSpeakingMessageId(null);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue;
    if ((!textToSend.trim() && !attachedFile) || isLoading) return;

    let messageText = textToSend.trim();
    if (attachedFile && !messageText) {
      messageText = `Please analyze this attached file (${attachedFile.name}) and explain the key educational concepts.`;
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: messageText,
      timestamp: Date.now(),
      imageUrl: attachedFile?.type.startsWith('image/') ? attachedFile.url : undefined,
      deepThink: deepThinkActive,
      smartSearch: smartSearchActive,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    micTranscriptRef.current = '';
    setAttachedFile(null);
    setIsLoading(true);
    setIsChatLayersOpen(false);

    const auraPlaceholderId = `aura_${Date.now()}`;
    const auraMessage: Message = {
      id: auraPlaceholderId,
      type: 'aura',
      text: '',
      timestamp: Date.now(),
      deepThink: deepThinkActive,
      smartSearch: smartSearchActive,
    };
    setMessages((prev) => [...prev, auraMessage]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageText,
          history: messages.slice(-6),
          deepThink: deepThinkActive,
          smartSearch: smartSearchActive,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error('Chat API error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === auraPlaceholderId
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                  );
                }
              } catch {}
            }
          }
        }
      }

      const settings = femaleSpeech.getSettings();
      if (settings.autoSpeak && accumulatedText) {
        setSpeakingMessageId(auraPlaceholderId);
        femaleSpeech.speak(accumulatedText, () => {
          setSpeakingMessageId(null);
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === auraPlaceholderId
            ? {
                ...msg,
                text: 'उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = (text: string, id: string) => {
    if (speakingMessageId === id) {
      femaleSpeech.stop();
      setSpeakingMessageId(null);
    } else {
      femaleSpeech.stop();
      setSpeakingMessageId(id);
      femaleSpeech.speak(text, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackMap((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined : type,
    } as any));
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AURA Response',
          text,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(text);
    setCopiedId('shared');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto-save conversation to Chat History
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const firstUserMsg = messages.find((m) => m.type === 'user');
    const sessionTitle = firstUserMsg?.text
      ? firstUserMsg.text.replace(/\n.*/s, '').trim().slice(0, 32) + (firstUserMsg.text.length > 32 ? '...' : '')
      : 'New Chat';

    const sessionId = currentSessionId || `session_${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }

    setChatSessions((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === sessionId);
      const updatedSession: ChatSession = {
        id: sessionId,
        title: sessionTitle,
        messages: messages,
        updatedAt: Date.now(),
      };

      let nextSessions: ChatSession[];
      if (existingIndex >= 0) {
        nextSessions = [...prev];
        nextSessions[existingIndex] = updatedSession;
      } else {
        nextSessions = [updatedSession, ...prev];
      }
      try {
        localStorage.setItem('aura_chat_sessions', JSON.stringify(nextSessions));
      } catch {}
      return nextSessions;
    });
  }, [messages, isLoading]);

  const handleNewChat = () => {
    femaleSpeech.stop();
    setSpeakingMessageId(null);
    setCurrentSessionId(null);
    setMessages([]);
    setInputValue('');
    micTranscriptRef.current = '';
    setAttachedFile(null);
    setIsChatLayersOpen(false);
    setActiveTab('home');
    textareaRef.current?.focus();
  };

  const handleLoadSession = (session: ChatSession) => {
    femaleSpeech.stop();
    setSpeakingMessageId(null);
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setActiveTab('home');
    setIsChatLayersOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions((prev) => {
      const nextSessions = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem('aura_chat_sessions', JSON.stringify(nextSessions));
      } catch {}
      return nextSessions;
    });
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  const handleClearAllHistory = () => {
    setChatSessions([]);
    try {
      localStorage.removeItem('aura_chat_sessions');
    } catch {}
    handleNewChat();
  };

  const handleToggleMic = () => {
    if (isListeningMic) {
      try {
        speechRecognitionInstanceRef.current?.stop();
      } catch {}
      setIsListeningMic(false);
    } else {
      femaleSpeech.stop();
      femaleSpeech.playAudioTone();
      setInputValue('');
      micTranscriptRef.current = '';
      try {
        speechRecognitionInstanceRef.current?.start();
      } catch {
        try {
          speechRecognitionInstanceRef.current?.stop();
          setTimeout(() => {
            speechRecognitionInstanceRef.current?.start();
          }, 200);
        } catch {}
      }
    }
  };

  const handleInsertGeneratedImage = (imageUrl: string, promptText: string) => {
    const imageMessage: Message = {
      id: `img_${Date.now()}`,
      type: 'aura',
      text: `### 🖼️ Illustration & Diagram:\n*Prompt: "${promptText}"*\n\nPractice drawing and studying this diagram for your board examination:`,
      imageUrl: imageUrl,
      isImage: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, imageMessage]);
  };

  const handleOverlayConversationAdded = (query: string, reply: string) => {
    const uMsg: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: query,
      timestamp: Date.now(),
    };
    const aMsg: Message = {
      id: `aura_${Date.now() + 1}`,
      type: 'aura',
      text: reply,
      timestamp: Date.now() + 1,
    };
    setMessages((prev) => [...prev, uMsg, aMsg]);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden select-none transition-colors duration-200 ${
      isDark ? 'bg-[#0f172a] text-[#f1f5f9]' : 'bg-[#f4f7fb] text-[#152238]'
    }`}>
      {/* Hidden file input for paperclip */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.txt,.doc,.docx"
      />

      {/* SIDEBAR: "+ New Chat" directly under Home */}
      <aside className={`w-[245px] shrink-0 border-r flex flex-col justify-between py-4 px-3 transition-colors ${
        isDark ? 'bg-[#0b1322] border-[#1e293b]' : 'bg-white border-[#dfe6ef]'
      }`}>
        <div className="flex flex-col overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-[#315efb]" fill="none">
                <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="3" />
                <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
                <circle cx="20" cy="20" r="4.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="text-[19px] font-extrabold tracking-tight leading-none text-[#152238] dark:text-white">
                AURA
              </div>
              <div className="text-[10px] text-[#66758a] dark:text-[#94a3b8] mt-0.5 font-medium">
                School Learning System
              </div>
            </div>
          </div>

          {/* MAIN SECTION */}
          <div className="text-[11px] font-bold text-[#8793a5] uppercase tracking-wider px-3 py-1.5">
            Main
          </div>
          <div className="space-y-1 mb-4">
            {/* 1. Home */}
            <button
              onClick={() => {
                setActiveTab('home');
                handleNewChat();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-semibold transition-all cursor-pointer ${
                activeTab === 'home' && messages.length === 0
                  ? 'bg-[#edf2ff] dark:bg-[#1e2e4f] text-[#315efb] dark:text-blue-400'
                  : 'text-[#475569] dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 text-[#315efb]" />
              <span>Home</span>
            </button>

            {/* 2. "+ New Chat" RIGHT UNDER HOME */}
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-bold text-[#315efb] dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Chat</span>
            </button>

            {/* 3. Chat History */}
            <div className="pt-1.5">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#8793a5] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="flex items-center gap-1.5 hover:text-[#315efb] transition-colors cursor-pointer"
                  title="Toggle Chat History"
                >
                  <History className="w-3.5 h-3.5 text-[#315efb]" />
                  <span>History</span>
                  {isHistoryExpanded ? (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  ) : (
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  )}
                </button>
                {chatSessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-normal transition-colors cursor-pointer"
                    title="Clear All Chat History"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Expandable Chat History List */}
              {isHistoryExpanded && (
                <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                  {chatSessions.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                      No saved chats yet
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12px] transition-all cursor-pointer ${
                          currentSessionId === session.id
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-[#315efb] dark:text-blue-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => handleLoadSession(session)}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1.5">
                          <MessageSquare className="w-3 h-3 shrink-0 opacity-70" />
                          <span className="truncate">{session.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-all cursor-pointer"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SUBJECTS SECTION */}
          <div className="text-[11px] font-bold text-[#8793a5] uppercase tracking-wider px-3 py-1.5">
            Subjects
          </div>
          <div className="space-y-0.5 mb-4">
            <button
              onClick={() => {
                setSelectedSubject(SUBJECTS.physics);
                setActiveTab('physics');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <Atom className="w-4 h-4 text-indigo-500" />
              <span>Physics</span>
            </button>
            <button
              onClick={() => {
                setSelectedSubject(SUBJECTS.chemistry);
                setActiveTab('chemistry');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-teal-500" />
              <span>Chemistry</span>
            </button>
            <button
              onClick={() => {
                setSelectedSubject(SUBJECTS.biology);
                setActiveTab('biology');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <Dna className="w-4 h-4 text-emerald-500" />
              <span>Biology</span>
            </button>
            <button
              onClick={() => {
                setSelectedSubject(SUBJECTS.mathematics);
                setActiveTab('mathematics');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-blue-500" />
              <span>Mathematics</span>
            </button>
            <button
              onClick={() => {
                setSelectedSubject(SUBJECTS.hindi);
                setActiveTab('hindi');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <BookText className="w-4 h-4 text-amber-500" />
              <span>Hindi</span>
            </button>
            <button
              onClick={() => {
                setSelectedSubject(SUBJECTS.english);
                setActiveTab('english');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <FileSignature className="w-4 h-4 text-violet-500" />
              <span>English</span>
            </button>
          </div>

          {/* TOOLS & EXAMS */}
          <div className="text-[11px] font-bold text-[#8793a5] uppercase tracking-wider px-3 py-1.5">
            Tools & Exams
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-purple-500" />
              <span>Test (MCQ & Quiz)</span>
            </button>
            <button
              onClick={() => {
                handleSend('Class 12 बोर्ड परीक्षा के लिए सबसे महत्वपूर्ण 5-स्टार प्रश्न और उनके विस्तृत उत्तर समझाएं।');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span>Important Questions</span>
            </button>
            <button
              onClick={() => {
                handleSend('मेरी अध्ययन प्रगति का विश्लेषण करें और बताएं कि किन अध्यायों में अधिक अभ्यास की आवश्यकता है।');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-cyan-500" />
              <span>Progress</span>
            </button>
            <button
              onClick={() => {
                handleSend('Class 12 Board Exam 2026 समय सारणी एवं अंतिम 30 दिनों की सटीक रिवीजन रणनीति बताएं।');
              }}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Exam</span>
            </button>
            <button
              onClick={() => setIsTeacherModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-rose-500" />
              <span>Teacher Mode</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#edf2ff] dark:hover:bg-[#1e2e4f] hover:text-[#315efb] transition-all cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="pt-3 border-t border-[#dfe6ef] dark:border-[#1e293b] px-3">
          <div className="text-[11px] font-medium text-[#8793a5] dark:text-[#64748b] leading-tight">
            AURA • Smart Learning<br />Knowledge • Learn • Grow
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* TOPBAR: Cleaned up and minimal */}
        <header className={`h-[68px] shrink-0 border-b flex items-center justify-between px-6 transition-colors ${
          isDark ? 'bg-[#0b1322] border-[#1e293b]' : 'bg-white border-[#dfe6ef]'
        }`}>
          {/* Top Title Left */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#315efb] animate-pulse" />
            <span className="font-extrabold text-[15px] text-[#152238] dark:text-white">
              AURA
            </span>
            <span className="text-[#8793a5] text-[13.5px] font-medium hidden sm:inline">
              • Personal Study Companion
            </span>
          </div>

          {/* Top Actions Right: Minimalist & Clean */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWideLayout(!isWideLayout)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isWideLayout
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
                  : isDark
                  ? 'border-[#2a3850] bg-[#141d2d] text-slate-300 hover:bg-[#1d2940]'
                  : 'border-[#dfe6ef] bg-white text-[#152238] hover:bg-slate-50'
              }`}
              title={isWideLayout ? 'Wide View Active (Click for standard view)' : 'Enable Full Width Widescreen View'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'border-[#2a3850] bg-[#141d2d] text-slate-300 hover:bg-[#1d2940]' 
                  : 'border-[#dfe6ef] bg-white text-[#152238] hover:bg-slate-50'
              }`}
              title="Settings (Languages, Realistic Voice, Tools)"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'border-[#2a3850] bg-[#141d2d] text-amber-300 hover:bg-[#1d2940]' 
                  : 'border-[#dfe6ef] bg-white text-[#152238] hover:bg-slate-50'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onLogout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer ${
                isDark ? 'border-[#2a3850] bg-[#141d2d]' : 'border-[#dfe6ef] bg-white'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* CHAT MESSAGES CONTAINER / HOME VIEW */}
        <main className="flex-1 overflow-y-auto min-h-0 relative">
          {messages.length === 0 ? (
            /* Home / Initial Empty State */
            <div className={`h-full flex flex-col items-center justify-center p-6 mx-auto text-center ${isWideLayout ? 'w-full max-w-4xl' : 'max-w-2xl'}`}>
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute w-28 h-28 rounded-full bg-blue-500/15 blur-2xl animate-pulse" />
                <svg viewBox="0 0 40 40" className="w-16 h-16 text-[#315efb] relative z-10" fill="none">
                  <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" opacity="0.8" />
                  <circle cx="20" cy="20" r="4.5" fill="currentColor" />
                </svg>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#152238] dark:text-white mb-2">
                What would you like to explore today?
              </h1>
              <p className="text-sm text-[#8793a5] dark:text-[#94a3b8] mb-8 max-w-md">
                Ask any question from Physics, Chemistry, Biology, Maths or practice important board exam topics.
              </p>

              {/* Central Floating Composer Card */}
              <div className={`relative w-full rounded-2xl border p-4 sm:p-5 transition-all shadow-[0_12px_45px_rgba(35,65,120,0.06)] ${
                isDark 
                  ? 'bg-[#111c33] border-[#223555] shadow-[0_12px_45px_rgba(0,0,0,0.3)]' 
                  : 'bg-white border-[#d8e2ee]'
              }`}>
                {/* File Attachment Preview Bar */}
                {attachedFile && (
                  <div className="mb-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {attachedFile.type.startsWith('image/') ? (
                        <img src={attachedFile.url} alt="attached" className="w-8 h-8 rounded-lg object-cover shrink-0 border" />
                      ) : (
                        <FileCheck className="w-6 h-6 text-blue-600 shrink-0" />
                      )}
                      <div className="truncate text-left">
                        <div className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{attachedFile.name}</div>
                        <div className="text-[10px] text-slate-500">{attachedFile.size}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-bold transition-all cursor-pointer"
                      title="Remove File"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={3}
                  placeholder={isListeningMic ? "Listening to your voice..." : "Send a message to AURA or speak with 🎙️..."}
                  className={`w-full bg-transparent text-[15px] outline-none resize-none transition-colors text-left ${
                    isListeningMic ? 'placeholder:text-red-500 font-semibold' : 'placeholder:text-[#8793a5] dark:placeholder:text-[#64748b]'
                  }`}
                />

                {isListeningMic && (
                  <div className="flex items-center gap-2 py-1 text-xs text-red-500 font-bold animate-pulse text-left">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>Listening... speak clearly into your microphone (auto-sends on finish)</span>
                  </div>
                )}

                {/* EXPANDABLE TOOL LAYERS POPOVER */}
                {isChatLayersOpen && (
                  <div className="absolute bottom-full left-4 mb-2 z-40 w-72 sm:w-84 rounded-2xl border shadow-2xl p-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl bg-white/95 dark:bg-[#0e172a]/95 border-slate-200 dark:border-slate-800 text-left">
                    <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Tools & Layers</span>
                      <button 
                        type="button"
                        onClick={() => setIsChatLayersOpen(false)}
                        className="p-1 hover:text-red-500 rounded-lg cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {/* Layer 1: Create Image */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatLayersOpen(false);
                          setIsImageModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>चित्र बनाएं (Create Diagram / Image)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">L1</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">Generate diagrams & formulas</div>
                        </div>
                      </button>

                      {/* Layer 2: Live Voice Assistant */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatLayersOpen(false);
                          openAIAssistantModal();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-300 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>लाइव वॉइस असिस्टेंट (Live Voice Assistant)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-bold">L2</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">Direct spoken questions & realistic voice</div>
                        </div>
                      </button>

                      {/* Layer 3: Attach File / Photo */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatLayersOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Paperclip className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>फाइल जोड़ें (Attach File / Notes / Photo)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">L3</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">Upload board papers or question photos</div>
                        </div>
                      </button>

                      {/* Layer 4: DeepThink Toggle */}
                      <button
                        type="button"
                        onClick={() => setDeepThinkActive(!deepThinkActive)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                          deepThinkActive 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300' 
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>गहन चिंतन (DeepThink Mode)</span>
                            <span className={`text-[10px] font-bold ${deepThinkActive ? 'text-blue-600' : 'text-slate-400'}`}>
                              {deepThinkActive ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">Rigorous mathematical proofs</div>
                        </div>
                      </button>

                      {/* Layer 5: Smart Search Toggle */}
                      <button
                        type="button"
                        onClick={() => setSmartSearchActive(!smartSearchActive)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                          smartSearchActive 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300' 
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>स्मार्ट सर्च (Smart Search)</span>
                            <span className={`text-[10px] font-bold ${smartSearchActive ? 'text-blue-600' : 'text-slate-400'}`}>
                              {smartSearchActive ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">Verified board syllabus references</div>
                        </div>
                      </button>

                      {/* Layer 6: Teacher Mentor Mode */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatLayersOpen(false);
                          setIsTeacherModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>टीचर मेंटर मोड (Teacher Mentor Mode)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold">L6</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">1-on-1 personalized study plan</div>
                        </div>
                      </button>

                      {/* Layer 7: Practice MCQ Test */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatLayersOpen(false);
                          setIsQuizModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <ClipboardList className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>ऑब्जेक्टिव टेस्ट (MCQ Practice Test)</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">L7</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">Class 12 objective questions</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Control Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9] dark:border-[#1a2844] mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChatLayersOpen(!isChatLayersOpen)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                        isChatLayersOpen
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-[#dfe6ef] dark:border-[#223555] bg-[#f8fafd] dark:bg-[#16233d] text-[#315efb] dark:text-blue-300 hover:border-blue-400'
                      }`}
                    >
                      <Plus className={`w-3.5 h-3.5 transition-transform ${isChatLayersOpen ? 'rotate-45' : ''}`} />
                      <span>Tools & Options</span>
                    </button>

                    {deepThinkActive && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        DeepThink Active
                      </span>
                    )}
                    {smartSearchActive && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        Smart Search Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleMic}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isListeningMic 
                          ? 'text-white bg-red-600 animate-pulse ring-4 ring-red-300' 
                          : 'text-[#64748b] hover:text-[#315efb] hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isListeningMic ? 'Stop Recording' : 'Speak into Microphone'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() && !attachedFile}
                      className="w-8 h-8 rounded-full bg-[#315efb] disabled:opacity-40 hover:bg-[#2049d9] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                      title="Send message"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-xl">
                {[
                  "Explain Coulomb's Law and its derivation",
                  "Raoult's Law and its mathematical formula",
                  'Structure of DNA double helix model',
                  'Important integration formulas for Class 12',
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                      isDark 
                        ? 'border-[#243555] bg-[#111c33] text-slate-300 hover:border-blue-500' 
                        : 'border-[#dfe6ef] bg-white text-[#475569] hover:bg-blue-50 hover:text-blue-700 shadow-xs'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* CONVERSATION STREAM (Borderless, smooth modern LLM interface as in cht 5.png) */
            <div className={`p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-7 ${isWideLayout ? 'max-w-[1400px]' : 'max-w-[920px]'}`}>
              {messages.map((msg) => (
                <div key={msg.id} className="w-full group">
                  {msg.type === 'user' ? (
                    /* User message: soft rounded pill on right, no harsh blue rectangle */
                    <div className="flex justify-end w-full">
                      <div className="max-w-[85%] sm:max-w-2xl rounded-3xl px-5 py-3 text-[14.5px] sm:text-[15px] leading-relaxed font-normal bg-[#e8f0fe] dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f1f5f9] shadow-xs">
                        {msg.imageUrl && (
                          <div className="mb-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={msg.imageUrl} alt="attached" className="max-h-60 rounded-2xl object-cover" />
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ) : (
                    /* AI message: pure smooth borderless typography directly on canvas */
                    <div className="w-full flex flex-col gap-1 text-left py-1">
                      {msg.imageUrl && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-xl">
                          <img
                            src={msg.imageUrl}
                            alt="educational visual"
                            className="w-full max-h-80 object-contain bg-slate-950/10 cursor-pointer"
                            onClick={() => setPreviewImage(msg.imageUrl || null)}
                          />
                        </div>
                      )}

                      <div
                        className="chat-markdown-render w-full text-[15px] sm:text-[15.5px] leading-[1.75] text-[#1f2937] dark:text-[#f3f4f6]"
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(msg.text || (isLoading ? '...' : '')),
                        }}
                      />

                      {/* Thinking loader */}
                      {!msg.text && isLoading && (
                        <div className="flex items-center gap-2 py-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                            AURA is thinking...
                          </span>
                        </div>
                      )}

                      {/* Minimalist Ghost Action Bar (Exact match to cht 5.png) */}
                      {msg.text && (
                        <div className="flex items-center gap-1 mt-2 text-slate-400 dark:text-slate-500">
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleShare(msg.text)}
                            className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              const lastUser = [...messages].reverse().find((m) => m.type === 'user');
                              if (lastUser) handleSend(lastUser.text);
                            }}
                            className="p-1.5 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                              feedbackMap[msg.id] === 'up' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                              feedbackMap[msg.id] === 'down' ? 'text-rose-600 dark:text-rose-400' : 'hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Bad response"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleSpeak(msg.text, msg.id)}
                            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                              speakingMessageId === msg.id ? 'text-pink-600 dark:text-pink-400' : 'hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title={speakingMessageId === msg.id ? 'Stop voice' : 'Listen aloud'}
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-4 h-4 text-pink-500 animate-pulse" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="p-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Create visual diagram"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-auto opacity-40 hover:opacity-100"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* BOTTOM FIXED COMPOSER */}
        {messages.length > 0 && (
          <div className={`shrink-0 p-4 w-full mx-auto relative ${isWideLayout ? 'max-w-[1400px]' : 'max-w-[920px]'}`}>
            {/* Scroll-To-Bottom Floating Button (as in cht 5.png) */}
            <button
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 z-20"
              title="Scroll to bottom"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {/* Tool Layers Popover */}
            {isChatLayersOpen && (
              <div className="absolute bottom-full left-4 mb-2 z-40 w-72 sm:w-84 rounded-2xl border shadow-2xl p-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl bg-white/95 dark:bg-[#0e172a]/95 border-slate-200 dark:border-slate-800 text-left">
                <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Tools & Layers</span>
                  <button 
                    type="button"
                    onClick={() => setIsChatLayersOpen(false)}
                    className="p-1 hover:text-red-500 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChatLayersOpen(false);
                      setIsImageModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>चित्र बनाएं (Create Diagram / Image)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">L1</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Generate science charts & formulas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChatLayersOpen(false);
                      openAIAssistantModal();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-300 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Headphones className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>लाइव वॉइस असिस्टेंट (Live Voice Assistant)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-bold">L2</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Direct spoken questions & realistic voice</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChatLayersOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Paperclip className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>फाइल जोड़ें (Attach File / Notes / Photo)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">L3</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Upload board papers or question photos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeepThinkActive(!deepThinkActive)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                      deepThinkActive 
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>गहन चिंतन (DeepThink Mode)</span>
                        <span className={`text-[10px] font-bold ${deepThinkActive ? 'text-blue-600' : 'text-slate-400'}`}>
                          {deepThinkActive ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Rigorous mathematical proofs</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSmartSearchActive(!smartSearchActive)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                      smartSearchActive 
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>स्मार्ट सर्च (Smart Search)</span>
                        <span className={`text-[10px] font-bold ${smartSearchActive ? 'text-blue-600' : 'text-slate-400'}`}>
                          {smartSearchActive ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Verified board syllabus references</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChatLayersOpen(false);
                      setIsTeacherModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>टीचर मेंटर मोड (Teacher Mentor Mode)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold">L6</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">1-on-1 personalized study plan</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChatLayersOpen(false);
                      setIsQuizModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>ऑब्जेक्टिव टेस्ट (MCQ Practice Test)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">L7</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">Class 12 objective questions</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className={`rounded-2xl border p-3.5 transition-all shadow-[0_10px_35px_rgba(35,65,120,0.08)] ${
              isDark 
                ? 'bg-[#111c33] border-[#223555]' 
                : 'bg-white border-[#d8e2ee]'
            }`}>
              {attachedFile && (
                <div className="mb-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {attachedFile.type.startsWith('image/') ? (
                      <img src={attachedFile.url} alt="attached" className="w-7 h-7 rounded-lg object-cover shrink-0 border" />
                    ) : (
                      <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">{attachedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-bold transition-all cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChatLayersOpen(!isChatLayersOpen)}
                  className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    isChatLayersOpen
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Tools & Layers (Create Image, Live Voice, File Upload, etc.)"
                >
                  <Plus className={`w-4 h-4 transition-transform ${isChatLayersOpen ? 'rotate-45' : ''}`} />
                </button>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder={isListeningMic ? "Listening..." : "Send a message to AURA..."}
                  className="flex-1 bg-transparent text-[14.5px] outline-none resize-none px-2 py-1 max-h-32 placeholder:text-[#8793a5] dark:placeholder:text-[#64748b]"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      isListeningMic ? 'text-white bg-red-600 animate-pulse ring-4 ring-red-300' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Voice Input (Speech Recognition)"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={(!inputValue.trim() && !attachedFile) || isLoading}
                    className="w-8 h-8 rounded-full bg-[#315efb] hover:bg-[#2049d9] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {(deepThinkActive || smartSearchActive) && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {deepThinkActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      DeepThink ON
                    </span>
                  )}
                  {smartSearchActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      Smart Search ON
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl p-4 border border-slate-700 shadow-2xl flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">Image Preview</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
            <img
              src={previewImage}
              alt="fullscreen preview"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* MODALS */}
      <AIAssistantOverlay
        isOpen={isVoiceAssistantOverlayOpen}
        onClose={() => setIsVoiceAssistantOverlayOpen(false)}
        onSendQueryToMainChat={handleOverlayConversationAdded}
        isDark={isDark}
      />

      <ImageCreatorModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertToChat={handleInsertGeneratedImage}
        isDark={isDark}
      />

      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onAskAuraExplain={(prompt: string) => {
          setIsQuizModalOpen(false);
          handleSend(prompt);
        }}
        isDark={isDark}
      />

      <SubjectModal
        subject={selectedSubject}
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        onSelectPrompt={(prompt) => {
          setSelectedSubject(null);
          handleSend(prompt);
        }}
        isDark={isDark}
      />

      <TeacherModeModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onStartSession={(prompt) => {
          setIsTeacherModalOpen(false);
          handleSend(prompt);
        }}
        isDark={isDark}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        username={currentUsername}
        onUpdateUsername={setCurrentUsername}
        onClearChatHistory={handleNewChat}
        currentLanguage={currentLanguage}
        onChangeLanguage={setCurrentLanguage}
        onOpenTeacherMode={() => setIsTeacherModalOpen(true)}
        onOpenQuiz={() => setIsQuizModalOpen(true)}
        onOpenImageCreator={() => setIsImageModalOpen(true)}
      />
    </div>
  );
};
