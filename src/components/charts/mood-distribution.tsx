"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const MOOD_COLORS = {
  Energetic: "#c026d3",
  Happy: "#fbbf24",
  Melancholic: "#3b82f6",
  Calm: "#22c55e",
  Balanced: "#8b5cf6"
}

const MOOD_DATA = [
  { name: "Energetic", value: 35 },
  { name: "Happy", value: 25 },
  { name: "Melancholic", value: 20 },
  { name: "Calm", value: 15 },
  { name: "Balanced", value: 5 },
]

export function MoodDistributionChart() {
  const { theme } = useTheme()

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Mood Analysis</CardTitle>
        <CardDescription>The emotional landscape of your music</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOOD_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {MOOD_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={MOOD_COLORS[entry.name as keyof typeof MOOD_COLORS]}
                  />
                ))}
              </Pie>
              <Legend 
                layout="horizontal" 
                align="center" 
                verticalAlign="bottom"
                formatter={(value) => (
                  <span style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 