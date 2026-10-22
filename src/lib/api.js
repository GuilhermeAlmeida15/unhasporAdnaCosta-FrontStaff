// Backend: agendamentos-unhasporAdnaCosta-backend (PHP + PostgreSQL), em
// http://localhost:8080. Em desenvolvimento o Vite faz proxy de `/api` para lá
// (ver vite.config.js), então front e API ficam na mesma origem e o cookie de
// sessão (`sessao`) vai e volta sozinho — por isso todo fetch leva credentials.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

/**
 * Erro de API já traduzido. A API escreve a mensagem em português claro no
 * campo `erro` — é ela que a tela mostra, nunca um texto genérico nosso.
 */
export class ApiError extends Error {
  constructor(mensagem, { status = 0, campos = {} } = {}) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos
  }
}

const ERRO_DE_REDE =
  'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.'
const ERRO_INESPERADO = 'O servidor respondeu de um jeito inesperado. Tente de novo.'

async function pedir(metodo, path, body) {
  let resposta
  try {
    resposta = await fetch(`${BASE_URL}${path}`, {
      method: metodo,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(ERRO_DE_REDE)
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    throw new ApiError(dados?.erro ?? dados?.mensagem ?? ERRO_INESPERADO, {
      status: resposta.status,
      campos: dados?.campos ?? {},
    })
  }

  return dados
}

/** Entrar como Administrador ou Supervisora: e-mail + senha. */
export function loginStaff({ email, senha }) {
  return pedir('POST', '/auth/staff/login', { email, senha })
}

/** Quem está na sessão atual. 401 quando o cookie não vale mais. */
export function obterSessao() {
  return pedir('GET', '/auth/me')
}

/** Encerra a sessão e limpa o cookie no servidor. */
export function logout() {
  return pedir('POST', '/auth/logout')
}
