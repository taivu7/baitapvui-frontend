/**
 * StatisticsCard Component
 *
 * A reusable card component for displaying individual statistics metrics
 * on the Teacher Dashboard. Supports icons, badges, and loading states.
 */

import React, { memo } from 'react'
import { StatisticsCardProps, BadgeVariant, IconColorTheme } from '../../types/statistics'

/**
 * Maps icon color themes to Tailwind CSS classes for the icon container
 */
const getIconColorClasses = (color: IconColorTheme): string => {
  const colorMap: Record<IconColorTheme, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
  }
  return colorMap[color] || colorMap.gray
}

/**
 * Maps badge variants to Tailwind CSS classes
 */
const getBadgeColorClasses = (variant: BadgeVariant): string => {
  const variantMap: Record<BadgeVariant, string> = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    neutral: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }
  return variantMap[variant] || variantMap.neutral
}

/**
 * Skeleton loading component for the statistics card
 */
const StatisticsCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse ${className}`}
      aria-hidden="true"
    >
      {/* Icon and Badge skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 h-12 w-12" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Title skeleton */}
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />

      {/* Value skeleton */}
      <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

/**
 * StatisticsCard Component
 *
 * Displays a single statistic metric with:
 * - Icon with colored background
 * - Optional badge (e.g., "+2 New", "Action Needed")
 * - Title text
 * - Numeric or percentage value
 *
 * Supports loading skeleton state and dark mode.
 *
 * @param props - StatisticsCardProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <StatisticsCard
 *   statistic={{
 *     id: 'active-assignments',
 *     title: 'Active Assignments',
 *     value: 4,
 *     icon: 'assignment',
 *     iconColor: 'blue',
 *     badge: { text: '+2 New', variant: 'success' }
 *   }}
 *   onClick={() => navigate('/assignments')}
 * />
 * ```
 */
const StatisticsCard: React.FC<StatisticsCardProps> = ({
  statistic,
  isLoading = false,
  onClick,
  className = '',
}) => {
  // Show skeleton while loading
  if (isLoading) {
    return <StatisticsCardSkeleton className={className} />
  }

  const { title, value, icon, iconColor, badge } = statistic

  // Determine if the card is interactive (clickable)
  const isInteractive = !!onClick
  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.98]'
    : ''

  return (
    <div
      className={`
        bg-surface-light dark:bg-surface-dark
        p-6 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm
        transition-all duration-200
        ${interactiveClasses}
        ${className}
      `}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      aria-label={`${title}: ${value}`}
    >
      {/* Header: Icon and Badge */}
      <div className="flex items-start justify-between mb-4">
        {/* Icon Container */}
        <div
          className={`p-3 rounded-xl ${getIconColorClasses(iconColor)}`}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        {/* Badge (optional) */}
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${getBadgeColorClasses(badge.variant)}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
        {title}
      </p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(StatisticsCard)

// Export skeleton for external use
export { StatisticsCardSkeleton }
