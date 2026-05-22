import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

type StatusPieChartProps = {
  data: { name: string; value: number }[]
  emptyMessage?: string
}

export function StatusPieChart({ data, emptyMessage }: StatusPieChartProps) {
  if (data.length === 0) {
    return (
      <p className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground px-4">
        {emptyMessage ?? 'Aucune donnée'}
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
