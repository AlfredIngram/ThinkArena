import type { SoundKind } from '../types'

/**
 * Tiny Web Audio sound engine. Every effect is synthesised at runtime, so the
 * app ships with zero audio files and no licensing concerns.
 *
 * To swap in real assets later: replace `play()` with `new Audio(url).play()`
 * and keep the same `playSound(kind)` public API.
 */
class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true

  setEnabled(value: boolean) {
    this.enabled = value
    if (!value) this.stopMusic()
  }

  isEnabled() {
    return this.enabled
  }

  private context(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay = 0,
    gain = 0.08,
  ) {
    const ctx = this.context()
    if (!ctx) return
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    amp.gain.setValueAtTime(0.0001, start)
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  }

  play(kind: SoundKind) {
    if (!this.enabled) return
    switch (kind) {
      case 'correct':
        this.tone(660, 0.12)
        this.tone(990, 0.14, 'sine', 0.1)
        break
      case 'incorrect':
        this.tone(220, 0.18, 'triangle')
        this.tone(180, 0.2, 'triangle', 0.12)
        break
      case 'xp':
        this.tone(880, 0.08, 'square', 0, 0.05)
        break
      case 'coin':
        this.tone(1180, 0.07, 'square', 0, 0.05)
        this.tone(1560, 0.09, 'square', 0.07, 0.05)
        break
      case 'achievement':
        ;[523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.16, 'sine', i * 0.09))
        break
      case 'levelUp':
        ;[523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.2, 'triangle', i * 0.1))
        break
      case 'bossDefeated':
        ;[392, 523, 659, 784, 1046, 1318].forEach((f, i) =>
          this.tone(f, 0.24, 'sawtooth', i * 0.11, 0.06),
        )
        break
      case 'click':
        this.tone(440, 0.05, 'square', 0, 0.03)
        break
    }
  }

  /** Placeholder music hook - intentionally a no-op loop. */
  startMusic() {
    /* Music assets can be dropped in here later. */
  }

  stopMusic() {
    /* No music assets yet. */
  }
}

export const soundManager = new SoundManager()
export const playSound = (kind: SoundKind) => soundManager.play(kind)
