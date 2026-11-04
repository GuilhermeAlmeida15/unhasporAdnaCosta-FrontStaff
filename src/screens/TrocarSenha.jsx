import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import RequisitosDaSenha from '../components/RequisitosDaSenha'
import { ApiError, SENHA_MINIMA, trocarSenha } from '../lib/api'
import { requisitosDaSenha, todosAtendidos } from '../lib/senha'

/**
 * Obrigatória no primeiro acesso de quem a Supervisora criou: a API marca
 * `trocar_senha` e recusa as telas de `/api/supervisor` até a troca.
 */
export default function TrocarSenha({ obrigatoria = false, onTrocada, onCancelar }) {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [repetida, setRepetida] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [campos, setCampos] = useState({})
  const [tentativa, setTentativa] = useState(0)

  // Digitar de novo apaga o aviso do envio anterior.
  function mudar(definir, ...chaves) {
    return (evento) => {
      definir(evento.target.value)
      setErro(null)
      setCampos((atuais) => {
        const resto = { ...atuais }
        chaves.forEach((chave) => delete resto[chave])

        return resto
      })
    }
  }

  const requisitos = requisitosDaSenha(novaSenha, { atual: senhaAtual, repetida })
  const podeEnviar = senhaAtual !== '' && todosAtendidos(requisitos)

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

    // A lista de requisitos já barra o botão; isto é só a rede de segurança
    // para um envio pelo teclado.
    if (!podeEnviar) {
      falhar('Confira os requisitos da nova senha antes de salvar.')
      return
    }

    setEnviando(true)
    try {
      await trocarSenha({ senhaAtual, novaSenha })
      onTrocada?.()
    } catch (e) {
      falhar(
        e instanceof ApiError ? e.message : 'Algo deu errado. Tente de novo.',
        e instanceof ApiError ? e.campos : {}
      )
      setSenhaAtual('')
      setNovaSenha('')
      setRepetida('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pt-14 pb-6 sm:justify-center sm:py-10">
      <div className="w-full max-w-sm sm:rounded-lg sm:border sm:border-border sm:bg-surface-raised sm:p-8 sm:shadow-sm">
      <div>
        <p className="text-label uppercase text-brand">
          {obrigatoria ? 'Primeiro acesso' : 'Sua conta'}
        </p>
        <h1 className="mt-2 text-h1 text-ink">Defina uma nova senha</h1>
        <p className="mt-2 text-body text-ink-muted">
          {obrigatoria
            ? 'A senha que você recebeu por e-mail é temporária. Escolha uma só sua para continuar.'
            : 'Escolha uma senha que atenda aos requisitos listados abaixo.'}
        </p>
      </div>

      {erro ? (
        <div
          key={tentativa}
          role="alert"
          className="mt-6 animate-shake rounded-sm bg-status-recusado-soft p-4 text-body-sm text-status-recusado"
        >
          {erro}
        </div>
      ) : null}

      <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-5">
        <Input
          label="Senha atual"
          type="password"
          name="senha_atual"
          autoComplete="current-password"
          placeholder={obrigatoria ? 'A que veio no e-mail' : 'Sua senha de hoje'}
          value={senhaAtual}
          error={campos.senha_atual}
          disabled={enviando}
          onChange={mudar(setSenhaAtual, 'senha_atual')}
        />

        <Input
          label="Nova senha"
          type="password"
          name="nova_senha"
          autoComplete="new-password"
          placeholder={`Ao menos ${SENHA_MINIMA} caracteres`}
          value={novaSenha}
          error={campos.nova ?? campos.nova_senha}
          disabled={enviando}
          onChange={mudar(setNovaSenha, 'nova', 'nova_senha', 'repetida')}
        />

        <Input
          label="Repita a nova senha"
          type="password"
          name="repetir_senha"
          autoComplete="new-password"
          placeholder="A mesma de cima"
          value={repetida}
          error={campos.repetida}
          disabled={enviando}
          onChange={mudar(setRepetida, 'repetida')}
        />

        <RequisitosDaSenha requisitos={requisitos} />

        <Button type="submit" full loading={enviando} disabled={!podeEnviar}>
          Salvar nova senha
        </Button>

        {!obrigatoria && onCancelar ? (
          <Button variant="ghost" full onClick={onCancelar} disabled={enviando}>
            Agora não
          </Button>
        ) : null}
      </form>

      </div>

      {obrigatoria ? (
        <p className="mt-auto w-full max-w-sm pt-10 text-caption text-ink-muted sm:mt-6 sm:pt-0 sm:text-center">
          Ao salvar, as outras sessões abertas com a senha antiga são encerradas.
        </p>
      ) : null}
    </main>
  )
}
