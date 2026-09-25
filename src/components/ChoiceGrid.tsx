interface ChoiceGridProps {
  options: string[]
  onSelect: (option: string) => void
  disabled?: boolean
  /** Options to render as correct / incorrect after answering. */
  correctValue?: string | null
  chosen?: string | null
  columns?: 1 | 2 | 3
}

/**
 * Big, touch-friendly answer buttons. Correct/incorrect is shown with an icon
 * and border, not colour alone.
 */
export function ChoiceGrid({
  options,
  onSelect,
  disabled,
  correctValue,
  chosen,
  columns = 2,
}: ChoiceGridProps) {
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid gap-3 ${gridCols}`} role="group" aria-label="Answer choices">
      {options.map((option) => {
        const isCorrect = correctValue != null && option === correctValue
        const isWrongChoice = correctValue != null && chosen === option && option !== correctValue
        return (
          <button
            key={option}
            className={`flex min-h-[60px] items-center justify-center gap-2 rounded-2xl border-2 px-4 font-display text-2xl transition-all ${
              isCorrect
                ? 'border-lime-400 bg-lime-500/25 text-lime-50'
                : isWrongChoice
                  ? 'border-orange-400 bg-orange-500/20 text-orange-50'
                  : 'border-white/15 bg-white/5 text-white hover:border-electric-cyan/60 hover:bg-white/10'
            } ${disabled && !isCorrect && !isWrongChoice ? 'opacity-50' : ''}`}
            onClick={() => onSelect(option)}
            disabled={disabled}
            aria-label={`Answer: ${option}`}
          >
            {isCorrect && <span aria-hidden>✓</span>}
            {isWrongChoice && <span aria-hidden>↻</span>}
            <span className="break-words text-center">{option}</span>
          </button>
        )
      })}
    </div>
  )
}
