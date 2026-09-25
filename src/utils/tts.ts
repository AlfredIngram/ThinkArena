/**
 * Text-to-speech wrapper. Uses the browser SpeechSynthesis API - no external
 * audio assets required. If TTS is unavailable the caller should fall back to
 * showing the word.
 */

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string, rate = 0.85): void {
  if (!ttsAvailable()) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.pitch = 1.05
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  } catch {
    /* TTS is a nice-to-have; never break gameplay over it. */
  }
}

export function stopSpeaking(): void {
  if (!ttsAvailable()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

/** Spell a word letter by letter, with small pauses. */
export function speakLetters(word: string): void {
  if (!ttsAvailable()) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(word.split('').join(', '))
    u.rate = 0.7
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}
