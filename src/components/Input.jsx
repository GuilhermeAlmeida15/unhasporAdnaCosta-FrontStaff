import { useId } from 'react'

/**
 * Campo de uma linha. O rótulo é sempre um `<label>` associado — nunca
 * um placeholder fazendo o papel de rótulo. A mensagem de erro é a que a
 * API devolveu em `campos.<nome>`.
 */
export default function Input({
  label,
  error,
  hint,
  trailing,
  className = '',
  id: idProp,
  ...props
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body-sm font-semibold text-ink">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={[
            'min-h-12 w-full rounded-sm border px-4 text-body text-ink',
            'placeholder:text-ink-subtle',
            'transition-colors duration-150 ease-out',
            'focus:border-brand focus:bg-surface focus:outline-none',
            'disabled:text-ink-subtle',
            trailing ? 'pr-12' : '',
            error
              ? 'border-status-recusado bg-status-recusado-soft'
              : 'border-transparent bg-surface-sunken',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ borderWidth: '1.5px' }}
          {...props}
        />

        {trailing ? (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>

      {error ? (
        <p
          id={errorId}
          aria-live="polite"
          className="mt-2 text-body-sm text-status-recusado"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} aria-live="polite" className="mt-2 text-body-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
