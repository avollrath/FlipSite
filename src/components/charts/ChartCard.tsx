import type { ReactNode } from 'react'

type ChartCardProps = {
  children: ReactNode
  emptyText?: string
  hasData?: boolean
  legend?: ReactNode
  subtitle?: string
  title: string
}

export function ChartCard({
  children,
  emptyText = 'Add more sold items to unlock this chart.',
  hasData = true,
  legend,
  subtitle,
  title,
}: ChartCardProps) {
  return (
    <article className="rounded-xl bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-base">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
      </div>
      {hasData ? (
        <>
          {children}
          {legend ? <div className="mt-3">{legend}</div> : null}
        </>
      ) : (
        <div className="grid h-[220px] place-items-center rounded-lg border border-dashed border-subtle bg-surface-2/50 text-center">
          <div>
            <p className="text-sm font-semibold text-base">No data yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted">{emptyText}</p>
          </div>
        </div>
      )}
    </article>
  )
}
