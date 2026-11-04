import Icone from './navIcones'

function MarcaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M9 3h6v3H9z" />
      <path d="M7.5 10.5A2.5 2.5 0 0 1 10 8h4a2.5 2.5 0 0 1 2.5 2.5V18a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3z" />
      <path d="M7.5 13.5h9" />
    </svg>
  )
}

/**
 * Navegação do desktop: a mesma lista da BottomNav, de pé na lateral. Some
 * abaixo de `md`, onde a BottomNav assume.
 */
export default function SideNav({ abas, atual, onTrocar }) {
  return (
    <div className="hidden shrink-0 border-r border-border bg-surface-sunken md:block md:w-56 lg:w-64">
      <div className="sticky top-0 flex h-dvh flex-col p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
            <MarcaIcon />
          </div>
          <div className="min-w-0">
            <p className="text-caption text-ink-muted">Unhas por</p>
            <p className="truncate text-body font-semibold text-ink">Adna Costa</p>
          </div>
        </div>

        <nav aria-label="Seções" className="mt-6">
          <ul className="flex flex-col gap-1">
            {abas.map((aba) => {
              const ativo = aba.id === atual

              return (
                <li key={aba.id}>
                  <button
                    type="button"
                    onClick={() => onTrocar(aba.id)}
                    aria-current={ativo ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-button transition-colors duration-200 ease-in-out ${
                      ativo
                        ? 'bg-brand-softer text-brand'
                        : 'text-ink-muted hover:bg-surface hover:text-ink'
                    }`}
                  >
                    <Icone nome={aba.icone} ativo={ativo} />
                    {aba.rotulo}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
