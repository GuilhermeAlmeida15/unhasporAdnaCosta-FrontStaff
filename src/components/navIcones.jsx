// Ícones de traço; o da seção ativa vira sólido em `brand` para reforçar a
// seleção. São os únicos ícones preenchidos do app. Compartilhados entre a
// BottomNav (celular) e a SideNav (desktop).
const ICONES = {
  agenda: {
    traco: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="3" />
        <path d="M8 3v4M16 3v4M3.5 10h17" />
      </>
    ),
    solido: (
      <path d="M8 2.25a.75.75 0 0 1 .75.75v1.25h6.5V3a.75.75 0 0 1 1.5 0v1.3A3.75 3.75 0 0 1 20.25 8v.5H3.75V8a3.75 3.75 0 0 1 3.5-3.7V3A.75.75 0 0 1 8 2.25ZM3.75 10h16.5v6.75a3.75 3.75 0 0 1-3.75 3.75H7.5a3.75 3.75 0 0 1-3.75-3.75V10Z" />
    ),
  },
  expediente: {
    traco: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 1.75" />
      </>
    ),
    solido: (
      <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm.75 4.75a.75.75 0 0 0-1.5 0v4.9c0 .27.14.51.37.65l3 1.75a.75.75 0 1 0 .76-1.3l-2.63-1.53V7.25Z" />
    ),
  },
  equipe: {
    traco: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-1.6-3.9" />
      </>
    ),
    solido: (
      <path d="M9 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2.5 20a6.5 6.5 0 0 1 13 0 .75.75 0 0 1-.75.75H3.25A.75.75 0 0 1 2.5 20Zm14.3-15.3a.75.75 0 0 1 1.05-.15 5 5 0 0 1 0 7.9.75.75 0 1 1-.9-1.2 3.5 3.5 0 0 0 0-5.6.75.75 0 0 1-.15-1.05Zm.4 11.05a.75.75 0 0 1 1.02-.28A6.75 6.75 0 0 1 21.5 20a.75.75 0 0 1-.75.75h-2.1a8 8 0 0 0-1.73-4.22.75.75 0 0 1 .28-.78Z" />
    ),
  },
  servicos: {
    traco: (
      <>
        <path d="M9 3h6v3H9z" />
        <path d="M7.5 10.5A2.5 2.5 0 0 1 10 8h4a2.5 2.5 0 0 1 2.5 2.5V18a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3z" />
        <path d="M7.5 13.5h9" />
      </>
    ),
    solido: (
      <path d="M8.25 2.75c0-.41.34-.75.75-.75h6c.41 0 .75.34.75.75V6h-7.5V2.75ZM6.75 10.5A3.25 3.25 0 0 1 10 7.25h4a3.25 3.25 0 0 1 3.25 3.25v2.25H6.75V10.5Zm0 4.25h10.5V18A3.75 3.75 0 0 1 13.5 21.75h-3A3.75 3.75 0 0 1 6.75 18v-3.25Z" />
    ),
  },
}

export default function Icone({ nome, ativo }) {
  const icone = ICONES[nome]
  if (!icone) return null

  return ativo ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      {icone.solido}
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      {icone.traco}
    </svg>
  )
}
