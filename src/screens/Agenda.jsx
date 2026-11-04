import { useEffect, useState } from 'react'
import AppointmentCard from '../components/AppointmentCard'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Sheet from '../components/Sheet'
import Textarea from '../components/Textarea'
import {
  ApiError,
  cancelarAgendamento,
  confirmarAgendamento,
  listarAgendamentos,
  recusarAgendamento,
} from '../lib/api'

const MOTIVO_MAXIMO = 255

const FILTROS = [
  { id: 'pendente', rotulo: 'Pendentes' },
  { id: 'confirmado', rotulo: 'Confirmados' },
  { id: '', rotulo: 'Todos' },
]

const VAZIOS = {
  pendente: {
    titulo: 'Nenhum pedido esperando',
    descricao: 'Quando um cliente pedir um horário, ele aparece aqui para você responder.',
  },
  confirmado: {
    titulo: 'Nenhum horário confirmado',
    descricao: 'Os agendamentos que você aceitar ficam listados aqui.',
  },
  '': {
    titulo: 'A agenda está vazia',
    descricao: 'Ainda não há nenhum pedido de horário.',
  },
}

function Filtros({ atual, onTrocar, desabilitado }) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="flex max-w-sm gap-1 rounded-pill bg-surface-sunken p-1"
    >
      {FILTROS.map((filtro) => {
        const ativo = filtro.id === atual

        return (
          <button
            key={filtro.id || 'todos'}
            type="button"
            role="tab"
            aria-selected={ativo}
            disabled={desabilitado}
            onClick={() => onTrocar(filtro.id)}
            className={`flex-1 rounded-pill px-3 py-2 text-button transition-colors duration-200 ease-in-out ${
              ativo ? 'bg-brand-soft text-brand' : 'text-ink-muted'
            }`}
          >
            {filtro.rotulo}
          </button>
        )
      })}
    </div>
  )
}

function Esqueleto() {
  return (
    <div
      className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-md border border-border p-4">
          <div className="h-5 w-2/5 rounded-sm bg-surface-sunken" />
          <div className="mt-3 h-4 w-3/5 rounded-sm bg-surface-sunken" />
          <div className="mt-3 h-4 w-1/3 rounded-sm bg-surface-sunken" />
        </div>
      ))}
    </div>
  )
}

