/**
 * SubmissionProgressBar Component (KAN-43)
 *
 * A reusable progress bar component for displaying assignment submission progress.
 * Shows submitted count vs total students with a visual progress indicator.
 *
 * Features:
 * - Responsive sizing (sm, md, lg)
 * - Color-coded progress indication
 * - Optional text label
 * - Full accessibility support (ARIA attributes)
 * - Dark mode support
 */

import React, { memo, useMemo } from 'react'
import { SubmissionProgressBarProps } from '../../types/submissionProgress'

/**
 * Size configuration mapping for the progress bar
 */
const sizeConfig = {
  sm: {
    barHeight: 'h-1.5',
    fontSize: 'text-xs',
    gap: 'gap-1.5',
    padding: 'py-1',
  },
  md: {
    barHeight: 'h-2',
    fontSize: 'text-xs',
    gap: 'gap-2',
    padding: 'py-1.5',
  },
  lg: {
    barHeight: 'h-2.5',
    fontSize: 'text-sm',
    gap: 'gap-2.5',
    padding: 'py-2',
  },
}

/**
 * Determines the color of the progress bar based on completion percentage
 *
 * @param percentage - Completion percentage (0-100)
 * @returns Tailwind CSS color classes for the progress fill
 */
const getProgressColor = (percentage: number): string => {
  if (percentage === 0) {
    return 'bg-gray-300 dark:bg-gray-600'
  }
  if (percentage < 25) {
    return 'bg-red-400 dark:bg-red-500'
  }
  if (percentage < 50) {
    return 'bg-amber-400 dark:bg-amber-500'
  }
  if (percentage < 75) {
    return 'bg-blue-400 dark:bg-blue-500'
  }
  if (percentage < 100) {
    return 'bg-green-400 dark:bg-green-500'
  }
  // 100% complete
  return 'bg-primary'
}

/**
 * Formats the submission label text
 *
 * @param submittedCount - Number of submissions
 * @param totalStudents - Total students assigned
 * @returns Formatted label string
 */
const formatLabel = (submittedCount: number, totalStudents: number): string => {
  return `${submittedCount} / ${totalStudents} submitted`
}

/**
 * Calculates the percentage for display and progress bar width
 *
 * @param submittedCount - Number of submissions
 * @param totalStudents - Total students assigned
 * @returns Percentage value between 0 and 100
 */
const calculatePercentage = (submittedCount: number, totalStudents: number): number => {
  if (totalStudents <= 0) return 0
  const percentage = (submittedCount / totalStudents) * 100
  return Math.min(100, Math.round(percentage * 10) / 10)
}

/**
 * Skeleton loading component for the progress bar
 */
const SubmissionProgressBarSkeleton: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className = '' }) => {
  const config = sizeConfig[size]

  return (
    <div
      className={`flex flex-col ${config.gap} ${config.padding} animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <div className={`${config.fontSize} h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded`} />
      </div>
      <div className={`w-full ${config.barHeight} bg-gray-200 dark:bg-gray-700 rounded-full`} />
    </div>
  )
}

/**
 * SubmissionProgressBar Component
 *
 * Displays assignment submission progress as a visual progress bar.
 *
 * @param props - SubmissionProgressBarProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SubmissionProgressBar
 *   submittedCount={12}
 *   totalStudents={30}
 * />
 *
 * // With size and without label
 * <SubmissionProgressBar
 *   submittedCount={18}
 *   totalStudents={25}
 *   size="sm"
 *   showLabel={false}
 * />
 * ```
 */
const SubmissionProgressBar: React.FC<SubmissionProgressBarProps> = ({
  submittedCount,
  totalStudents,
  className = '',
  showLabel = true,
  size = 'md',
}) => {
  // Calculate percentage and memoize to prevent recalculation
  const percentage = useMemo(
    () => calculatePercentage(submittedCount, totalStudents),
    [submittedCount, totalStudents]
  )

  // Get progress bar color based on percentage
  const progressColor = useMemo(() => getProgressColor(percentage), [percentage])

  // Format label text
  const labelText = useMemo(
    () => formatLabel(submittedCount, totalStudents),
    [submittedCount, totalStudents]
  )

  // Get size configuration
  const config = sizeConfig[size]

  // Handle edge case of zero total students
  if (totalStudents <= 0) {
    return null
  }

  return (
    <div className={`flex flex-col ${config.gap} ${config.padding} ${className}`}>
      {/* Label and percentage */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <span
            className={`${config.fontSize} text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: size === 'lg' ? '16px' : '14px' }}
              aria-hidden="true"
            >
              group
            </span>
            {labelText}
          </span>
          {percentage === 100 && (
            <span
              className={`${config.fontSize} text-primary font-semibold flex items-center gap-0.5`}
              aria-hidden="true"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: size === 'lg' ? '16px' : '14px' }}
              >
                check_circle
              </span>
              Complete
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`w-full ${config.barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Submission progress: ${labelText}`}
      >
        <div
          className={`${config.barHeight} ${progressColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Screen reader only text for accessibility */}
      <span className="sr-only">
        {`${submittedCount} out of ${totalStudents} students have submitted. ${percentage}% complete.`}
      </span>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(SubmissionProgressBar)

// Export skeleton for external use
export { SubmissionProgressBarSkeleton }
