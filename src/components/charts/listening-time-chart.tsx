"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `${value}h`
      }
    }
  }
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// Mock data - we'll replace this with real data later
const mockHours = days.map(() => Math.floor(Math.random() * 8))

export function ListeningTimeChart() {
  const data = {
    labels: days,
    datasets: [
      {
        data: mockHours,
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <Bar options={options} data={data} height={200} />
  )
} 