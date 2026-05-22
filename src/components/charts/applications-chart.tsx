import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Point = { month: string; count: number }

type Props = {
  data: Point[]
  emptyMessage?: string
}

export function ApplicationsChart({ data, emptyMessage }: Props) {
  if (data.length === 0) {
    return (
      <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        {emptyMessage ?? 'Aucune candidature disponible (token admin ou backend requis).'}
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillApps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
        <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="currentColor"
          fill="url(#fillApps)"
          className="text-foreground"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
