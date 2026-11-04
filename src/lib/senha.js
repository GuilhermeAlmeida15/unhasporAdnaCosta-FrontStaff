import { SENHA_MINIMA } from './api'

/**
 * O backend valida o tamanho com `strlen()`, que conta BYTES e não
 * caracteres. Em UTF-8 um "ç" ocupa 2 bytes, então "Ótimo123!" tem 9
 * caracteres e 10 bytes — e passa. Contar `.length` aqui recusaria uma senha
 * que a API aceita, por isso medimos em bytes também.
 */
export function bytesDe(texto) {
  return new TextEncoder().encode(texto).length
}

// As mesmas expressões de AuthService::validarSenha, na mesma ordem. Se uma
// mudar lá, muda aqui: a lista da tela só vale enquanto prometer exatamente
// o que a API cobra.
const CLASSES = [
  { id: 'maiuscula', rotulo: 'Uma letra maiúscula', teste: /\p{Lu}/u },
  { id: 'minuscula', rotulo: 'Uma letra minúscula', teste: /\p{Ll}/u },
  { id: 'numero', rotulo: 'Um número', teste: /\p{Nd}/u },
  { id: 'simbolo', rotulo: 'Um símbolo (! @ # $ …)', teste: /[^\p{L}\p{N}]/u },
]

/**
 * Os requisitos de uma senha nova. `atual` e `repetida` são opcionais: a
 * criação de um Administrador não tem senha anterior nem campo de repetição,
 * então só mostra as regras que a rota dela valida.
 */
export function requisitosDaSenha(nova, { atual, repetida } = {}) {
  const regras = [
    {
      id: 'tamanho',
      rotulo: `Pelo menos ${SENHA_MINIMA} caracteres`,
      ok: bytesDe(nova) >= SENHA_MINIMA,
    },
    ...CLASSES.map(({ id, rotulo, teste }) => ({ id, rotulo, ok: teste.test(nova) })),
  ]

  if (atual !== undefined) {
    regras.push({
      id: 'diferente',
      rotulo: 'Diferente da senha atual',
      ok: nova !== '' && nova !== atual,
    })
  }

  if (repetida !== undefined) {
    regras.push({
      id: 'confere',
      rotulo: 'As duas senhas conferem',
      ok: nova !== '' && nova === repetida,
    })
  }

  return regras
}

export function todosAtendidos(requisitos) {
  return requisitos.every((regra) => regra.ok)
}
