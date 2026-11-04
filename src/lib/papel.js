// O papel técnico da API nunca aparece na interface. A tradução mora aqui.
//
//   API `supervisor` → "Administrador": agenda do dia a dia, expediente,
//                      bloqueios. Não mexe em equipe nem em serviços.
//   API `admin`      → "Supervisora": tudo do Administrador, mais a gestão
//                      da equipe e do catálogo de serviços.
const NOMES = {
  supervisor: 'Administrador',
  admin: 'Supervisora',
  cliente: 'Cliente',
}

export function nomeDoPapel(papel) {
  return NOMES[papel] ?? 'Equipe'
}

/** Só a Supervisora (papel `admin`) gerencia equipe e serviços. */
export function podeGerenciarEquipe(usuario) {
  return usuario?.papel === 'admin'
}

export function podeGerenciarServicos(usuario) {
  return usuario?.papel === 'admin'
}

/** Administrador e Supervisora usam as rotas de `/api/supervisor`. */
export function ehEquipe(usuario) {
  return usuario?.papel === 'supervisor' || usuario?.papel === 'admin'
}
