"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
}

// Mock data - we'll replace this with real data later
const mockData = {
  labels: ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz'],
  datasets: [
    {
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(147, 51, 234, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(239, 68, 68, 0.5)',
        'rgba(245, 158, 11, 0.5)',
      ],
      borderColor: [
        'rgb(147, 51, 234)',
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(239, 68, 68)',
        'rgb(245, 158, 11)',
      ],
      borderWidth: 1,
    },
  ],
}

export function GenresChart() {
  return <Doughnut data={mockData} options={options} />
} 