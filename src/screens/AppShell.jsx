import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import Button from '../components/Button'
import Header from '../components/Header'
import Sheet from '../components/Sheet'
import SideNav from '../components/SideNav'
import Toast from '../components/Toast'
import Agenda from './Agenda'
import Equipe from './Equipe'
import Expediente from './Expediente'
import Servicos from './Servicos'
import { nomeDoPapel, podeGerenciarEquipe, podeGerenciarServicos } from '../lib/papel'

const ABAS = {
  agenda: { id: 'agenda', rotulo: 'Agenda', icone: 'agenda', titulo: 'Agendamentos' },
  expediente: {
    id: 'expediente',
    rotulo: 'Expediente',
    icone: 'expediente',
    titulo: 'Expediente',
  },
  equipe: { id: 'equipe', rotulo: 'Equipe', icone: 'equipe', titulo: 'Equipe' },
  servicos: { id: 'servicos', rotulo: 'Serviços', icone: 'servicos', titulo: 'Serviços' },
}

function IconeConta() {
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
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

export default function AppShell({ usuario, onSair, onTrocarSenha }) {
  // A navegação é o próprio mapa de permissões: o Administrador não recebe as
  // abas de Equipe e Serviços porque a API as recusaria de qualquer jeito.
  const abas = [
    ABAS.agenda,
    ABAS.expediente,
    ...(podeGerenciarEquipe(usuario) ? [ABAS.equipe] : []),
    ...(podeGerenciarServicos(usuario) ? [ABAS.servicos] : []),
  ]

  const [atual, setAtual] = useState('agenda')
  const [aviso, setAviso] = useState(null)
  const [conta, setConta] = useState(false)
  const [saindo, setSaindo] = useState(false)

  const aba = abas.find((a) => a.id === atual) ?? abas[0]

  function avisar(mensagem, tom = 'neutro') {
    setAviso({ mensagem, tom })
  }

  async function sair() {
    setSaindo(true)
    try {
      await onSair()
    } finally {
      setSaindo(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-surface">
      <SideNav abas={abas} atual={atual} onTrocar={setAtual} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          titulo={aba.titulo}
          legenda={`${usuario.nome} · ${nomeDoPapel(usuario.papel)}`}
          acao={
            <button
              type="button"
              onClick={() => setConta(true)}
              aria-label="Sua conta"
              className="flex size-10 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors duration-150 ease-out hover:bg-brand-softer hover:text-brand active:bg-brand-softer"
            >
              <IconeConta />
            </button>
          }
        />

        {/* A barra de baixo cobre 56px no celular; no desktop ela não existe. */}
        <main className="mx-auto w-full max-w-sm px-4 pt-6 pb-24 md:max-w-3xl md:pb-12 lg:max-w-5xl">
          {atual === 'agenda' ? <Agenda onAviso={avisar} /> : null}
          {atual === 'expediente' ? <Expediente onAviso={avisar} /> : null}
          {atual === 'equipe' ? <Equipe usuario={usuario} onAviso={avisar} /> : null}
          {atual === 'servicos' ? <Servicos onAviso={avisar} /> : null}
        </main>
      </div>

      <BottomNav abas={abas} atual={atual} onTrocar={setAtual} />

      <Toast mensagem={aviso?.mensagem} tom={aviso?.tom} onFechar={() => setAviso(null)} />

      <Sheet
        aberta={conta}
        titulo="Sua conta"
        descricao={`${usuario.nome} · ${nomeDoPapel(usuario.papel)}`}
        onFechar={saindo ? undefined : () => setConta(false)}
      >
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            full
            disabled={saindo}
            onClick={() => {
              setConta(false)
              onTrocarSenha()
            }}
          >
            Trocar minha senha
          </Button>

          <Button variant="destructive" full loading={saindo} onClick={sair}>
            Sair
          </Button>

          <Button variant="ghost" full disabled={saindo} onClick={() => setConta(false)}>
            Voltar
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
