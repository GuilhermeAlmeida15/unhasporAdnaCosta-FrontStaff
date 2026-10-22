import { useEffect, useState } from 'react'
import Button from './components/Button'
import LoginStaff from './screens/LoginStaff'
import { logout, obterSessao } from './lib/api'

export default function App() {
  const [sessao, setSessao] = useState(null)
  // O cookie `sessao` sobrevive ao reload, então perguntamos à API quem está
  // logado antes de decidir entre a tela de login e a de dentro.
  const [verificando, setVerificando] = useState(true)
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    let ativo = true

    obterSessao()
      .then((quem) => ativo && setSessao(quem))
      .catch(() => {}) // 401 é o caso normal de quem ainda não entrou
      .finally(() => ativo && setVerificando(false))

    return () => {
      ativo = false
    }
  }, [])

  async function sair() {
    setSaindo(true)
    try {
      await logout()
    } finally {
      setSessao(null)
      setSaindo(false)
    }
  }

  if (verificando) {
    return <div className="min-h-dvh bg-surface" />
  }

  if (!sessao) {
    return <LoginStaff onEntrar={setSessao} />
  }

  const usuario = sessao.usuario ?? sessao
  const nome = typeof usuario?.nome === 'string' ? usuario.nome : null

  // Por enquanto só a tela de login existe: as próximas (agenda, expediente,
  // bloqueios) entram aqui depois.
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-h1 text-ink">
          Você entrou{nome ? `, ${nome}` : ''}.
        </h1>
        <p className="mt-2 text-body text-ink-muted">
          A agenda da equipe entra nesta tela na próxima etapa.
        </p>
      </div>

      <Button variant="secondary" full loading={saindo} onClick={sair}>
        Sair
      </Button>
    </main>
  )
}
