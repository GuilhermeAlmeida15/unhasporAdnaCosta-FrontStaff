import { useEffect, useRef } from 'react'

/** Entra deslizando de baixo e some depois de 4s ou ao toque. */
export default function Toast({ mensagem, tom = 'neutro', onFechar }) {
  // Mesmo motivo do Sheet: `onFechar` muda de identidade a cada render do
  // pai. Numa ref, o relógio abaixo conta a partir da mensagem e não é
  // reiniciado por um render qualquer da tela.
  const fechar = useRef(onFechar)
  useEffect(() => {
    fechar.current = onFechar
  })

  useEffect(() => {
    if (!mensagem) return undefined

    const relogio = setTimeout(() => fechar.current?.(), 4000)

    return () => clearTimeout(relogio)
  }, [mensagem])

  if (!mensagem) return null

  const tons = {
    neutro: 'bg-ink text-surface',
    erro: 'bg-status-recusado text-ink-on-brand',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => fechar.current?.()}
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4"
    >
      <p
        className={`animate-subir pointer-events-auto max-w-sm cursor-pointer rounded-md px-4 py-3 text-body-sm shadow-md ${tons[tom]}`}
      >
        {mensagem}
      </p>
    </div>
  )
}
