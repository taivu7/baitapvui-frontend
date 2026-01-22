/**
 * Empty States Components Index
 *
 * Barrel file for exporting all empty state UI components.
 * These components are used across the application to handle
 * empty data scenarios with consistent styling and messaging.
 *
 * @module components/empty-states
 */

// Base component
export { default as EmptyState } from './EmptyState'

// Teacher-specific empty states
export { default as TeacherEmptyClasses } from './TeacherEmptyClasses'
export { default as TeacherEmptyAssignments } from './TeacherEmptyAssignments'
export { default as TeacherEmptySubmissions } from './TeacherEmptySubmissions'

// Student-specific empty states
export { default as StudentEmptyClasses } from './StudentEmptyClasses'
export { default as StudentEmptyAssignments } from './StudentEmptyAssignments'
export { default as StudentEmptyDueDates } from './StudentEmptyDueDates'

// Re-export types for convenience
export type {
  EmptyStateProps,
  EmptyStateCTAConfig,
  EmptyStateIconColor,
  EmptyStateSize,
  TeacherEmptyStateProps,
  StudentEmptyStateProps,
  EmptyStateVariant,
} from '../../types/emptyState'
