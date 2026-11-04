// Cada status sempre aparece com ícone + palavra, nunca só a cor: âmbar e
// vermelho se confundem para quem tem daltonismo.
const ESTILOS = {
  pendente: {
    rotulo: 'Pendente',
    classe: 'bg-status-pendente-soft text-status-pendente',
    caminho: 'M12 7v5l3 2',
  },
  confirmado: {
    rotulo: 'Confirmado',
    classe: 'bg-status-confirmado-soft text-status-confirmado',
    caminho: 'm8.5 12.5 2.5 2.5 4.5-5',
  },
  recusado: {
    rotulo: 'Recusado',
    classe: 'bg-status-recusado-soft text-status-recusado',
    caminho: 'm9 9 6 6m0-6-6 6',
  },
  cancelado: {
    rotulo: 'Cancelado',
    classe: 'bg-status-cancelado-soft text-status-cancelado',
    caminho: 'M9 12h6',
  },
}

export default function StatusBadge({ status }) {
  const estilo = ESTILOS[status]
  if (!estilo) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-badge transition-colors duration-200 ease-in-out ${estilo.classe}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d={estilo.caminho} />
      </svg>
      {estilo.rotulo}
    </span>
  )
}
