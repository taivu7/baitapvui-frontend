/**
 * EmptyState Component
 *
 * A reusable component for displaying empty states across the application.
 * Supports customizable icons, titles, descriptions, and optional CTA buttons.
 *
 * @component
 * @example
 * ```tsx
 * <EmptyState
 *   icon="assignment"
 *   iconColor="blue"
 *   title="No Assignments Yet"
 *   description="Create your first assignment to get started."
 *   cta={{
 *     label: "Create Assignment",
 *     onClick: () => navigate('/assignments/new'),
 *     icon: "add"
 *   }}
 * />
 * ```
 */

import React, { memo, isValidElement, ReactNode } from 'react'
import {
  EmptyStateProps,
  EmptyStateIconColor,
  EmptyStateSize,
  EmptyStateCTAConfig,
} from '../../types/emptyState'

/**
 * Maps icon color themes to Tailwind CSS classes for the icon container
 */
const getIconColorClasses = (color: EmptyStateIconColor): string => {
  const colorMap: Record<EmptyStateIconColor, string> = {
    primary: 'bg-green-50 dark:bg-green-900/20 text-primary dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  }
  return colorMap[color] || colorMap.gray
}

/**
 * Gets size-based styling configuration
 */
const getSizeConfig = (
  size: EmptyStateSize
): {
  containerPadding: string
  iconContainerSize: string
  iconSize: string
  titleSize: string
  descriptionSize: string
  maxWidth: string
} => {
  const sizeMap: Record<EmptyStateSize, ReturnType<typeof getSizeConfig>> = {
    sm: {
      containerPadding: 'py-8 px-4',
      iconContainerSize: 'p-3',
      iconSize: 'text-2xl',
      titleSize: 'text-base',
      descriptionSize: 'text-sm',
      maxWidth: 'max-w-sm',
    },
    md: {
      containerPadding: 'py-12 px-6',
      iconContainerSize: 'p-4',
      iconSize: 'text-3xl',
      titleSize: 'text-lg',
      descriptionSize: 'text-sm',
      maxWidth: 'max-w-md',
    },
    lg: {
      containerPadding: 'py-16 px-8',
      iconContainerSize: 'p-5',
      iconSize: 'text-4xl',
      titleSize: 'text-xl',
      descriptionSize: 'text-base',
      maxWidth: 'max-w-lg',
    },
  }
  return sizeMap[size] || sizeMap.md
}

/**
 * CTA Button Component
 * Internal component for rendering action buttons
 */
interface CTAButtonProps {
  config: EmptyStateCTAConfig
  isPrimary?: boolean
}

const CTAButton: React.FC<CTAButtonProps> = ({ config, isPrimary = true }) => {
  const { label, onClick, icon, iconPosition = 'left', variant = 'primary' } = config

  const baseClasses =
    'flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-bold transition-all active:scale-[0.98]'

  const variantClasses: Record<string, string> = {
    primary:
      'bg-primary text-[#111813] shadow-[0_4px_14px_0_rgba(19,236,91,0.39)] hover:bg-primary/90',
    secondary:
      'bg-white dark:bg-[#102216] text-[#111813] dark:text-white border border-gray-200 dark:border-[#2a3c30] hover:bg-gray-50 dark:hover:bg-[#1a2c20]',
    outline:
      'border border-gray-200 dark:border-[#2a3c30] bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a2c20]',
  }

  const buttonVariant = isPrimary ? variant : 'outline'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[buttonVariant]}`}
      aria-label={label}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
}

/**
 * EmptyState Component
 *
 * Displays an empty state with:
 * - Icon or custom illustration
 * - Title text
 * - Description text
 * - Optional primary and secondary CTA buttons
 *
 * Supports dark mode and responsive design.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  iconColor = 'gray',
  title,
  description,
  cta,
  secondaryCta,
  size = 'md',
  className = '',
  testId,
}) => {
  const sizeConfig = getSizeConfig(size)
  const iconClasses = getIconColorClasses(iconColor)

  /**
   * Determines if the icon prop is a custom ReactNode or a string (Material Symbol name)
   */
  const isCustomIcon = (iconProp: string | ReactNode): iconProp is ReactNode => {
    return isValidElement(iconProp) || (typeof iconProp !== 'string' && iconProp !== undefined)
  }

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        ${sizeConfig.containerPadding}
        bg-surface-light dark:bg-surface-dark
        rounded-2xl
        border border-gray-100 dark:border-gray-800
        ${className}
      `}
      role="status"
      aria-label={title}
      data-testid={testId}
    >
      {/* Icon / Illustration */}
      {icon && (
        <div
          className={`
            ${sizeConfig.iconContainerSize}
            rounded-full
            ${isCustomIcon(icon) ? '' : iconClasses}
            mb-4
          `}
          aria-hidden="true"
        >
          {isCustomIcon(icon) ? (
            icon
          ) : (
            <span className={`material-symbols-outlined ${sizeConfig.iconSize}`}>{icon}</span>
          )}
        </div>
      )}

      {/* Title */}
      <h3
        className={`
          ${sizeConfig.titleSize}
          font-semibold
          text-gray-900 dark:text-white
          mb-2
          text-center
        `}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`
          ${sizeConfig.descriptionSize}
          text-gray-500 dark:text-gray-400
          text-center
          ${sizeConfig.maxWidth}
          mb-1
        `}
      >
        {description}
      </p>

      {/* CTA Buttons */}
      {(cta || secondaryCta) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
          {cta && <CTAButton config={cta} isPrimary />}
          {secondaryCta && <CTAButton config={secondaryCta} isPrimary={false} />}
        </div>
      )}
    </div>
  )
}

// Memoize for performance optimization
export default memo(EmptyState)
