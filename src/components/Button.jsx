const variants = {
  primary:
    'bg-brand text-ink-on-brand hover:bg-brand-pressed active:bg-brand-pressed',
  secondary:
    'border border-border-strong bg-surface text-ink hover:bg-surface-sunken active:bg-surface-sunken',
  ghost: 'text-brand hover:bg-brand-softer active:bg-brand-softer',
  destructive:
    'border border-status-recusado text-status-recusado hover:bg-status-recusado-soft active:bg-status-recusado-soft',
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path
        d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Botão de ação. Um `primary` por tela.
 * Carregando troca o rótulo por um spinner — nunca desabilita sem indicar
 * que algo está acontecendo.
 */
export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  full = false,
  children,
  className = '',
  ...props
}) {
  const inert = disabled || loading

  return (
    <button
      type="button"
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      disabled={inert}
      className={[
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-button',
        'transition duration-100 ease-out select-none',
        'active:scale-[0.97]',
        full ? 'w-full' : '',
        inert
          ? 'pointer-events-none bg-surface-sunken text-ink-subtle active:scale-100'
          : variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
