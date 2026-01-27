/**
 * Assignment Cards Components Index
 *
 * Barrel file for exporting all Assignment Cards components.
 *
 * Components for displaying assignment cards in the My Assignments dashboard:
 * - AssignmentCard: Individual card component (KAN-132, KAN-133)
 * - AssignmentCardsGrid: Responsive grid container (KAN-134, KAN-135)
 */

// Main components
export { default as AssignmentCard, AssignmentCardSkeleton } from './AssignmentCard'
export {
  default as AssignmentCardsGrid,
  AssignmentCardsGridSkeleton,
  AssignmentCardsGridError,
  AssignmentCardsGridEmpty,
  CreateNewCard,
} from './AssignmentCardsGrid'

// Re-export types for convenience
export type {
  AssignmentCardData,
  AssignmentCardStatus,
  AssignmentDisplayStatus,
  AssignmentCardsResponse,
  AssignmentCardProps,
  AssignmentCardSkeletonProps,
  AssignmentCardsGridProps,
  AssignmentCardsFilterStatus,
} from '../../types/assignmentCards'
