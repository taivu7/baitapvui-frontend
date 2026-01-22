/**
 * Empty State Types for BaiTapVui
 *
 * These types define the data structures used for empty state UI components
 * across the application (KAN-52).
 */

import { ReactNode } from 'react'

/**
 * Icon color themes for empty state illustrations
 * Maps to Tailwind CSS color classes
 */
export type EmptyStateIconColor =
  | 'primary'
  | 'blue'
  | 'amber'
  | 'purple'
  | 'green'
  | 'orange'
  | 'pink'
  | 'red'
  | 'gray'

/**
 * Size variants for the empty state component
 */
export type EmptyStateSize = 'sm' | 'md' | 'lg'

/**
 * Configuration for the CTA (Call to Action) button
 */
export interface EmptyStateCTAConfig {
  /** Button label text */
  label: string
  /** Click handler for the button */
  onClick: () => void
  /** Optional icon name (Material Symbols) */
  icon?: string
  /** Icon position relative to label */
  iconPosition?: 'left' | 'right'
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline'
}

/**
 * Props for the base EmptyState component
 */
export interface EmptyStateProps {
  /** Main icon name (Material Symbols) or custom ReactNode */
  icon?: string | ReactNode
  /** Icon color theme */
  iconColor?: EmptyStateIconColor
  /** Main title text */
  title: string
  /** Description text explaining the empty state */
  description: string
  /** Optional CTA button configuration */
  cta?: EmptyStateCTAConfig
  /** Optional secondary CTA for additional actions */
  secondaryCta?: EmptyStateCTAConfig
  /** Size variant affecting padding and icon size */
  size?: EmptyStateSize
  /** Additional CSS classes */
  className?: string
  /** Test ID for testing purposes */
  testId?: string
}

/**
 * Props for teacher-specific empty state components
 */
export interface TeacherEmptyStateProps {
  /** Optional callback when CTA is clicked */
  onAction?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for student-specific empty state components
 */
export interface StudentEmptyStateProps {
  /** Optional callback when CTA is clicked */
  onAction?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Empty state variant identifiers for quick reference
 */
export type EmptyStateVariant =
  | 'teacher-no-classes'
  | 'teacher-no-assignments'
  | 'teacher-no-submissions'
  | 'student-no-classes'
  | 'student-no-assignments'
  | 'student-no-due-dates'
  | 'generic'
