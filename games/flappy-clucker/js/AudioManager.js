export default class AudioManager {
  constructor() { this.context = null; }

  play(frequency, duration, type = "square", volume = 0.05) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.context ||= new AudioContextClass();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start();
      oscillator.stop(now + duration);
    } catch (_) { /* Audio is optional; the game still works without it. */ }
  }
}
