import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import RequisitosDaSenha from '../components/RequisitosDaSenha'
import Sheet from '../components/Sheet'
import { ApiError, SENHA_MINIMA, criarAdministrador, definirUsuarioAtivo, listarUsuarios } from '../lib/api'
import { useErrosDeCampo } from '../lib/erros'
import { nomeDoPapel } from '../lib/papel'
import { requisitosDaSenha, todosAtendidos } from '../lib/senha'

/**
 * Só a Supervisora chega aqui (`/api/admin/usuarios`). O backend cria apenas
 * Administradores — outra Supervisora sai pelo seeder, não por tela — e não
 * tem rota para editar nem apagar: o que existe é ativar e desativar.
 */
export default function Equipe({ usuario, onAviso }) {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [alterando, setAlterando] = useState(null)

  const [novo, setNovo] = useState(null)
  const [criando, setCriando] = useState(false)
  const { erros, setErros, limpar, limparTudo } = useErrosDeCampo()
  const [erroGeral, setErroGeral] = useState(null)

  // Mexer num campo apaga o aviso daquele campo, nunca o dos outros.
  function mudar(campo, valor) {
    setNovo((atual) => ({ ...atual, [campo]: valor }))
    limpar(campo)
    setErroGeral(null)
  }

  // Recarrega sem piscar o esqueleto: usada depois de criar alguém.
  async function recarregar() {
    try {
      const dados = await listarUsuarios()
      setUsuarios(dados?.usuarios ?? [])
      setErro(null)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar a equipe.')
    }
  }

  // Na montagem `carregando` já nasce true, então aqui só resta desligá-lo.
  useEffect(() => {
    let ativo = true

    async function buscar() {
      try {
        const dados = await listarUsuarios()
        if (ativo) {
          setUsuarios(dados?.usuarios ?? [])
          setErro(null)
        }
      } catch (e) {
        if (ativo) {
          setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar a equipe.')
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

  async function alternarAtivo(pessoa) {
    setAlterando(pessoa.id)
    try {
      await definirUsuarioAtivo(pessoa.id, !pessoa.ativo)
      setUsuarios((atuais) =>
        atuais.map((u) => (u.id === pessoa.id ? { ...u, ativo: !pessoa.ativo } : u))
      )
      onAviso?.(
        pessoa.ativo
          ? `${pessoa.nome} foi desativado e suas sessões foram encerradas.`
          : `${pessoa.nome} voltou a ter acesso.`
      )
    } catch (e) {
      onAviso?.(e instanceof ApiError ? e.message : 'Não foi possível alterar.', 'erro')
    } finally {
      setAlterando(null)
    }
  }

  async function enviarNovo(evento) {
    evento.preventDefault()
    if (criando) return

    const locais = {}
    if (novo.nome.trim() === '') locais.nome = 'Informe o nome.'
    if (novo.email.trim() === '') locais.email = 'Informe o e-mail.'
    if (!todosAtendidos(requisitosDaSenha(novo.senha))) {
      locais.senha = 'A senha temporária ainda não atende os requisitos abaixo.'
    }
    if (Object.keys(locais).length > 0) {
      setErros(locais)
      return
    }

    setCriando(true)
    limparTudo()
    setErroGeral(null)
    try {
      await criarAdministrador({
        nome: novo.nome.trim(),
        email: novo.email.trim(),
        senha: novo.senha,
      })
      setNovo(null)
      await recarregar()
      onAviso?.('Administrador criado. A senha temporária foi enviada por e-mail.')
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.campos).length > 0) {
        setErros(e.campos)
      } else {
        setErroGeral(e instanceof ApiError ? e.message : 'Não foi possível criar a conta.')
      }
    } finally {
      setCriando(false)
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-h2 text-ink">Equipe</h2>
          <p className="mt-2 text-body-sm text-ink-muted">
            Quem pode entrar e responder os pedidos de horário.
          </p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {usuarios.map((pessoa) => {
          const euMesma = pessoa.id === usuario?.id

          return (
            <li
              key={pessoa.id}
              className="flex flex-col rounded-md border border-border bg-surface-raised p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-h3 text-ink">{pessoa.nome}</h3>
                  <p className="mt-0.5 truncate text-body-sm text-ink-muted">{pessoa.email}</p>
                </div>

                <span
                  className={`shrink-0 rounded-pill px-3 py-1 text-badge ${
                    pessoa.ativo
                      ? 'bg-brand-soft text-brand'
                      : 'bg-status-cancelado-soft text-status-cancelado'
                  }`}
                >
                  {nomeDoPapel(pessoa.papel)}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <p className="text-body-sm text-ink-muted">
                  {pessoa.ativo ? 'Tem acesso' : 'Sem acesso'}
                </p>

                {/* O backend só mexe em supervisor; a própria conta não se desativa. */}
                {pessoa.papel === 'supervisor' && !euMesma ? (
                  <Button
                    variant={pessoa.ativo ? 'destructive' : 'secondary'}
                    loading={alterando === pessoa.id}
                    onClick={() => alternarAtivo(pessoa)}
                  >
                    {pessoa.ativo ? 'Desativar' : 'Reativar'}
                  </Button>
                ) : (
                  <span className="text-caption text-ink-muted">
                    {euMesma ? 'Você' : 'Conta da proprietária'}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <Button
        full
        className="mt-6 md:w-auto"
        onClick={() => {
          setNovo({ nome: '', email: '', senha: '' })
          limparTudo()
          setErroGeral(null)
        }}
      >
        Novo Administrador
      </Button>

      <p className="mt-3 max-w-prose text-body-sm text-ink-muted">
        Para tirar alguém da equipe, desative a conta: o histórico de quem respondeu cada
        pedido continua de pé. O backend não apaga contas.
      </p>

      <Sheet
        aberta={novo !== null}
        titulo="Novo Administrador"
        descricao="A pessoa recebe a senha temporária por e-mail e troca por uma própria no primeiro acesso."
        onFechar={criando ? undefined : () => setNovo(null)}
      >
        <form onSubmit={enviarNovo} noValidate className="flex flex-col gap-5">
          <Input
            label="Nome"
            maxLength={150}
            placeholder="Maria Souza"
            value={novo?.nome ?? ''}
            error={erros.nome}
            disabled={criando}
            onChange={(e) => mudar('nome', e.target.value)}
          />

          <Input
            label="E-mail"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="maria@exemplo.com"
            value={novo?.email ?? ''}
            error={erros.email}
            disabled={criando}
            onChange={(e) => mudar('email', e.target.value)}
          />

          <div>
            <Input
              label="Senha temporária"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={`Ao menos ${SENHA_MINIMA} caracteres`}
              hint="Ela vai no e-mail de boas-vindas e só serve para o primeiro acesso."
              value={novo?.senha ?? ''}
              error={erros.senha}
              disabled={criando}
              onChange={(e) => mudar('senha', e.target.value)}
            />

            <RequisitosDaSenha requisitos={requisitosDaSenha(novo?.senha ?? '')} />
          </div>

          {erroGeral ? (
            <p
              role="alert"
              className="rounded-sm bg-status-recusado-soft p-4 text-body-sm text-status-recusado"
            >
              {erroGeral}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              full
              loading={criando}
              disabled={
                (novo?.nome ?? '').trim() === '' ||
                (novo?.email ?? '').trim() === '' ||
                !todosAtendidos(requisitosDaSenha(novo?.senha ?? ''))
              }
            >
              Criar e enviar e-mail
            </Button>
            <Button variant="ghost" full disabled={criando} onClick={() => setNovo(null)}>
              Voltar
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  )
}
