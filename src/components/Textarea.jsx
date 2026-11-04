import { useId } from 'react'

/**
 * Textarea com contador. O contador só fica vermelho ao passar do limite que
 * o backend valida — nunca antes.
 */
export default function Textarea({
  label,
  error,
  hint,
  maxLength,
  value = '',
  className = '',
  id: idProp,
  ...props
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const passou = maxLength !== undefined && value.length > maxLength

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-body-sm font-semibold text-ink">
          {label}
        </label>

        {maxLength !== undefined ? (
          <span
            className={`text-caption tabular-nums ${passou ? 'text-status-recusado' : 'text-ink-muted'}`}
          >
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>

      <textarea
        id={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? errorId : null, hint ? hintId : null]
          .filter(Boolean)
          .join(' ') || undefined}
        className={[
          'mt-2 min-h-22 w-full resize-y rounded-sm border p-4 text-body text-ink',
          'placeholder:text-ink-subtle',
          'transition-colors duration-150 ease-out',
          'focus:border-brand focus:bg-surface focus:outline-none',
          error
            ? 'border-status-recusado bg-status-recusado-soft'
            : 'border-transparent bg-surface-sunken',
        ].join(' ')}
        style={{ borderWidth: '1.5px' }}
        {...props}
      />

      {error ? (
        <p id={errorId} aria-live="polite" className="mt-2 text-body-sm text-status-recusado">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-2 text-body-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
