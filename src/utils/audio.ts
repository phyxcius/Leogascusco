// Audio Notification Generator via Web Audio API
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.18); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.30); // G5
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.9);
  } catch {
    // Ignore
  }
}

export function speakVoice(text: string) {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-PE';
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const esVoice =
        voices.find((v) => v.lang === 'es-PE') ||
        voices.find((v) => v.lang === 'es-419') ||
        voices.find((v) => v.lang.startsWith('es'));
      if (esVoice) {
        utterance.voice = esVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Ignore speech errors
  }
}

export function playAndSpeak(text: string, isSuccess = false) {
  if (isSuccess) {
    playSuccessChime();
  } else {
    playChimeSound();
  }
  setTimeout(() => {
    speakVoice(text);
  }, 220);
}


