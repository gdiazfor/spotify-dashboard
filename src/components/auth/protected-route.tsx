"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else {
      setIsReady(true)
    }
  }, [isAuthenticated, router])

  if (!isReady) {
    return null
  }

  return <>{children}</>
} 