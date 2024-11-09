"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const LANGUAGE_COLORS = {
  English: "#0ea5e9",
  Spanish: "#f97316",
  Korean: "#ec4899",
  Japanese: "#14b8a6",
  Other: "#8b5cf6"
}

const LANGUAGE_DATA = [
  { name: "English", value: 45 },
  { name: "Spanish", value: 30 },
  { name: "Korean", value: 15 },
  { name: "Japanese", value: 7 },
  { name: "Other", value: 3 },
]

export function LanguageDistributionChart() {
  const { theme } = useTheme()

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Language Distribution</CardTitle>
        <CardDescription>Languages in your music library</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={LANGUAGE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {LANGUAGE_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={LANGUAGE_COLORS[entry.name as keyof typeof LANGUAGE_COLORS]}
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