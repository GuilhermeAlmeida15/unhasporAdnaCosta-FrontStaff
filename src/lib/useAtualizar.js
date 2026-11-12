// src/lib/useAtualizar.js
import { useEffect, useRef } from 'react'

export default function useAtualizar(carregar, intervalo = 15000) {
  const ref = useRef(carregar)

  useEffect(() => {
    ref.current = carregar
  }, [carregar])

  useEffect(() => {
    function atualizar() {
      if (document.visibilityState === 'visible') ref.current()
    }

    const id = setInterval(atualizar, intervalo)
    document.addEventListener('visibilitychange', atualizar)
    window.addEventListener('focus', atualizar)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', atualizar)
      window.removeEventListener('focus', atualizar)
    }
  }, [intervalo])
}