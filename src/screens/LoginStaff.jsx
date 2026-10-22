import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import { ApiError, loginStaff } from '../lib/api'

function MarcaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7"
      aria-hidden="true"
    >
      <path d="M9 3h6v3H9z" />
      <path d="M7.5 10.5A2.5 2.5 0 0 1 10 8h4a2.5 2.5 0 0 1 2.5 2.5V18a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3z" />
      <path d="M7.5 13.5h9" />
    </svg>
  )
}

function AlertaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px size-5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function OlhoIcon({ aberto }) {
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
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      {aberto ? <path d="M4 20 20 4" /> : null}
    </svg>
  )
}

export default function LoginStaff({ onEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [campos, setCampos] = useState({})
  // Muda a cada erro para o banner tremer de novo, mesmo com a mesma mensagem.
  const [tentativa, setTentativa] = useState(0)

  const podeEnviar = email.trim() !== '' && senha !== ''

  function falhar(mensagem, camposDaApi = {}) {
    setErro(mensagem)
    setCampos(camposDaApi)
    setTentativa((n) => n + 1)
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return

    setErro(null)
    setCampos({})

    if (!podeEnviar) {
      falhar('Preencha o e-mail e a senha para entrar.', {
        email: email.trim() === '' ? 'Informe seu e-mail.' : undefined,
        senha: senha === '' ? 'Informe sua senha.' : undefined,
      })
      return
    }

    setEnviando(true)
    try {
      const sessao = await loginStaff({ email: email.trim(), senha })
      onEntrar?.(sessao)
    } catch (e) {
      if (e instanceof ApiError) {
        falhar(e.message, e.campos)
      } else {
        falhar('Algo deu errado ao entrar. Tente de novo.')
      }
      setSenha('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col px-4 pt-14 pb-6">
      <header className="animate-rise">
        <div className="flex size-14 items-center justify-center rounded-md bg-brand-soft text-brand">
          <MarcaIcon />
        </div>

        <p className="mt-5 text-caption text-ink-muted">Unhas por</p>
        <h2 className="text-h2 text-ink">Adna Costa</h2>
      </header>

      <div className="mt-8">
        <p className="text-label uppercase text-brand">Área da equipe</p>
        <h1 className="mt-2 text-h1 text-ink">Entrar</h1>
        <p className="mt-2 text-body text-ink-muted">
          Use o e-mail e a senha da sua conta da equipe.
        </p>
      </div>

      {erro ? (
        <div
          key={tentativa}
          role="alert"
          className="mt-6 flex animate-shake gap-3 rounded-sm bg-status-recusado-soft p-4 text-body-sm text-status-recusado"
        >
          <AlertaIcon />
          <p>{erro}</p>
        </div>
      ) : null}

      <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
        <Input
          label="E-mail"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="voce@exemplo.com"
          value={email}
          error={campos.email}
          disabled={enviando}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Senha"
          type={verSenha ? 'text' : 'password'}
          name="senha"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={senha}
          error={campos.senha}
          disabled={enviando}
          onChange={(e) => setSenha(e.target.value)}
          trailing={
            <button
              type="button"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={verSenha}
              className="flex size-10 items-center justify-center rounded-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-brand-softer hover:text-brand active:bg-brand-softer"
            >
              <OlhoIcon aberto={verSenha} />
            </button>
          }
        />

        <Button type="submit" full loading={enviando} disabled={!podeEnviar}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-body-sm text-ink-muted">
        Esqueceu a senha? Peça à supervisora uma senha temporária — você troca
        por uma nova no primeiro acesso.
      </p>

      <p className="mt-auto pt-10 text-caption text-ink-muted">
        Administradora e Supervisora entram por aqui. Cliente agenda pelo app,
        com um código de 6 dígitos.
      </p>
    </main>
  )
}
