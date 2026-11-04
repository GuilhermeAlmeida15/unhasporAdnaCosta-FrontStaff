import Icone from './navIcones'

/** Navegação do celular. No desktop ela some e quem assume é a SideNav. */
export default function BottomNav({ abas, atual, onTrocar }) {
  return (
    <nav
      aria-label="Seções"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-sunken md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex w-full max-w-sm">
        {abas.map((aba) => {
          const ativo = aba.id === atual

          return (
            <li key={aba.id} className="flex-1">
              <button
                type="button"
                onClick={() => onTrocar(aba.id)}
                aria-current={ativo ? 'page' : undefined}
                className={`flex h-14 w-full flex-col items-center justify-center gap-0.5 transition-colors duration-200 ease-in-out ${
                  ativo ? 'text-brand' : 'text-ink-muted'
                }`}
              >
                <Icone nome={aba.icone} ativo={ativo} />
                <span className={ativo ? 'text-caption font-semibold' : 'text-caption'}>
                  {aba.rotulo}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
