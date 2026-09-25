import { useEffect, useRef, useState } from 'react'

interface AnswerInputProps {
  onSubmit: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  buttonLabel?: string
  autoFocus?: boolean
  /** Clears the field whenever this changes (e.g. next question). */
  resetKey?: string | number
}

/** Large text field + submit button used by typing games. */
export function AnswerInput({
  onSubmit,
  disabled,
  placeholder = 'Type your answer',
  label = 'Your answer',
  buttonLabel = 'Check',
  autoFocus,
  resetKey,
}: AnswerInputProps) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue('')
    if (autoFocus) ref.current?.focus()
  }, [resetKey, autoFocus])

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim() || disabled) return
        onSubmit(value.trim())
      }}
    >
      <label className="sr-only" htmlFor="answer-input">
        {label}
      </label>
      <input
        id="answer-input"
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="min-h-[60px] flex-1 rounded-2xl border-2 border-white/15 bg-black/40 px-4 text-center font-display text-2xl text-white placeholder:text-white/30 focus:border-electric-cyan focus:outline-none"
      />
      <button type="submit" className="btn-primary min-h-[60px] sm:w-40" disabled={disabled || !value.trim()}>
        {buttonLabel}
      </button>
    </form>
  )
}
