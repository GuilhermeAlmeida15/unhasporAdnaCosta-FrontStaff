import { useCallback, useState } from 'react'

/**
 * Erros por campo, vindos da API (`campos`) ou da validação local.
 *
 * O aviso some assim que a pessoa mexe naquele campo: deixar a mensagem do
 * envio anterior embaixo de um valor que já foi corrigido faz parecer que o
 * novo valor é que está errado.
 */
export function useErrosDeCampo() {
  const [erros, setErros] = useState({})

  const limpar = useCallback((campo) => {
    setErros((atuais) => {
      if (atuais[campo] === undefined) return atuais

      const resto = { ...atuais }
      delete resto[campo]

      return resto
    })
  }, [])

  const limparTudo = useCallback(() => setErros({}), [])

  return { erros, setErros, limpar, limparTudo }
}
