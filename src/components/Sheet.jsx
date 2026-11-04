import { useEffect, useRef } from 'react'

/**
 * No celular, folha que sobe da base da tela (só o topo arredondado). No
 * desktop, o mesmo conteúdo vira um modal centrado, arredondado nos quatro
 * cantos. O scrim faz fade junto nos dois casos.
 */
export default function Sheet({ aberta, titulo, descricao, onFechar, children }) {
  const caixa = useRef(null)

  // Os pais passam `onFechar` como arrow function, então ela muda de
  // identidade a cada render. Guardá-la numa ref deixa o efeito abaixo
  // depender só de `aberta`: sem isso ele rodava a cada tecla digitada e o
  // `focus()` roubava o foco do campo em que a pessoa estava escrevendo.
  const fechar = useRef(onFechar)
  useEffect(() => {
    fechar.current = onFechar
  })

  useEffect(() => {
    if (!aberta) return undefined

    function aoTeclar(evento) {
      if (evento.key === 'Escape') fechar.current?.()
    }

    // Com a folha aberta, o conteúdo atrás não rola junto.
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', aoTeclar)
    caixa.current?.focus()

    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberta])

  if (!aberta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="animate-fade absolute inset-0 bg-overlay"
        onClick={() => fechar.current?.()}
        aria-hidden="true"
      />

      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="folha-entrada relative max-h-[88dvh] w-full max-w-sm overflow-y-auto rounded-t-lg bg-surface p-5 pb-8 shadow-md focus:outline-none sm:max-h-[85dvh] sm:max-w-md sm:rounded-lg sm:p-6 sm:pb-6"
      >
        {/* A alça só faz sentido na folha que sobe da base. */}
        <div
          className="mx-auto mb-5 h-1 w-10 rounded-pill bg-border-strong sm:hidden"
          aria-hidden="true"
        />

        <h2 className="text-h2 text-ink">{titulo}</h2>
        {descricao ? <p className="mt-2 text-body text-ink-muted">{descricao}</p> : null}

        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
