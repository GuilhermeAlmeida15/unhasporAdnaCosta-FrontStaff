/**
 * Header de 56px com a hairline de `border` embaixo. É `sticky` dentro da
 * coluna de conteúdo (e não `fixed`), para no desktop não passar por baixo
 * da navegação lateral.
 */
export default function Header({ titulo, legenda, acao }) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-surface"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 w-full max-w-sm items-center justify-between gap-3 px-4 md:h-16 md:max-w-3xl lg:max-w-5xl">
        <div className="min-w-0">
          <h1 className="truncate text-h3 text-ink md:text-h2">{titulo}</h1>
          {legenda ? (
            <p className="truncate text-caption text-ink-muted">{legenda}</p>
          ) : null}
        </div>

        {acao}
      </div>
    </header>
  )
}
