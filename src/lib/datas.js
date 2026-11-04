// O backend fala AAAA-MM-DDTHH:MM (e devolve "2026-10-20 14:00:00" do
// Postgres). Tudo aqui trata as datas como horário local do salão — não há
// fuso na API, então converter para UTC só criaria bug de uma hora.

const DIAS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const DIAS_DA_SEMANA = DIAS.map((nome, indice) => ({
  valor: indice,
  nome,
  curto: DIAS_CURTOS[indice],
}))

/** Aceita "2026-10-20 14:00:00" e "2026-10-20T14:00" sem depender do fuso. */
export function lerDataHora(texto) {
  if (typeof texto !== 'string') return null

  const m = texto.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!m) return null

  const [, ano, mes, dia, hora, minuto] = m.map(Number)

  return new Date(ano, mes - 1, dia, hora, minuto)
}

/** O formato que a API espera num corpo: "2026-10-20T14:00". */
export function paraApi(data) {
  const doisDigitos = (n) => String(n).padStart(2, '0')

  return (
    `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}` +
    `T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
  )
}

/** "2026-10-20", o formato dos filtros `de`/`ate`. */
export function paraDataApi(data) {
  return paraApi(data).slice(0, 10)
}

export function hojeApi() {
  return paraDataApi(new Date())
}

export function horas(texto) {
  const data = lerDataHora(texto)

  return data
    ? `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
    : '--:--'
}

/** "Seg, 20 de out" — e "Hoje"/"Amanhã" quando for o caso. */
export function diaPorExtenso(texto) {
  const data = lerDataHora(texto)
  if (!data) return ''

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dia = new Date(data)
  dia.setHours(0, 0, 0, 0)

  const diferenca = Math.round((dia - hoje) / 86400000)
  if (diferenca === 0) return 'Hoje'
  if (diferenca === 1) return 'Amanhã'
  if (diferenca === -1) return 'Ontem'

  return dia.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function preco(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function duracao(minutos) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60

  if (h === 0) return `${m} min`

  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}