export default function Agenda({ onAviso }) {
  const [filtro, setFiltro] = useState('pendente')
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [emAcao, setEmAcao] = useState(null)

  // Recusar e cancelar passam por aqui: os dois exigem um motivo que o
  // cliente vai ler.
  const [pedido, setPedido] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [erroMotivo, setErroMotivo] = useState(null)

  // Trocar o filtro ou responder um pedido recarrega a lista. A busca mora
  // dentro do efeito para o estado não ser mexido de fora dele.
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao((n) => n + 1)

  useEffect(() => {
    let ativo = true

    async function buscar() {
      setCarregando(true)
      setErro(null)
      try {
        const dados = await listarAgendamentos({ status: filtro || undefined })
        if (ativo) setAgendamentos(dados?.agendamentos ?? [])
      } catch (e) {
        if (ativo) {
          setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar a agenda.')
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    buscar()

    return () => {
      ativo = false
    }
  }, [filtro, versao])

  async function confirmar(agendamento) {
    setEmAcao(agendamento.id)
    try {
      await confirmarAgendamento(agendamento.id)
      onAviso?.(`Horário de ${agendamento.nome_cliente} confirmado.`)
      recarregar()
    } catch (e) {
      onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível confirmar.', 'erro')
    } finally {
      setEmAcao(null)
    }
  }

  async function enviarMotivo(evento) {
    evento.preventDefault()
    if (emAcao) return

    const texto = motivo.trim()
    if (texto === '') {
      setErroMotivo('Informe o motivo; ele será enviado ao cliente.')
      return
    }
    if (texto.length > MOTIVO_MAXIMO) {
      setErroMotivo(`O motivo deve ter no máximo ${MOTIVO_MAXIMO} caracteres.`)
      return
    }

    const { agendamento, acao } = pedido
    setEmAcao(agendamento.id)
    setErroMotivo(null)
    try {
      if (acao === 'recusar') {
        await recusarAgendamento(agendamento.id, texto)
        onAviso?.(`Pedido de ${agendamento.nome_cliente} recusado.`)
      } else {
        await cancelarAgendamento(agendamento.id, texto)
        onAviso?.(`Horário de ${agendamento.nome_cliente} cancelado.`)
      }
      fecharSheet()
      recarregar()
    } catch (e) {
      if (e instanceof ApiError && e.campos.motivo) {
        setErroMotivo(e.campos.motivo)
      } else {
        onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível concluir.', 'erro')
        fecharSheet()
      }
    } finally {
      setEmAcao(null)
    }
  }

  function abrirSheet(agendamento, acao) {
    setPedido({ agendamento, acao })
    setMotivo('')
    setErroMotivo(null)
  }

  function fecharSheet() {
    setPedido(null)
    setMotivo('')
    setErroMotivo(null)
  }

  function acoesDe(agendamento) {
    const ocupado = emAcao === agendamento.id

    if (agendamento.status === 'pendente') {
      return (
        <>
          <Button
            className="flex-1"
            loading={ocupado}
            onClick={() => confirmar(agendamento)}
          >
            Aceitar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={ocupado}
            onClick={() => abrirSheet(agendamento, 'recusar')}
          >
            Recusar
          </Button>
        </>
      )
    }

    if (agendamento.status === 'confirmado') {
      return (
        <Button
          variant="destructive"
          className="flex-1"
          disabled={ocupado}
          onClick={() => abrirSheet(agendamento, 'cancelar')}
        >
          Cancelar
        </Button>
      )
    }

    return null
  }

  const recusando = pedido?.acao === 'recusar'
  const vazio = VAZIOS[filtro] ?? VAZIOS['']

  return (
    <>
      <Filtros atual={filtro} onTrocar={setFiltro} desabilitado={carregando} />

      <div className="mt-6">
        {carregando ? (
          <Esqueleto />
        ) : erro ? (
          <div className="rounded-md bg-status-recusado-soft p-4">
            <p className="text-body-sm text-status-recusado">{erro}</p>
            <Button variant="ghost" className="mt-3 px-0" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : agendamentos.length === 0 ? (
          <EmptyState titulo={vazio.titulo} descricao={vazio.descricao} />
        ) : (
          <ul className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id} className="flex">
                <AppointmentCard
                  agendamento={agendamento}
                  acoes={acoesDe(agendamento)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        aberta={pedido !== null}
        titulo={recusando ? 'Recusar o pedido' : 'Cancelar o horário'}
        descricao={
          pedido
            ? `${pedido.agendamento.nome_cliente} vai ler este motivo. Escreva como quem atende, não como um registro interno.`
            : undefined
        }
        onFechar={emAcao ? undefined : fecharSheet}
      >
        <form onSubmit={enviarMotivo} noValidate>
          <Textarea
            label="Motivo"
            name="motivo"
            maxLength={MOTIVO_MAXIMO}
            value={motivo}
            error={erroMotivo}
            placeholder="Precisei remarcar por um imprevisto."
            disabled={emAcao !== null}
            onChange={(e) => {
              setMotivo(e.target.value)
              setErroMotivo(null)
            }}
          />

          <div className="mt-5 flex flex-col gap-2">
            <Button
              type="submit"
              variant="destructive"
              full
              loading={emAcao !== null}
            >
              {recusando ? 'Recusar e avisar' : 'Cancelar e avisar'}
            </Button>
            <Button
              variant="ghost"
              full
              disabled={emAcao !== null}
              onClick={fecharSheet}
            >
              Voltar
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  )
}
