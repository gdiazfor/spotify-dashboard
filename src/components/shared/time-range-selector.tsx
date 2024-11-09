"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

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
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          {timeRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <p className="font-medium mb-1">Available Time Ranges:</p>
            <ul className="text-sm space-y-1">
              {timeRanges.map((range) => (
                <li key={range.value}>
                  <span className="font-medium">{range.label}:</span> {range.description}
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider> */}
    </div>
  )
} 