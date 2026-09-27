// High-quality Realistic Female Voice Text-to-Speech Engine for AURA AI
// Combines Gemini Studio Neural TTS (/api/tts) with intelligent browser fallback

type SpeechCallback = (isSpeaking: boolean) => void;

export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
  selectedVoiceURI: string;
  useRealisticAI: boolean; // Use studio realistic voice
}

class RealisticFemaleSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private listeners: Set<SpeechCallback> = new Set();
  private isSpeaking = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private keepAliveInterval: any = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private audioContext: AudioContext | null = null;
  private activeAbortController: AbortController | null = null;

  private settings: VoiceSettings = {
    rate: 0.98,
    pitch: 1.05,
    volume: 1.0,
    autoSpeak: true,
    selectedVoiceURI: '',
    useRealisticAI: true,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initVoices();
        }
      }
      this.loadSettings();
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('aura_voice_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {}
  }

  public saveSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('aura_voice_settings', JSON.stringify(this.settings));
    } catch {}
    this.initVoices();
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices.length) return;

    if (this.settings.selectedVoiceURI) {
      const userVoice = voices.find(v => v.voiceURI === this.settings.selectedVoiceURI);
      if (userVoice) {
        this.preferredVoice = userVoice;
        return;
      }
    }

    // High quality natural female voices prioritizing Hindi & natural English
    const priorityNames = [
      'google हिन्दी', 'google hindi', 'swara', 'heera', 'neerja', 'kalpana',
      'google uk english female', 'google us english', 'microsoft swara',
      'jenny', 'zira', 'samantha', 'kore', 'zephyr', 'aditi', 'priya',
      'hazel', 'susan', 'veena', 'female'
    ];

    let matched: SpeechSynthesisVoice | undefined;

    // 1. Try matching Hindi female voice
    matched = voices.find(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isHindi = lang.includes('hi') || lang.includes('in');
      const isFemale = priorityNames.some(p => name.includes(p));
      return isHindi && isFemale;
    });

    // 2. Any Hindi voice
    if (!matched) {
      matched = voices.find(v => v.lang.toLowerCase().includes('hi'));
    }

    // 3. Any high quality female English/General voice
    if (!matched) {
      matched = voices.find(v => {
        const name = v.name.toLowerCase();
        return priorityNames.some(p => name.includes(p));
      });
    }

    // 4. Default fallback
    if (!matched && voices.length > 0) {
      matched = voices[0];
    }

    this.preferredVoice = matched || null;
  }

  public subscribe(cb: SpeechCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(state: boolean) {
    this.isSpeaking = state;
    this.listeners.forEach(cb => cb(state));
  }

  // Play gentle subtle confirmation chime
  public playAudioTone() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    return this.audioContext;
  }

  // Convert raw PCM / WAV base64 to audio buffer and play
  private async playBase64Audio(base64Data: string, mimeType: string, onEnd?: () => void): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Convert base64 to array buffer
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // If mimeType is WAV or audio container, decode via AudioContext
      let audioBuffer: AudioBuffer | null = null;
      try {
        audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      } catch (decodeErr) {
        // Fallback: If raw PCM 24000Hz 16-bit mono
        const pcm16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
          float32[i] = pcm16[i] / 32768.0;
        }
        audioBuffer = ctx.createBuffer(1, float32.length, 24000);
        audioBuffer.copyToChannel(float32, 0);
      }

      if (!audioBuffer) return false;

      this.stop(); // Stop anything else
      this.notify(true);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = this.settings.rate || 1.0;

      const gain = ctx.createGain();
      gain.gain.value = this.settings.volume || 1.0;

      source.connect(gain);
      gain.connect(ctx.destination);

      this.currentAudioSource = source;

      source.onended = () => {
        this.currentAudioSource = null;
        this.notify(false);
        if (onEnd) onEnd();
      };

      source.start();
      return true;
    } catch (e) {
      console.warn('Playback of neural TTS failed, falling back to browser synthesis:', e);
      return false;
    }
  }

  public async speak(rawText: string, onEnd?: () => void) {
    // Clean markdown and non-verbal artifacts
    const cleanText = rawText
      .replace(/###|\*\*|\*|#|`|_|\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[|•]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    // 1. Attempt Realistic AI Voice if enabled and short/medium text
    if (this.settings.useRealisticAI && cleanText.length < 500) {
      try {
        this.activeAbortController = new AbortController();
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
          signal: this.activeAbortController.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.available && data.audioBase64) {
            const played = await this.playBase64Audio(data.audioBase64, data.mimeType || 'audio/wav', onEnd);
            if (played) return;
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Fallback to Browser Speech Synthesis with human tuning
    this.speakWithBrowserSynth(cleanText, onEnd);
  }

  private speakWithBrowserSynth(cleanText: string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    if (this.synth.paused) {
      this.synth.resume();
    }

    // Split into natural breath pauses / sentences to prevent browser cut-off bug
    const sentences = cleanText.match(/[^.!?।\n]+[.!?।\n]+/g) || [cleanText];
    let sentenceIndex = 0;

    const speakNextSentence = () => {
      if (sentenceIndex >= sentences.length) {
        this.notify(false);
        this.clearKeepAlive();
        if (onEnd) onEnd();
        return;
      }

      const currentSentence = sentences[sentenceIndex].trim();
      sentenceIndex++;

      if (!currentSentence) {
        speakNextSentence();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(currentSentence);
      const isHindi = /[\u0900-\u097F]/.test(currentSentence);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = this.settings.rate || 0.98;
      utterance.pitch = this.settings.pitch || 1.05;
      utterance.volume = this.settings.volume || 1.0;

      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }

      utterance.onstart = () => {
        this.notify(true);
        this.startKeepAlive();
      };

      utterance.onend = () => {
        speakNextSentence();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis sentence error:', e);
        speakNextSentence();
      };

      try {
        this.synth?.speak(utterance);
      } catch (err) {
        console.warn('Synth speak error:', err);
        this.notify(false);
        if (onEnd) onEnd();
      }
    };

    speakNextSentence();
  }

  private startKeepAlive() {
    this.clearKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.synth && this.synth.speaking) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  private clearKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  public stop() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
      } catch {}
      this.currentAudioSource = null;
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {}
      this.currentAudioElement = null;
    }
    this.clearKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.notify(false);
  }

  public testVoice(sampleText = 'Hello! I am Aura, your personal study assistant. How can I help you today?') {
    this.playAudioTone();
    setTimeout(() => {
      this.speak(sampleText);
    }, 180);
  }

  public toggle(text: string) {
    if (this.isSpeaking) {
      this.stop();
    } else {
      this.speak(text);
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const femaleSpeech = new RealisticFemaleSpeechEngine();
