"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, action, variant }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((toasts) => [...toasts, { id, title, description, action, variant }])
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((currentToasts) => currentToasts.slice(1))
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [toasts])

  return { toast, dismiss, toasts }
}

export { useToast }

