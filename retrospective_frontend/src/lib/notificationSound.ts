// Sons de notification générés à la volée (API Web Audio) : pas de fichier
// audio à héberger, deux mélodies courtes et distinctes suffisent à
// distinguer un message de Discussion d'un commentaire de carte.
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

const playTone = (frequencies: number[], noteDurationMs: number): void => {
  const context = getAudioContext();
  if (!context) return;

  const noteDuration = noteDurationMs / 1000;

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + index * noteDuration;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration * 0.9);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration);
  });
};

// Discussion : deux notes montantes, plus "conversation".
export const playMessageNotificationSound = (): void => playTone([880, 1175], 110);

// Commentaire de carte : une seule note plus grave, pour rester distincte.
export const playCommentNotificationSound = (): void => playTone([660], 130);
