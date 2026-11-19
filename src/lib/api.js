// Backend: agendamentos-unhasporAdnaCosta-backend (PHP + PostgreSQL), publicado
// em https://agendamentos-unhasporadnacosta-backend.onrender.com/api — é essa
// base que entra aqui, porque cada função abaixo acrescenta a rota (`/servicos`,
// `/categorias`, `/auth/me`...).
//
// Em desenvolvimento, VITE_API_URL=/api (veja .env.development.local) manda as
// chamadas para o próprio Vite, que repassa para a API pelo lado do servidor:
// front e API viram a mesma origem no navegador, então não há CORS e o cookie
// de sessão (`sessao`) vai e volta sozinho. Com a URL fixa aqui, o navegador
// faz a chamada direto e o CORS volta a valer — aí a origem do front precisa
// estar em FRONTEND_URL no servidor.
//
// A barra do fim sai fora: cada função abaixo começa a rota com "/", e
// ".../api/" + "/servicos" viraria ".../api//servicos" — caminho que o
// roteador do backend não reconhece, devolvendo 404 "Rota não encontrada".
const BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'https://agendamentos-unhasporadnacosta-backend.onrender.com/api'
).replace(/\/+$/, '')

/** O backend exige ao menos isto numa senha nova (AuthService::SENHA_MINIMA). */
export const SENHA_MINIMA = 10

/**
 * Erro de API já traduzido. A API escreve a mensagem em português claro no
 * campo `erro` — é ela que a tela mostra, nunca um texto genérico nosso.
 * Rotas de validação (expediente, bloqueios, serviços, motivo) mandam junto um
 * `campos` com a mensagem de cada campo.
 */
export class ApiError extends Error {
  constructor(mensagem, { status = 0, campos = {}, dados = null } = {}) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos
    this.dados = dados
  }
}

const ERRO_DE_REDE =
  'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.'
const ERRO_INESPERADO = 'O servidor respondeu de um jeito inesperado. Tente de novo.'

function comQuery(path, query) {
  const pares = Object.entries(query ?? {}).filter(
    ([, valor]) => valor !== undefined && valor !== null && valor !== ''
  )
  if (pares.length === 0) return path

  return `${path}?${new URLSearchParams(pares)}`
}

async function pedir(metodo, path, { body, query } = {}) {
  let resposta
  try {
    resposta = await fetch(`${BASE_URL}${comQuery(path, query)}`, {
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

  // 204 (Response::vazia) não tem corpo.
  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null)

  if (!resposta.ok) {
    throw new ApiError(dados?.erro ?? dados?.mensagem ?? ERRO_INESPERADO, {
      status: resposta.status,
      campos: dados?.campos ?? {},
      dados,
    })
  }

  return dados
}

// --- sessão ---

/** Entrar como Administrador (papel `supervisor`) ou Supervisora (papel `admin`). */
export function loginStaff({ email, senha }) {
  return pedir('POST', '/auth/staff/login', { body: { email, senha } })
}

/** Quem está na sessão atual. 401 quando o cookie não vale mais. */
export function obterSessao() {
  return pedir('GET', '/auth/me')
}

export function logout() {
  return pedir('POST', '/auth/logout')
}

/** Obrigatória no primeiro acesso de quem recebeu senha temporária. */
export function trocarSenha({ senhaAtual, novaSenha }) {
  return pedir('POST', '/auth/senha', {
    body: { senha_atual: senhaAtual, nova_senha: novaSenha },
  })
}

// --- agendamentos (Administrador e Supervisora) ---

export function listarAgendamentos({ status, de, ate } = {}) {
  return pedir('GET', '/supervisor/agendamentos', { query: { status, de, ate } })
}

export function confirmarAgendamento(id) {
  return pedir('PATCH', `/supervisor/agendamentos/${id}/confirmar`)
}

/** Recusa um `pendente`. O motivo é obrigatório e vai para o cliente ler. */
export function recusarAgendamento(id, motivo) {
  return pedir('PATCH', `/supervisor/agendamentos/${id}/recusar`, { body: { motivo } })
}

/** Cancela um `confirmado`. O motivo é obrigatório e vai para o cliente ler. */
export function cancelarAgendamento(id, motivo) {
  return pedir('PATCH', `/supervisor/agendamentos/${id}/cancelar`, { body: { motivo } })
}

// --- expediente do salão (Administrador e Supervisora) ---

export function listarExpediente() {
  return pedir('GET', '/supervisor/expediente')
}

/** Substitui a semana inteira. Uma lista vazia fecha o salão todos os dias. */
export function salvarExpediente(faixas) {
  return pedir('PUT', '/supervisor/expediente', { body: { faixas } })
}

// --- bloqueios (Administrador e Supervisora) ---

export function listarBloqueios({ de, ate } = {}) {
  return pedir('GET', '/supervisor/bloqueios', { query: { de, ate } })
}

/** 409 quando há agendamento no período: o erro traz `dados.agendamentos`. */
export function criarBloqueio({ inicio, fim, motivo }) {
  return pedir('POST', '/supervisor/bloqueios', { body: { inicio, fim, motivo } })
}

export function removerBloqueio(id) {
  return pedir('DELETE', `/supervisor/bloqueios/${id}`)
}

// --- equipe (só Supervisora) ---

export function listarUsuarios() {
  return pedir('GET', '/admin/usuarios')
}

/**
 * Cria um Administrador (papel `supervisor` na API). A senha informada é
 * temporária: a API a envia por e-mail e obriga a troca no primeiro acesso.
 */
export function criarAdministrador({ nome, email, senha }) {
  return pedir('POST', '/admin/usuarios', { body: { nome, email, senha } })
}

/** Desativar também derruba todas as sessões abertas da pessoa. */
export function definirUsuarioAtivo(id, ativo) {
  return pedir('PATCH', `/admin/usuarios/${id}/ativo`, { body: { ativo } })
}

// --- serviços (leitura pública, escrita só da Supervisora) ---

export function listarServicos({ categoriaId } = {}) {
  return pedir('GET', '/servicos', { query: { categoria_id: categoriaId } })
}

export function criarServico(servico) {
  return pedir('POST', '/servicos', { body: servico })
}

export function atualizarServico(id, servico) {
  return pedir('PUT', `/servicos/${id}`, { body: servico })
}

/** Não apaga: desativa, para os agendamentos antigos seguirem apontando nele. */
export function removerServico(id) {
  return pedir('DELETE', `/servicos/${id}`)
}

// --- categorias (leitura pública, escrita só da Supervisora) ---

/** Cada categoria traz `servicos`: quantos serviços ativos estão nela. */
export function listarCategorias() {
  return pedir('GET', '/categorias')
}

export function criarCategoria(nome) {
  return pedir('POST', '/categorias', { body: { nome } })
}

/** Renomear vale para todos os serviços da categoria de uma vez. */
export function atualizarCategoria(id, nome) {
  return pedir('PUT', `/categorias/${id}`, { body: { nome } })
}

/** 409 enquanto houver serviço ativo na categoria; o erro diz quantos. */
export function removerCategoria(id) {
  return pedir('DELETE', `/categorias/${id}`)
}
