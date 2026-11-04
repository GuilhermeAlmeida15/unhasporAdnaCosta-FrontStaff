import { useEffect, useState } from 'react'
import AppShell from './screens/AppShell'
import LoginStaff from './screens/LoginStaff'
import TrocarSenha from './screens/TrocarSenha'
import { logout, obterSessao } from './lib/api'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  // O cookie `sessao` sobrevive ao reload, então perguntamos à API quem está
  // logado antes de decidir qual tela abrir.
  const [verificando, setVerificando] = useState(true)
  // Troca voluntária, pedida no menu da conta (a obrigatória vem do backend).
  const [trocaPedida, setTrocaPedida] = useState(false)

  useEffect(() => {
    let ativo = true

    obterSessao()
      .then((sessao) => ativo && setUsuario(sessao?.usuario ?? null))
      .catch(() => {}) // 401 é o caso normal de quem ainda não entrou
      .finally(() => ativo && setVerificando(false))

    return () => {
      ativo = false
    }
  }, [])

  async function sair() {
    try {
      await logout()
    } finally {
      setUsuario(null)
      setTrocaPedida(false)
    }
  }

  if (verificando) {
    return <div className="min-h-dvh bg-surface" />
  }

  if (!usuario) {
    return <LoginStaff onEntrar={(sessao) => setUsuario(sessao?.usuario ?? null)} />
  }

  // Quem recebeu senha temporária não passa daqui: a API recusa as rotas da
  // equipe enquanto `trocar_senha` for true.
  if (usuario.trocar_senha) {
    return (
      <TrocarSenha
        obrigatoria
        onTrocada={() => setUsuario({ ...usuario, trocar_senha: false })}
      />
    )
  }

  if (trocaPedida) {
    return (
      <TrocarSenha
        onTrocada={() => setTrocaPedida(false)}
        onCancelar={() => setTrocaPedida(false)}
      />
    )
  }

  return (
    <AppShell
      usuario={usuario}
      onSair={sair}
      onTrocarSenha={() => setTrocaPedida(true)}
    />
  )
}
