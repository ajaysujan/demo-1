import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Download, RefreshCw, X, Wand2, ArrowLeft } from 'lucide-react';

interface ImageCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat?: (imageUrl: string, prompt: string) => void;
  isDark: boolean;
}

export const ImageCreatorModal: React.FC<ImageCreatorModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
  isDark,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const samplePrompts = [
    'Electric field lines between positive and negative charges 3D diagram',
    'Human Heart anatomy detailed educational diagram with labeled chambers',
    'Structure of DNA double helix glowing molecular model',
    'Electrochemical cell with anode cathode and salt bridge scientific illustration',
    'Galileo telescope ray optics diagram showing focal points',
  ];

  const handleGenerate = async (targetPrompt?: string) => {
    const textToUse = targetPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToUse }),
      });

      if (!res.ok) {
        throw new Error('Image generation failed on server');
      }

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setEnhancedPrompt(data.enhancedPrompt || textToUse);
      } else {
        throw new Error('No image returned');
      }
    } catch (err: any) {
      console.error(err);
      setError('चित्र निर्माण में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `AURA_AI_Generated_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[700px] rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all max-h-[90vh] overflow-y-auto ${
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">AI डायग्राम व चित्र स्टूडियो (AURA Visual Studio)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              बोर्ड परीक्षा के लिए आवश्यक नामांकित वैज्ञानिक चित्र, आरेख एवं सूत्र चार्ट बनाएं
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            क्या चित्र बनाना चाहते हैं? (Prompt)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Electric dipole field lines 3D diagram..."
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                isDark 
                  ? 'bg-[#0b1322] border-[#293d63] focus:border-blue-500' 
                  : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-600'
              }`}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>बन रहा है...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>चित्र बनाएं</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick prompt suggestions */}
        <div className="mb-5">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            महत्वपूर्ण बोर्ड विषय (Click to Try):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(p);
                  handleGenerate(p);
                }}
                className={`text-[11.5px] px-2.5 py-1 rounded-lg border text-left transition-all ${
                  isDark 
                    ? 'border-[#293d63] bg-[#0e172a] text-blue-300 hover:border-blue-500' 
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Display Area */}
        <div className={`relative min-h-[300px] rounded-2xl border flex flex-col items-center justify-center p-4 overflow-hidden transition-all ${
          isDark ? 'bg-[#0b1322] border-[#223555]' : 'bg-slate-50 border-slate-200'
        }`}>
          {isGenerating && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                AURA AI चित्र तैयार कर रहा है...
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                Gemini उच्च गुणवत्ता वाले वैज्ञानिक विवरण जोड़ रहा है
              </p>
            </div>
          )}

          {!isGenerating && generatedImage && (
            <div className="w-full flex flex-col items-center">
              <div className="relative group max-w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                <img
                  src={generatedImage}
                  alt={enhancedPrompt || prompt}
                  className="max-h-[360px] w-auto object-contain mx-auto"
                />
              </div>

              {enhancedPrompt && (
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center italic max-w-md">
                  "{enhancedPrompt}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-xs transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड करें (HD)</span>
                </button>
                {onInsertToChat && (
                  <button
                    onClick={() => {
                      onInsertToChat(generatedImage, prompt);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>चैट में भेजें</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!isGenerating && !generatedImage && (
            <div className="text-center text-slate-400 py-10">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <div className="text-sm font-medium">कोई चित्र नहीं बना है</div>
              <div className="text-xs">ऊपर विषय लिखकर "चित्र बनाएं" पर क्लिक करें</div>
            </div>
          )}

          {error && (
            <div className="mt-3 text-xs text-red-500 font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
