/**
 * ErrorBoundary Component
 *
 * React Error Boundary for catching and handling unexpected errors.
 * Shows a fallback UI when an error occurs and logs errors for debugging.
 *
 * Features:
 * - Catches JavaScript errors in child component tree
 * - Shows customizable fallback UI
 * - Provides reset functionality
 * - Logs errors for debugging
 * - Accessible error messages
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import Button from './Button'

// =============================================================================
// Types
// =============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI to show when error occurs */
  fallback?: ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Custom title for the error message */
  title?: string
  /** Custom message to show in the error UI */
  message?: string
  /** Whether to show the reset button */
  showReset?: boolean
  /** Additional CSS classes */
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// =============================================================================
// Component
// =============================================================================

/**
 * ErrorBoundary class component
 *
 * Note: Error boundaries must be class components as of React 18.
 * Functional components cannot catch errors in their children.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    const {
      children,
      fallback,
      title = 'Something went wrong',
      message = 'An unexpected error occurred. Please try again.',
      showReset = true,
      className = '',
    } = this.props

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 ${className}`}
        >
          {/* Error icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-2xl">
              error
            </span>
          </div>

          {/* Error title */}
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
            {title}
          </h3>

          {/* Error message */}
          <p className="text-sm text-red-600 dark:text-red-300 text-center mb-4">
            {message}
          </p>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="w-full mb-4 text-xs">
              <summary className="cursor-pointer text-red-500 dark:text-red-400 hover:underline">
                View error details
              </summary>
              <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg overflow-auto text-red-700 dark:text-red-300 max-h-40">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          {/* Reset button */}
          {showReset && (
            <Button
              type="button"
              variant="secondary"
              onClick={this.handleReset}
              icon="refresh"
            >
              Try Again
            </Button>
          )}
        </div>
      )
    }

    return children
  }
}

// =============================================================================
// Specialized Error Boundaries
// =============================================================================

/**
 * Modal Error Boundary with modal-specific styling
 */
export interface ModalErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'fallback'> {
  onClose?: () => void
}

export const ModalErrorBoundary: React.FC<ModalErrorBoundaryProps> = ({
  children,
  onClose,
  ...props
}) => {
  const fallback = (
    <div className="p-6">
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center text-center"
      >
        {/* Error icon */}
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-3xl">
            error
          </span>
        </div>

        {/* Error message */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {props.title || 'Something went wrong'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {props.message || 'An unexpected error occurred. Please close this dialog and try again.'}
        </p>

        {/* Close button */}
        {onClose && (
          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback} {...props}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
