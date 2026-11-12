import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Sheet from '../components/Sheet'
import {
  ApiError,
  atualizarCategoria,
  criarCategoria,
  listarCategorias,
  removerCategoria,
} from '../lib/api'
import { useErrosDeCampo } from '../lib/erros'

/** Os grupos do catálogo. Só a Supervisora escreve em `/api/categorias`. */
export default function Categorias({ onAviso }) {
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [removendo, setRemovendo] = useState(null)

  const [edicao, setEdicao] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const { erros, setErros, limpar, limparTudo } = useErrosDeCampo()
  const [erroGeral, setErroGeral] = useState(null)

  function mudar(valor) {
    setEdicao((atual) => ({ ...atual, nome: valor }))
    limpar('nome')
    setErroGeral(null)
  }

  async function recarregar() {
    try {
      const dados = await listarCategorias()
      setCategorias(dados?.categorias ?? [])
      setErro(null)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar as categorias.')
    }
  }

  useEffect(() => {
    let ativo = true

    async function buscar() {
      try {
        const dados = await listarCategorias()
        if (ativo) {
          setCategorias(dados?.categorias ?? [])
          setErro(null)
        }
      } catch (e) {
        if (ativo) {
          setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar as categorias.')
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

  function abrir(categoria) {
    setEdicao(categoria ? { id: categoria.id, nome: categoria.nome } : { id: null, nome: '' })
    limparTudo()
    setErroGeral(null)
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return

    const nome = edicao.nome.trim()
    if (nome === '') {
      setErros({ nome: 'O nome da categoria é obrigatório. Ex.: "Alongamento".' })
      return
    }

    setSalvando(true)
    limparTudo()
    setErroGeral(null)

    try {
      if (edicao.id) {
        await atualizarCategoria(edicao.id, nome)
        onAviso?.(`"${nome}" atualizada.`)
      } else {
        await criarCategoria(nome)
        onAviso?.(`"${nome}" criada.`)
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

  async function remover(categoria) {
    setRemovendo(categoria.id)
    try {
      await removerCategoria(categoria.id)
      setCategorias((atuais) => atuais.filter((c) => c.id !== categoria.id))
      onAviso?.(`"${categoria.nome}" removida.`)
    } catch (e) {
      // 409: a API diz quantos serviços ainda estão na categoria.
      onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível remover.', 'erro')
    } finally {
      setRemovendo(null)
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
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
      <h2 className="text-h2 text-ink">Categorias</h2>
      <p className="mt-2 max-w-prose text-body-sm text-ink-muted">
        Os grupos do catálogo. Todo serviço entra em uma delas, e é por elas que o
        cliente separa e filtra os serviços na tela dele.
      </p>

      {categorias.length === 0 ? (
        <p className="mt-6 rounded-md bg-surface-sunken p-4 text-body-sm text-ink-muted">
          Nenhuma categoria ainda. Crie a primeira para conseguir cadastrar serviços.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {categorias.map((categoria) => (
            <li
              key={categoria.id}
              className="flex flex-col rounded-md border border-border bg-surface-raised p-4"
            >
              <h3 className="min-w-0 truncate text-h3 text-ink">{categoria.nome}</h3>

              <p className="mt-1 text-body-sm text-ink-muted">
                {categoria.servicos === 1 ? '1 serviço' : `${categoria.servicos} serviços`}
              </p>

              <div className="mt-auto flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={removendo === categoria.id}
                  onClick={() => abrir(categoria)}
                >
                  Renomear
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  loading={removendo === categoria.id}
                  onClick={() => remover(categoria)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button full className="mt-6 md:w-auto" onClick={() => abrir(null)}>
        Nova categoria
      </Button>

      <p className="mt-3 text-body-sm text-ink-muted">
        Renomear vale para todos os serviços do grupo. Só dá para remover uma categoria
        vazia: mude a categoria dos serviços antes.
      </p>

      <Sheet
        aberta={edicao !== null}
        titulo={edicao?.id ? 'Renomear categoria' : 'Nova categoria'}
        onFechar={salvando ? undefined : () => setEdicao(null)}
      >
        <form onSubmit={salvar} noValidate className="flex flex-col gap-5">
          <Input
            label="Nome"
            maxLength={60}
            placeholder="Alongamento"
            value={edicao?.nome ?? ''}
            error={erros.nome}
            disabled={salvando}
            onChange={(e) => mudar(e.target.value)}
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
