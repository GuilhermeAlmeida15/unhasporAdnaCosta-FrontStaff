import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Sheet from '../components/Sheet'
import {
  ApiError,
  criarBloqueio,
  listarBloqueios,
  listarExpediente,
  removerBloqueio,
  salvarExpediente,
} from '../lib/api'
import { DIAS_DA_SEMANA, diaPorExtenso, horas } from '../lib/datas'
import { useErrosDeCampo } from '../lib/erros'

const MOTIVO_MAXIMO = 150

let proximaChave = 0
const novaFaixa = (dia) => ({
  chave: `f${proximaChave++}`,
  dia_semana: dia,
  inicio: '09:00',
  fim: '18:00',
})

function IconeMais() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  )
}

function IconeLixeira() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7" />
    </svg>
  )
}

export default function Expediente({ onAviso }) {
  const [faixas, setFaixas] = useState([])
  const [bloqueios, setBloqueios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [camposComErro, setCamposComErro] = useState({})
  const [sujo, setSujo] = useState(false)

  const [novoBloqueio, setNovoBloqueio] = useState(null)
  const [criandoBloqueio, setCriandoBloqueio] = useState(false)
  const {
    erros: errosBloqueio,
    setErros: setErrosBloqueio,
    limpar: limparErroBloqueio,
    limparTudo: limparErrosBloqueio,
  } = useErrosDeCampo()
  const [conflito, setConflito] = useState(null)
  const [removendo, setRemovendo] = useState(null)

  // Mexer num campo apaga o aviso daquele campo, nunca o dos outros.
  function mudarBloqueio(campo, valor) {
    setNovoBloqueio((atual) => ({ ...atual, [campo]: valor }))
    limparErroBloqueio(campo)
    setConflito(null)
  }

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const [expediente, lista] = await Promise.all([listarExpediente(), listarBloqueios()])
        if (!ativo) return

        setFaixas(
          (expediente?.faixas ?? []).map((faixa) => ({
            chave: `f${proximaChave++}`,
            dia_semana: Number(faixa.dia_semana),
            inicio: faixa.inicio,
            fim: faixa.fim,
          }))
        )
        setBloqueios(lista?.bloqueios ?? [])
        setSujo(false)
      } catch (e) {
        if (ativo) {
          setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar o expediente.')
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  function mudarFaixa(chave, campo, valor) {
    setFaixas((atuais) =>
      atuais.map((faixa) => (faixa.chave === chave ? { ...faixa, [campo]: valor } : faixa))
    )
    setSujo(true)
    setCamposComErro({})
  }

  function adicionarFaixa(dia) {
    setFaixas((atuais) => [...atuais, novaFaixa(dia)])
    setSujo(true)
  }

  function removerFaixa(chave) {
    setFaixas((atuais) => atuais.filter((faixa) => faixa.chave !== chave))
    setSujo(true)
    setCamposComErro({})
  }

  async function salvar() {
    setSalvando(true)
    setCamposComErro({})
    try {
      const corpo = faixas.map(({ dia_semana, inicio, fim }) => ({ dia_semana, inicio, fim }))
      const dados = await salvarExpediente(corpo)

      setFaixas(
        (dados?.faixas ?? []).map((faixa) => ({
          chave: `f${proximaChave++}`,
          dia_semana: Number(faixa.dia_semana),
          inicio: faixa.inicio,
          fim: faixa.fim,
        }))
      )
      setSujo(false)
      onAviso?.('Expediente salvo. Vale para os próximos pedidos.')
    } catch (e) {
      if (e instanceof ApiError) {
        setCamposComErro(e.campos)
        onAviso?.(e.message, 'erro')
      } else {
        onAviso?.('Não foi possível salvar o expediente.', 'erro')
      }
    } finally {
      setSalvando(false)
    }
  }

  // A API indexa os erros pela posição na lista enviada ("faixas.3").
  function erroDaFaixa(chave) {
    const indice = faixas.findIndex((faixa) => faixa.chave === chave)

    return camposComErro[`faixas.${indice}`] ?? camposComErro[`faixas.${indice}.dia_semana`]
  }

  function abrirNovoBloqueio() {
    setNovoBloqueio({ inicio: '', fim: '', motivo: '' })
    limparErrosBloqueio()
    setConflito(null)
  }

  async function enviarBloqueio(evento) {
    evento.preventDefault()
    if (criandoBloqueio) return

    const erros = {}
    if (!novoBloqueio.inicio) erros.inicio = 'Informe quando o bloqueio começa.'
    if (!novoBloqueio.fim) erros.fim = 'Informe quando o bloqueio termina.'
    if (novoBloqueio.motivo.trim() === '') erros.motivo = 'Informe o motivo. Ex.: "almoço".'
    if (Object.keys(erros).length > 0) {
      setErrosBloqueio(erros)
      return
    }

    setCriandoBloqueio(true)
    limparErrosBloqueio()
    setConflito(null)
    try {
      await criarBloqueio({
        inicio: novoBloqueio.inicio,
        fim: novoBloqueio.fim,
        motivo: novoBloqueio.motivo.trim(),
      })
      const lista = await listarBloqueios()
      setBloqueios(lista?.bloqueios ?? [])
      setNovoBloqueio(null)
      onAviso?.('Bloqueio criado.')
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setConflito(e.message)
      } else if (e instanceof ApiError && Object.keys(e.campos).length > 0) {
        setErrosBloqueio(e.campos)
      } else {
        onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível criar o bloqueio.', 'erro')
      }
    } finally {
      setCriandoBloqueio(false)
    }
  }

  async function apagarBloqueio(id) {
    setRemovendo(id)
    try {
      await removerBloqueio(id)
      setBloqueios((atuais) => atuais.filter((bloqueio) => bloqueio.id !== id))
      onAviso?.('Bloqueio removido.')
    } catch (e) {
      onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível remover.', 'erro')
    } finally {
      setRemovendo(null)
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-md bg-surface-sunken" />
        ))}
      </div>
    )
  }

  if (erro) {
    return (
      <div className="rounded-md bg-status-recusado-soft p-4">
        <p className="text-body-sm text-status-recusado">{erro}</p>
      </div>
    )
  }

  return (
    <>
      <section aria-labelledby="titulo-expediente">
        <h2 id="titulo-expediente" className="text-h2 text-ink">
          Horário de funcionamento
        </h2>
        <p className="mt-2 max-w-prose text-body-sm text-ink-muted">
          Vale para o salão inteiro. Um dia sem faixa nenhuma fica fechado; para tirar o
          almoço do meio, use duas faixas no mesmo dia.
        </p>

        <ul className="mt-5 flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
          {DIAS_DA_SEMANA.map((dia) => {
            const doDia = faixas.filter((faixa) => faixa.dia_semana === dia.valor)

            return (
              <li
                key={dia.valor}
                className="rounded-md border border-border bg-surface-raised p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-h3 text-ink">{dia.nome}</h3>

                  <button
                    type="button"
                    onClick={() => adicionarFaixa(dia.valor)}
                    aria-label={`Adicionar faixa em ${dia.nome}`}
                    className="flex size-10 items-center justify-center rounded-sm text-brand transition-colors duration-150 ease-out hover:bg-brand-softer active:bg-brand-softer"
                  >
                    <IconeMais />
                  </button>
                </div>

                {doDia.length === 0 ? (
                  <p className="mt-1 text-body-sm text-ink-muted">Fechado</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-3">
                    {doDia.map((faixa) => {
                      const erroFaixa = erroDaFaixa(faixa.chave)

                      return (
                        <li key={faixa.chave}>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={faixa.inicio}
                              aria-label={`Início da faixa em ${dia.nome}`}
                              onChange={(e) =>
                                mudarFaixa(faixa.chave, 'inicio', e.target.value)
                              }
                              className="min-h-12 flex-1 rounded-sm bg-surface-sunken px-3 text-body text-ink focus:outline-none"
                              style={{
                                border: erroFaixa
                                  ? '1.5px solid var(--color-status-recusado)'
                                  : '1.5px solid transparent',
                              }}
                            />
                            <span className="text-body-sm text-ink-muted">até</span>
                            <input
                              type="time"
                              value={faixa.fim}
                              aria-label={`Fim da faixa em ${dia.nome}`}
                              onChange={(e) => mudarFaixa(faixa.chave, 'fim', e.target.value)}
                              className="min-h-12 flex-1 rounded-sm bg-surface-sunken px-3 text-body text-ink focus:outline-none"
                              style={{
                                border: erroFaixa
                                  ? '1.5px solid var(--color-status-recusado)'
                                  : '1.5px solid transparent',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removerFaixa(faixa.chave)}
                              aria-label={`Remover faixa de ${faixa.inicio} às ${faixa.fim} em ${dia.nome}`}
                              className="flex size-10 shrink-0 items-center justify-center rounded-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-status-recusado-soft hover:text-status-recusado active:bg-status-recusado-soft"
                            >
                              <IconeLixeira />
                            </button>
                          </div>

                          {erroFaixa ? (
                            <p aria-live="polite" className="mt-2 text-body-sm text-status-recusado">
                              {erroFaixa}
                            </p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        <Button
          full
          className="mt-5 md:w-auto"
          loading={salvando}
          disabled={!sujo}
          onClick={salvar}
        >
          {sujo ? 'Salvar expediente' : 'Expediente salvo'}
        </Button>
      </section>

      <section aria-labelledby="titulo-bloqueios" className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 id="titulo-bloqueios" className="text-h2 text-ink">
            Horários bloqueados
          </h2>

          <Button variant="secondary" onClick={abrirNovoBloqueio}>
            Novo
          </Button>
        </div>

        <p className="mt-2 max-w-prose text-body-sm text-ink-muted">
          Folga, almoço ou um imprevisto dentro do expediente. Quem já tem horário no
          período precisa ser recusado ou cancelado antes.
        </p>

        {bloqueios.length === 0 ? (
          <p className="mt-5 rounded-md bg-surface-sunken p-4 text-body-sm text-ink-muted">
            Nenhum bloqueio daqui para a frente.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {bloqueios.map((bloqueio) => (
              <li
                key={bloqueio.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface-raised p-4"
              >
                <div className="min-w-0">
                  <p className="text-body font-semibold text-ink">
                    {diaPorExtenso(bloqueio.inicio)}, {horas(bloqueio.inicio)}–
                    {horas(bloqueio.fim)}
                  </p>
                  <p className="mt-0.5 truncate text-body-sm text-ink-muted">
                    {bloqueio.motivo}
                  </p>
                  {bloqueio.criado_por ? (
                    <p className="mt-1 text-caption text-ink-muted">
                      Por {bloqueio.criado_por}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => apagarBloqueio(bloqueio.id)}
                  disabled={removendo === bloqueio.id}
                  aria-label={`Remover bloqueio de ${bloqueio.motivo}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-status-recusado-soft hover:text-status-recusado active:bg-status-recusado-soft disabled:text-ink-subtle"
                >
                  <IconeLixeira />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet
        aberta={novoBloqueio !== null}
        titulo="Novo bloqueio"
        descricao="Nenhum cliente consegue pedir horário dentro deste período."
        onFechar={criandoBloqueio ? undefined : () => setNovoBloqueio(null)}
      >
        <form onSubmit={enviarBloqueio} noValidate className="flex flex-col gap-5">
          <Input
            label="Começa"
            type="datetime-local"
            value={novoBloqueio?.inicio ?? ''}
            error={errosBloqueio.inicio}
            disabled={criandoBloqueio}
            onChange={(e) => mudarBloqueio('inicio', e.target.value)}
          />

          <Input
            label="Termina"
            type="datetime-local"
            value={novoBloqueio?.fim ?? ''}
            error={errosBloqueio.fim}
            disabled={criandoBloqueio}
            onChange={(e) => mudarBloqueio('fim', e.target.value)}
          />

          <Input
            label="Motivo"
            maxLength={MOTIVO_MAXIMO}
            placeholder="Almoço"
            value={novoBloqueio?.motivo ?? ''}
            error={errosBloqueio.motivo}
            disabled={criandoBloqueio}
            onChange={(e) => mudarBloqueio('motivo', e.target.value)}
          />

          {conflito ? (
            <p
              role="alert"
              className="rounded-sm bg-status-recusado-soft p-4 text-body-sm text-status-recusado"
            >
              {conflito}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button type="submit" full loading={criandoBloqueio}>
              Bloquear
            </Button>
            <Button
              variant="ghost"
              full
              disabled={criandoBloqueio}
              onClick={() => setNovoBloqueio(null)}
            >
              Voltar
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  )
}
