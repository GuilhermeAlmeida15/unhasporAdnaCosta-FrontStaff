export default function EmptyState({ titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-pill bg-surface-sunken text-ink-subtle"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M8 3v4M16 3v4M3.5 10h17" />
        </svg>
      </div>

      <h2 className="mt-5 text-h3 text-ink">{titulo}</h2>
      {descricao ? <p className="mt-2 text-body text-ink-muted">{descricao}</p> : null}
      {acao ? <div className="mt-6">{acao}</div> : null}
    </div>
  )
}
