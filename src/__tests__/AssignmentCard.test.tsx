/**
 * AssignmentCard Component Tests (KAN-132, KAN-133)
 *
 * Tests for the AssignmentCard component that displays individual assignments
 * on the My Assignments Dashboard.
 *
 * Validates:
 * - Rendering with different statuses (published, draft, closed)
 * - Click handling
 * - Status badge display
 * - Date formatting
 * - Accessibility features
 * - Skeleton loading state
 *
 * Note: Requires Vitest and @testing-library/react
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AssignmentCard, {
  AssignmentCardSkeleton,
} from '../components/assignment-cards/AssignmentCard'
import { AssignmentCardData, AssignmentCardStatus } from '../types/assignmentCards'

/**
 * Factory function to create mock assignment data
 */
const createMockAssignment = (
  overrides: Partial<AssignmentCardData> = {}
): AssignmentCardData => ({
  assignment_id: 1,
  title: 'Test Assignment',
  class_name: 'Class 5A',
  status: 'published',
  relevant_date: '2026-02-24',
  relevant_time: '14:30',
  ...overrides,
})

describe('AssignmentCard', () => {
  // =============================================================================
  // Basic Rendering Tests
  // =============================================================================

  describe('Basic Rendering', () => {
    it('should render the assignment title', () => {
      const assignment = createMockAssignment({ title: 'Math Quiz Chapter 5' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Math Quiz Chapter 5')).toBeInTheDocument()
    })

    it('should render the class name', () => {
      const assignment = createMockAssignment({ class_name: 'Physics 101' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Physics 101')).toBeInTheDocument()
    })

    it('should render "Not assigned" when class_name is "Not assigned"', () => {
      const assignment = createMockAssignment({ class_name: 'Not assigned' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Not assigned')).toBeInTheDocument()
    })

    it('should render the more options button', () => {
      const assignment = createMockAssignment()

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Status Badge Tests
  // =============================================================================

  describe('Status Badge', () => {
    it('should display "Active" for published status', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should display "Draft" for draft status', () => {
      const assignment = createMockAssignment({ status: 'draft' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('should display "Completed" for closed status', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('should have green color classes for published status', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      const badge = screen.getByLabelText('Status: Active')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-700')
    })

    it('should have blue color classes for draft status', () => {
      const assignment = createMockAssignment({ status: 'draft' })

      render(<AssignmentCard assignment={assignment} />)

      const badge = screen.getByLabelText('Status: Draft')
      expect(badge).toHaveClass('bg-blue-100')
      expect(badge).toHaveClass('text-blue-700')
    })

    it('should have gray color classes for closed status', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      const badge = screen.getByLabelText('Status: Completed')
      expect(badge).toHaveClass('bg-gray-100')
      expect(badge).toHaveClass('text-gray-700')
    })
  })

  // =============================================================================
  // Date Display Tests
  // =============================================================================

  describe('Date Display', () => {
    it('should show "Due" prefix for published assignments', () => {
      const assignment = createMockAssignment({
        status: 'published',
        relevant_date: '2026-02-24',
        relevant_time: '14:30',
      })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText(/Due Feb 24, 2:30 PM/)).toBeInTheDocument()
    })

    it('should show "Closed" prefix for closed assignments', () => {
      const assignment = createMockAssignment({
        status: 'closed',
        relevant_date: '2026-02-15',
      })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText(/Closed Feb 15/)).toBeInTheDocument()
    })

    it('should show "Last edited" prefix for draft assignments', () => {
      // Mock the date to ensure consistent test behavior
      const mockDate = new Date('2026-01-27T10:00:00Z')
      vi.setSystemTime(mockDate)

      const assignment = createMockAssignment({
        status: 'draft',
        relevant_date: '2026-01-27',
        relevant_time: null,
      })

      render(<AssignmentCard assignment={assignment} />)

      // Should show "Last edited" with relative time
      expect(screen.getByText(/Last edited/)).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('should not display time for draft assignments', () => {
      const assignment = createMockAssignment({
        status: 'draft',
        relevant_time: null,
      })

      render(<AssignmentCard assignment={assignment} />)

      // Time should not be shown for drafts
      expect(screen.queryByText(/PM|AM/)).not.toBeInTheDocument()
    })
  })

  // =============================================================================
  // Action Button Tests
  // =============================================================================

  describe('Action Button', () => {
    it('should show "Manage" button for published status', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    })

    it('should show "Continue Editing" button for draft status', () => {
      const assignment = createMockAssignment({ status: 'draft' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByRole('button', { name: 'Continue Editing' })).toBeInTheDocument()
    })

    it('should show "View Results" button for closed status', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByRole('button', { name: 'View Results' })).toBeInTheDocument()
    })

    it('should have primary styling for closed status action button', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      const button = screen.getByRole('button', { name: 'View Results' })
      expect(button).toHaveClass('bg-primary')
    })

    it('should have secondary styling for published/draft action buttons', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      const button = screen.getByRole('button', { name: 'Manage' })
      expect(button).toHaveClass('bg-[#f0f4f2]')
    })
  })

  // =============================================================================
  // Click Handler Tests
  // =============================================================================

  describe('Click Handlers', () => {
    it('should call onClick when card is clicked', () => {
      const assignment = createMockAssignment()
      const handleClick = vi.fn()

      render(<AssignmentCard assignment={assignment} onClick={handleClick} />)

      const card = screen.getByRole('button', { name: /Test Assignment/ })
      fireEvent.click(card)

      expect(handleClick).toHaveBeenCalledWith(assignment)
    })

    it('should call onClick when action button is clicked', () => {
      const assignment = createMockAssignment({ status: 'published' })
      const handleClick = vi.fn()

      render(<AssignmentCard assignment={assignment} onClick={handleClick} />)

      const button = screen.getByRole('button', { name: 'Manage' })
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledWith(assignment)
    })

    it('should not propagate click from action button to card', () => {
      const assignment = createMockAssignment()
      const handleClick = vi.fn()

      render(<AssignmentCard assignment={assignment} onClick={handleClick} />)

      const button = screen.getByRole('button', { name: 'Manage' })
      fireEvent.click(button)

      // Should only be called once (not twice from propagation)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not have cursor-pointer when onClick is not provided', () => {
      const assignment = createMockAssignment()

      const { container } = render(<AssignmentCard assignment={assignment} />)

      const card = container.querySelector('article')
      expect(card).not.toHaveClass('cursor-pointer')
    })

    it('should have cursor-pointer when onClick is provided', () => {
      const assignment = createMockAssignment()
      const handleClick = vi.fn()

      const { container } = render(
        <AssignmentCard assignment={assignment} onClick={handleClick} />
      )

      const card = container.querySelector('article')
      expect(card).toHaveClass('cursor-pointer')
    })

    it('should trigger onClick on Enter key press', () => {
      const assignment = createMockAssignment()
      const handleClick = vi.fn()

      render(<AssignmentCard assignment={assignment} onClick={handleClick} />)

      const card = screen.getByRole('button', { name: /Test Assignment/ })
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(handleClick).toHaveBeenCalledWith(assignment)
    })

    it('should trigger onClick on Space key press', () => {
      const assignment = createMockAssignment()
      const handleClick = vi.fn()

      render(<AssignmentCard assignment={assignment} onClick={handleClick} />)

      const card = screen.getByRole('button', { name: /Test Assignment/ })
      fireEvent.keyDown(card, { key: ' ' })

      expect(handleClick).toHaveBeenCalledWith(assignment)
    })
  })

  // =============================================================================
  // Progress Display Tests
  // =============================================================================

  describe('Progress Display', () => {
    it('should show "Not Published" for draft status', () => {
      const assignment = createMockAssignment({ status: 'draft' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('Not Published')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should show "All Graded" for closed status', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('All Graded')).toBeInTheDocument()
      expect(screen.getByText('Results')).toBeInTheDocument()
    })

    it('should show submissions placeholder for published status', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      expect(screen.getByText('--/--')).toBeInTheDocument()
      expect(screen.getByText('Submissions')).toBeInTheDocument()
    })

    it('should have progress bar with 100% width for closed status', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })

    it('should have progress bar with 0% width for draft status', () => {
      const assignment = createMockAssignment({ status: 'draft' })

      render(<AssignmentCard assignment={assignment} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    })
  })

  // =============================================================================
  // Accessibility Tests
  // =============================================================================

  describe('Accessibility', () => {
    it('should have proper aria-labelledby for card', () => {
      const assignment = createMockAssignment({ assignment_id: 42 })

      render(<AssignmentCard assignment={assignment} />)

      const card = screen.getByRole('button', { name: /Test Assignment/ })
      expect(card).toHaveAttribute('aria-labelledby', 'assignment-title-42')
    })

    it('should have role="status" on status badge', () => {
      const assignment = createMockAssignment()

      render(<AssignmentCard assignment={assignment} />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })

    it('should have aria-label on status badge', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      const badge = screen.getByLabelText('Status: Active')
      expect(badge).toBeInTheDocument()
    })

    it('should have aria-haspopup on more options button', () => {
      const assignment = createMockAssignment()

      render(<AssignmentCard assignment={assignment} />)

      const button = screen.getByRole('button', { name: 'More options' })
      expect(button).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('should have tabindex for keyboard navigation when clickable', () => {
      const assignment = createMockAssignment()
      const handleClick = vi.fn()

      render(<AssignmentCard assignment={assignment} onClick={handleClick} />)

      const card = screen.getByRole('button', { name: /Test Assignment/ })
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should not have tabindex when not clickable', () => {
      const assignment = createMockAssignment()

      const { container } = render(<AssignmentCard assignment={assignment} />)

      const card = container.querySelector('article')
      expect(card).not.toHaveAttribute('tabindex')
    })

    it('should have accessible progressbar with labels', () => {
      const assignment = createMockAssignment({ status: 'closed' })

      render(<AssignmentCard assignment={assignment} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      expect(progressBar).toHaveAttribute('aria-label', 'Results: All Graded')
    })
  })

  // =============================================================================
  // Skeleton Loading State Tests
  // =============================================================================

  describe('Skeleton Loading State', () => {
    it('should render skeleton when isLoading is true', () => {
      const assignment = createMockAssignment()

      const { container } = render(
        <AssignmentCard assignment={assignment} isLoading={true} />
      )

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should not render assignment content when loading', () => {
      const assignment = createMockAssignment({ title: 'My Assignment' })

      render(<AssignmentCard assignment={assignment} isLoading={true} />)

      expect(screen.queryByText('My Assignment')).not.toBeInTheDocument()
    })

    it('should have aria-hidden on skeleton', () => {
      const assignment = createMockAssignment()

      const { container } = render(
        <AssignmentCard assignment={assignment} isLoading={true} />
      )

      const skeleton = container.querySelector('article')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })

  // =============================================================================
  // Custom ClassName Tests
  // =============================================================================

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const assignment = createMockAssignment()

      const { container } = render(
        <AssignmentCard assignment={assignment} className="custom-class" />
      )

      const card = container.querySelector('article')
      expect(card).toHaveClass('custom-class')
    })

    it('should preserve default classes with custom className', () => {
      const assignment = createMockAssignment()

      const { container } = render(
        <AssignmentCard assignment={assignment} className="ml-4" />
      )

      const card = container.querySelector('article')
      expect(card).toHaveClass('ml-4')
      expect(card).toHaveClass('rounded-2xl')
      expect(card).toHaveClass('shadow-sm')
    })
  })

  // =============================================================================
  // AssignmentCardSkeleton Tests
  // =============================================================================

  describe('AssignmentCardSkeleton', () => {
    it('should render skeleton component', () => {
      const { container } = render(<AssignmentCardSkeleton />)

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should have aria-hidden attribute', () => {
      const { container } = render(<AssignmentCardSkeleton />)

      const skeleton = container.querySelector('article')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have role="presentation"', () => {
      const { container } = render(<AssignmentCardSkeleton />)

      const skeleton = container.querySelector('article')
      expect(skeleton).toHaveAttribute('role', 'presentation')
    })

    it('should apply custom className to skeleton', () => {
      const { container } = render(<AssignmentCardSkeleton className="my-custom" />)

      const skeleton = container.querySelector('article')
      expect(skeleton).toHaveClass('my-custom')
    })

    it('should have proper structure for skeleton elements', () => {
      const { container } = render(<AssignmentCardSkeleton />)

      // Should have skeleton elements for badge, title, meta, progress box, and button
      const skeletonElements = container.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(5)
    })
  })

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle long titles with truncation', () => {
      const longTitle =
        'This is a very long assignment title that should be truncated to prevent layout issues on the card'
      const assignment = createMockAssignment({ title: longTitle })

      render(<AssignmentCard assignment={assignment} />)

      const title = screen.getByText(longTitle)
      expect(title).toHaveClass('line-clamp-2')
    })

    it('should render all status types correctly', () => {
      const statuses: AssignmentCardStatus[] = ['draft', 'published', 'closed']

      statuses.forEach((status) => {
        const assignment = createMockAssignment({ status })
        const { container } = render(<AssignmentCard assignment={assignment} />)

        expect(container.querySelector('article')).toBeInTheDocument()
        container.remove()
      })
    })

    it('should handle null relevant_time', () => {
      const assignment = createMockAssignment({
        status: 'draft',
        relevant_time: null,
      })

      render(<AssignmentCard assignment={assignment} />)

      // Should not crash and should still show date info
      expect(screen.getByText(/Last edited/)).toBeInTheDocument()
    })

    it('should display title attribute for tooltip on hover', () => {
      const assignment = createMockAssignment({ title: 'Test Title' })

      render(<AssignmentCard assignment={assignment} />)

      const title = screen.getByText('Test Title')
      expect(title).toHaveAttribute('title', 'Test Title')
    })
  })

  // =============================================================================
  // Dark Mode Tests
  // =============================================================================

  describe('Dark Mode', () => {
    it('should have dark mode classes for card background', () => {
      const assignment = createMockAssignment()

      const { container } = render(<AssignmentCard assignment={assignment} />)

      const card = container.querySelector('article')
      expect(card).toHaveClass('dark:bg-surface-dark')
    })

    it('should have dark mode classes for status badge', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      const badge = screen.getByLabelText('Status: Active')
      expect(badge).toHaveClass('dark:bg-green-900/30')
      expect(badge).toHaveClass('dark:text-green-400')
    })

    it('should have dark mode classes for action button', () => {
      const assignment = createMockAssignment({ status: 'published' })

      render(<AssignmentCard assignment={assignment} />)

      const button = screen.getByRole('button', { name: 'Manage' })
      expect(button).toHaveClass('dark:bg-white/5')
      expect(button).toHaveClass('dark:text-primary')
    })
  })
})
