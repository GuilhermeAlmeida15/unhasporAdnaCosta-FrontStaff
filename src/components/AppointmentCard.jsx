import StatusBadge from './StatusBadge'
import { diaPorExtenso, horas, preco } from '../lib/datas'

/**
 * Um agendamento na agenda da equipe. O card é estático: as ações ficam nos
 * botões do rodapé, nunca num toque no card inteiro.
 */
export default function AppointmentCard({ agendamento, acoes }) {
  const { nome_cliente, servico, data_hora, data_hora_fim, status, motivo, observacoes } =
    agendamento

  return (
    // `flex-col` + `mt-auto` nas ações alinham os botões na base quando os
    // cards ficam lado a lado numa grade e têm alturas diferentes.
    <article className="flex w-full flex-col rounded-md border border-border bg-surface-raised p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-h3 text-ink">{nome_cliente}</h3>
          <p className="mt-0.5 truncate text-body-sm text-ink-muted">{servico}</p>
        </div>

        <StatusBadge status={status} />
      </div>

      <dl className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-body-sm text-ink">
        <dt className="sr-only">Quando</dt>
        <dd className="font-semibold">{diaPorExtenso(data_hora)}</dd>
        <dd className="text-ink-muted">
          {horas(data_hora)}
          {data_hora_fim ? `–${horas(data_hora_fim)}` : ''}
        </dd>
        <dt className="sr-only">Preço</dt>
        <dd className="text-ink-muted">· {preco(agendamento.preco)}</dd>
      </dl>

      {observacoes ? (
        <p className="mt-3 border-t border-border pt-3 text-body-sm text-ink-muted">
          <span className="text-label uppercase text-ink-subtle">Observações</span>
          <br />
          {observacoes}
        </p>
      ) : null}

      {motivo ? (
        <p className="mt-3 border-t border-border pt-3 text-body-sm text-ink-muted">
          <span className="text-label uppercase text-ink-subtle">Motivo</span>
          <br />
          {motivo}
        </p>
      ) : null}

      {acoes ? <div className="mt-auto flex gap-2 pt-4">{acoes}</div> : null}
    </article>
  )
}
