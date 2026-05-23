'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { DailyTask } from '@/types'

interface ActivityChartProps {
  weeklyData: DailyTask[]
  color: 'cyan' | 'red'
}

const DAY_LABELS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']

export default function ActivityChart({ weeklyData, color }: ActivityChartProps) {
  const accent = color === 'cyan' ? '#00f5ff' : '#ff1744'
  const accentDim = color === 'cyan' ? 'rgba(0,245,255,0.15)' : 'rgba(255,23,68,0.15)'

  const chartData = DAY_LABELS.map((label, i) => {
    const task = weeklyData[weeklyData.length - 7 + i] || weeklyData[i]
    return {
      day: label,
      done: task?.completed_count || 0,
      momentum: task?.momentum_points || 0,
    }
  })

  return (
    <div style={{ width: '100%', height: 80 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'Space Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 7]}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 7]}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: `1px solid ${accent}40`,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'Space Mono',
              color: accent,
            }}
            formatter={(value) => [`${value}/7 task`, 'Bajarildi']}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}
          />
          <Area
            type="monotone"
            dataKey="done"
            stroke={accent}
            strokeWidth={2}
            fill={`url(#grad-${color})`}
            dot={{ fill: accent, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: accent }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
