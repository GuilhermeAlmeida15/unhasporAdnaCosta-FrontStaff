import { useId } from 'react'

/**
 * Lista fechada de opções, com a mesma moldura do Input. A primeira opção é um
 * convite ("Selecione…") com valor vazio: sem ela o navegador já mostraria a
 * primeira categoria escolhida, e quem só passasse batido salvaria um grupo
 * que não escolheu.
 */
export default function Select({
  label,
  error,
  hint,
  placeholder = 'Selecione…',
  opcoes = [],
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
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={[
            'min-h-12 w-full appearance-none rounded-sm border pl-4 pr-11 text-body text-ink',
            'transition-colors duration-150 ease-out',
            'focus:border-brand focus:bg-surface focus:outline-none',
            'disabled:text-ink-subtle',
            error
              ? 'border-status-recusado bg-status-recusado-soft'
              : 'border-transparent bg-surface-sunken',
          ].join(' ')}
          style={{ borderWidth: '1.5px' }}
          {...props}
        >
          <option value="">{placeholder}</option>
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>

        {/* A seta nativa sai com o appearance-none; sem esta, o campo passaria
            por um input comum. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute inset-y-0 right-4 my-auto size-4 text-ink-muted"
          aria-hidden="true"
        >
          <path d="m7 10 5 5 5-5" />
        </svg>
      </div>

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
