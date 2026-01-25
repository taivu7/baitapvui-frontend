/**
 * Toast Component
 *
 * A reusable toast notification component for displaying
 * success, error, warning, and info messages.
 *
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss option
 * - Accessible (ARIA live regions)
 * - Responsive design
 * - Animation support
 */

import React, { useEffect, useState, useCallback } from 'react'

// =============================================================================
// Types
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number // ms, 0 = no auto-dismiss
  onDismiss: (id: string) => void
  className?: string
}

export interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

export interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// =============================================================================
// Toast Icons
// =============================================================================

const ToastIcons: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

// =============================================================================
// Toast Styles
// =============================================================================

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; title: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500 dark:text-green-400',
    title: 'text-green-900 dark:text-green-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500 dark:text-red-400',
    title: 'text-red-900 dark:text-red-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-300',
  },
}

// =============================================================================
// Toast Component
// =============================================================================

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(id)
    }, 200) // Animation duration
  }, [id, onDismiss])

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Auto-dismiss
  useEffect(() => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, handleDismiss])

  const styles = toastStyles[type]

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        transform transition-all duration-200 ease-out
        ${styles.bg} ${styles.border}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}
    >
      {/* Icon */}
      <span className={`material-symbols-outlined flex-shrink-0 ${styles.icon}`}>
        {ToastIcons[type]}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${styles.title}`}>{title}</p>
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          close
        </span>
      </button>
    </div>
  )
}

// =============================================================================
// Toast Container Component
// =============================================================================

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
  className = '',
}) => {
  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 w-full max-w-sm ${positionStyles[position]} ${className}`}
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

// =============================================================================
// useToast Hook
// =============================================================================

let toastIdCounter = 0

export interface UseToastReturn {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  success: (title: string, message?: string, duration?: number) => string
  error: (title: string, message?: string, duration?: number) => string
  warning: (title: string, message?: string, duration?: number) => string
  info: (title: string, message?: string, duration?: number) => string
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = useCallback((): void => {
    setToasts([])
  }, [])

  const success = useCallback(
    (title: string, message?: string, duration = 5000): string => {
      return addToast({ type: 'success', title, message, duration })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string, duration = 7000): string => {
      return addToast({ type: 'error', title, message, duration })
    },
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string, duration = 6000): string => {
      return addToast({ type: 'warning', title, message, duration })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string, duration = 5000): string => {
      return addToast({ type: 'info', title, message, duration })
    },
    [addToast]
  )

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}

export default Toast
