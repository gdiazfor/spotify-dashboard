"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeRangeSelectorProps {
  onChange: (value: string) => void
  value: string
}

const timeRanges = [
  { value: 'short_term', label: 'Last Month', description: 'Top tracks from the last month' },
  { value: 'medium_term', label: '6 Months', description: 'Top tracks from the last 6 months' },
  { value: 'long_term', label: 'All Time', description: 'Your top tracks of all time' },
]

export function TimeRangeSelector({ onChange, value }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Tabs value={value} onValueChange={onChange} className="w-fit">
        <TabsList>
          {timeRanges.map((range) => (
            <TabsTrigger 
              key={range.value} 
              value={range.value}
              className="min-w-[80px]"
            >
              {range.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
} 