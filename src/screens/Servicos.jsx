import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Sheet from '../components/Sheet'
import Textarea from '../components/Textarea'
import {
  ApiError,
  atualizarServico,
  criarServico,
  listarServicos,
  removerServico,
} from '../lib/api'
import { duracao, preco } from '../lib/datas'
import { useErrosDeCampo } from '../lib/erros'

const VAZIO = { id: null, nome: '', preco: '', descricao: '', duracao_minutos: '60' }

/** Só a Supervisora escreve em `/api/servicos`; a leitura é pública. */
export default function Servicos({ onAviso }) {
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [removendo, setRemovendo] = useState(null)

  const [edicao, setEdicao] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const { erros, setErros, limpar, limparTudo } = useErrosDeCampo()
  const [erroGeral, setErroGeral] = useState(null)

  // Mexer num campo apaga o aviso daquele campo, nunca o dos outros.
  function mudar(campo, valor) {
    setEdicao((atual) => ({ ...atual, [campo]: valor }))
    limpar(campo)
    setErroGeral(null)
  }

  // Recarrega sem piscar o esqueleto: usada depois de criar ou editar.
  async function recarregar() {
    try {
      const dados = await listarServicos()
      setServicos(dados?.servicos ?? [])
      setErro(null)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar os serviços.')
    }
  }

  // Na montagem `carregando` já nasce true, então aqui só resta desligá-lo.
  useEffect(() => {
    let ativo = true

    async function buscar() {
      try {
        const dados = await listarServicos()
        if (ativo) {
          setServicos(dados?.servicos ?? [])
          setErro(null)
        }
      } catch (e) {
        if (ativo) {
          setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar os serviços.')
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    buscar()

    return () => {
      ativo = false
    }
  }, [])

  function abrir(servico) {
    setEdicao(
      servico
        ? {
            id: servico.id,
            nome: servico.nome,
            preco: String(servico.preco),
            descricao: servico.descricao ?? '',
            duracao_minutos: String(servico.duracao_minutos),
          }
        : { ...VAZIO }
    )
    limparTudo()
    setErroGeral(null)
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return

    const locais = {}
    if (edicao.nome.trim() === '') locais.nome = 'O nome é obrigatório. Ex.: "Manicure simples".'

    const valor = Number(edicao.preco.replace(',', '.'))
    if (edicao.preco.trim() === '' || Number.isNaN(valor)) {
      locais.preco = 'O preço deve ser um número, usando ponto para os centavos. Ex.: 35.90'
    } else if (valor < 0) {
      locais.preco = 'O preço não pode ser negativo.'
    }

    const minutos = Number(edicao.duracao_minutos)
    if (!Number.isInteger(minutos) || minutos < 15 || minutos > 480 || minutos % 5 !== 0) {
      locais.duracao_minutos =
        'A duração deve ser um número inteiro de minutos, entre 15 e 480, em múltiplos de 5. Ex.: 60'
    }

    if (Object.keys(locais).length > 0) {
      setErros(locais)
      return
    }

    setSalvando(true)
    limparTudo()
    setErroGeral(null)

    const corpo = {
      nome: edicao.nome.trim(),
      preco: valor,
      duracao_minutos: minutos,
      descricao: edicao.descricao.trim() === '' ? null : edicao.descricao.trim(),
    }

    try {
      if (edicao.id) {
        await atualizarServico(edicao.id, corpo)
        onAviso?.(`"${corpo.nome}" atualizado.`)
      } else {
        await criarServico(corpo)
        onAviso?.(`"${corpo.nome}" criado.`)
      }
      setEdicao(null)
      await recarregar()
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.campos).length > 0) {
        setErros(e.campos)
      } else {
        setErroGeral(e instanceof ApiError ? e.message : 'Não foi possível salvar.')
      }
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(servico) {
    setRemovendo(servico.id)
    try {
      await removerServico(servico.id)
      setServicos((atuais) => atuais.filter((s) => s.id !== servico.id))
      onAviso?.(`"${servico.nome}" saiu do catálogo.`)
    } catch (e) {
      onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível remover.', 'erro')
    } finally {
      setRemovendo(null)
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-md bg-surface-sunken" />
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
      <h2 className="text-h2 text-ink">Serviços</h2>
      <p className="mt-2 max-w-prose text-body-sm text-ink-muted">
        O que o cliente vê ao escolher um horário. A duração define quanto tempo o
        horário ocupa na agenda.
      </p>

      {servicos.length === 0 ? (
        <p className="mt-6 rounded-md bg-surface-sunken p-4 text-body-sm text-ink-muted">
          Nenhum serviço no catálogo ainda.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {servicos.map((servico) => (
            <li
              key={servico.id}
              className="flex flex-col rounded-md border border-border bg-surface-raised p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate text-h3 text-ink">{servico.nome}</h3>
                <p className="shrink-0 text-body font-semibold text-ink">
                  {preco(servico.preco)}
                </p>
              </div>

              <p className="mt-1 text-body-sm text-ink-muted">
                {duracao(servico.duracao_minutos)}
              </p>

              {servico.descricao ? (
                <p className="mt-2 text-body-sm text-ink-muted">{servico.descricao}</p>
              ) : null}

              <div className="mt-auto flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={removendo === servico.id}
                  onClick={() => abrir(servico)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  loading={removendo === servico.id}
                  onClick={() => desativar(servico)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button full className="mt-6 md:w-auto" onClick={() => abrir(null)}>
        Novo serviço
      </Button>

      <p className="mt-3 text-body-sm text-ink-muted">
        Remover só tira do catálogo: os agendamentos antigos continuam mostrando o
        serviço que o cliente escolheu.
      </p>

      <Sheet
        aberta={edicao !== null}
        titulo={edicao?.id ? 'Editar serviço' : 'Novo serviço'}
        onFechar={salvando ? undefined : () => setEdicao(null)}
      >
        <form onSubmit={salvar} noValidate className="flex flex-col gap-5">
          <Input
            label="Nome"
            maxLength={100}
            placeholder="Manicure simples"
            value={edicao?.nome ?? ''}
            error={erros.nome}
            disabled={salvando}
            onChange={(e) => mudar('nome', e.target.value)}
          />

          <Input
            label="Preço"
            inputMode="decimal"
            placeholder="35.90"
            value={edicao?.preco ?? ''}
            error={erros.preco}
            disabled={salvando}
            onChange={(e) => mudar('preco', e.target.value)}
          />

          <Input
            label="Duração (minutos)"
            type="number"
            inputMode="numeric"
            min={15}
            max={480}
            step={5}
            value={edicao?.duracao_minutos ?? ''}
            error={erros.duracao_minutos}
            hint="Entre 15 e 480, de 5 em 5."
            disabled={salvando}
            onChange={(e) => mudar('duracao_minutos', e.target.value)}
          />

          <Textarea
            label="Descrição"
            maxLength={500}
            placeholder="Inclui esmaltação e cutículas."
            value={edicao?.descricao ?? ''}
            error={erros.descricao}
            disabled={salvando}
            onChange={(e) => mudar('descricao', e.target.value)}
          />

          {erroGeral ? (
            <p
              role="alert"
              className="rounded-sm bg-status-recusado-soft p-4 text-body-sm text-status-recusado"
            >
              {erroGeral}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button type="submit" full loading={salvando}>
              Salvar
            </Button>
            <Button variant="ghost" full disabled={salvando} onClick={() => setEdicao(null)}>
              Voltar
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  )
}
