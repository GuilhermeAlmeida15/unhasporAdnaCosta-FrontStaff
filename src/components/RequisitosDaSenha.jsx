function IconeAtendido() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  )
}

function IconePendente() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

/**
 * Lista ao vivo do que o backend exige da senha. Cada item carrega ícone +
 * texto (e o estado também em palavras, para leitor de tela): a cor sozinha
 * não pode ser o que diferencia atendido de pendente.
 *
 * O que falta fica em `ink-muted`, não em vermelho — enquanto a pessoa
 * digita não há erro nenhum, só requisito ainda não alcançado.
 */
export default function RequisitosDaSenha({ requisitos, id }) {
  const atendidos = requisitos.filter((regra) => regra.ok).length

  return (
    <div id={id} className="mt-3">
      <ul className="flex flex-col gap-1.5">
        {requisitos.map((regra) => (
          <li
            key={regra.id}
            className={`flex items-center gap-2 text-body-sm transition-colors duration-200 ease-in-out ${
              regra.ok ? 'text-status-confirmado' : 'text-ink-muted'
            }`}
          >
            {regra.ok ? <IconeAtendido /> : <IconePendente />}
            <span>
              {regra.rotulo}
              <span className="sr-only">{regra.ok ? ' — atendido' : ' — ainda não'}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Só o resumo é anunciado, senão o leitor de tela fala a cada tecla. */}
      <p aria-live="polite" className="sr-only">
        {atendidos} de {requisitos.length} requisitos atendidos.
      </p>
    </div>
  )
}
