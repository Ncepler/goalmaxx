'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; oneRM: number }[]
}

export function ExerciseTrendChart({ data }: Props) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle p-4 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#5a5a55', fontSize: 10 }}
            tickFormatter={d => d.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#5a5a55', fontSize: 10 }}
            domain={['auto', 'auto']}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#131313', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#8a8a85' }}
            itemStyle={{ color: '#d4a85a' }}
            formatter={(v) => [`${v}kg`, 'Est. 1RM']}
          />
          <Line
            type="monotone"
            dataKey="oneRM"
            stroke="#d4a85a"
            strokeWidth={2}
            dot={{ fill: '#d4a85a', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#e8bd6c', r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
