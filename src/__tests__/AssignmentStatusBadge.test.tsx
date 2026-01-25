/**
 * AssignmentStatusBadge Component Tests
 *
 * Tests for KAN-92: Assignment status indicator
 * Validates badge rendering, colors, and accessibility for different statuses
 *
 * Note: Requires Vitest and @testing-library/react
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AssignmentStatusBadge from '../components/assignments/AssignmentStatusBadge'
import { AssignmentStatus } from '../types/assignments'

describe('AssignmentStatusBadge', () => {
  // =============================================================================
  // Draft Status Tests
  // =============================================================================

  describe('Draft Status', () => {
    it('should render Draft badge', () => {
      render(<AssignmentStatusBadge status="draft" />)

      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('should have amber color classes for draft', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('bg-amber-100')
      expect(badge).toHaveClass('text-amber-700')
    })

    it('should show edit_note icon for draft', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const icon = container.querySelector('.material-symbols-outlined')
      expect(icon).toHaveTextContent('edit_note')
    })

    it('should have correct aria-label for draft', () => {
      render(<AssignmentStatusBadge status="draft" />)

      const badge = screen.getByLabelText('Status: Draft')
      expect(badge).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Published Status Tests
  // =============================================================================

  describe('Published Status', () => {
    it('should render Published badge', () => {
      render(<AssignmentStatusBadge status="published" />)

      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    it('should have green color classes for published', () => {
      const { container } = render(<AssignmentStatusBadge status="published" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-700')
    })

    it('should show check_circle icon for published', () => {
      const { container } = render(<AssignmentStatusBadge status="published" />)

      const icon = container.querySelector('.material-symbols-outlined')
      expect(icon).toHaveTextContent('check_circle')
    })

    it('should have correct aria-label for published', () => {
      render(<AssignmentStatusBadge status="published" />)

      const badge = screen.getByLabelText('Status: Published')
      expect(badge).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Closed Status Tests
  // =============================================================================

  describe('Closed Status', () => {
    it('should render Closed badge', () => {
      render(<AssignmentStatusBadge status="closed" />)

      expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('should have gray color classes for closed', () => {
      const { container } = render(<AssignmentStatusBadge status="closed" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('bg-gray-100')
      expect(badge).toHaveClass('text-gray-600')
    })

    it('should show lock icon for closed', () => {
      const { container } = render(<AssignmentStatusBadge status="closed" />)

      const icon = container.querySelector('.material-symbols-outlined')
      expect(icon).toHaveTextContent('lock')
    })

    it('should have correct aria-label for closed', () => {
      render(<AssignmentStatusBadge status="closed" />)

      const badge = screen.getByLabelText('Status: Closed')
      expect(badge).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Accessibility Tests
  // =============================================================================

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<AssignmentStatusBadge status="draft" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })

    it('should mark icon as aria-hidden', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const icon = container.querySelector('.material-symbols-outlined')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have aria-label describing the status', () => {
      render(<AssignmentStatusBadge status="published" />)

      const badge = screen.getByLabelText('Status: Published')
      expect(badge).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Styling Tests
  // =============================================================================

  describe('Styling', () => {
    it('should have pill shape with rounded corners', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('rounded-full')
    })

    it('should have proper padding', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('px-2.5')
      expect(badge).toHaveClass('py-1')
    })

    it('should have inline-flex display', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
    })

    it('should have small font size', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
    })

    it('should have gap between icon and text', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('gap-1')
    })
  })

  // =============================================================================
  // Custom ClassName Tests
  // =============================================================================

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <AssignmentStatusBadge status="draft" className="custom-class" />
      )

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('custom-class')
    })

    it('should preserve default classes when custom className is provided', () => {
      const { container } = render(
        <AssignmentStatusBadge status="draft" className="ml-2" />
      )

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('ml-2')
      expect(badge).toHaveClass('rounded-full')
      expect(badge).toHaveClass('bg-amber-100')
    })

    it('should work without custom className', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Dark Mode Tests
  // =============================================================================

  describe('Dark Mode', () => {
    it('should have dark mode classes for draft', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('dark:bg-amber-900/30')
      expect(badge).toHaveClass('dark:text-amber-400')
    })

    it('should have dark mode classes for published', () => {
      const { container } = render(<AssignmentStatusBadge status="published" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('dark:bg-green-900/30')
      expect(badge).toHaveClass('dark:text-green-400')
    })

    it('should have dark mode classes for closed', () => {
      const { container } = render(<AssignmentStatusBadge status="closed" />)

      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('dark:bg-gray-800')
      expect(badge).toHaveClass('dark:text-gray-400')
    })
  })

  // =============================================================================
  // Icon Styling Tests
  // =============================================================================

  describe('Icon Styling', () => {
    it('should have correct icon size', () => {
      const { container } = render(<AssignmentStatusBadge status="draft" />)

      const icon = container.querySelector('.material-symbols-outlined') as HTMLElement
      expect(icon).toHaveClass('text-sm')
      expect(icon).toHaveStyle({ fontSize: '14px' })
    })

    it('should render icon for all statuses', () => {
      const statuses: AssignmentStatus[] = ['draft', 'published', 'closed']

      statuses.forEach((status) => {
        const { container } = render(<AssignmentStatusBadge status={status} />)
        const icon = container.querySelector('.material-symbols-outlined')
        expect(icon).toBeInTheDocument()
      })
    })
  })

  // =============================================================================
  // Edge Cases Tests
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle invalid status gracefully (defaults to draft)', () => {
      const { container } = render(
        <AssignmentStatusBadge status={'invalid' as AssignmentStatus} />
      )

      // Should default to draft config
      const badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('bg-amber-100')
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('should render without crashing on status change', () => {
      const { rerender } = render(<AssignmentStatusBadge status="draft" />)

      expect(screen.getByText('Draft')).toBeInTheDocument()

      rerender(<AssignmentStatusBadge status="published" />)

      expect(screen.getByText('Published')).toBeInTheDocument()
      expect(screen.queryByText('Draft')).not.toBeInTheDocument()
    })
  })

  // =============================================================================
  // Memoization Tests
  // =============================================================================

  describe('Memoization', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(<AssignmentStatusBadge status="draft" />)

      const firstBadge = screen.getByRole('status')

      // Re-render with same props
      rerender(<AssignmentStatusBadge status="draft" />)

      const secondBadge = screen.getByRole('status')

      // Should be the same element (React memo optimization)
      expect(firstBadge).toBe(secondBadge)
    })

    it('should re-render when status changes', () => {
      const { rerender } = render(<AssignmentStatusBadge status="draft" />)

      expect(screen.getByText('Draft')).toBeInTheDocument()

      rerender(<AssignmentStatusBadge status="published" />)

      expect(screen.queryByText('Draft')).not.toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    it('should re-render when className changes', () => {
      const { rerender, container } = render(
        <AssignmentStatusBadge status="draft" className="class-1" />
      )

      let badge = container.firstChild as HTMLElement
      expect(badge).toHaveClass('class-1')

      rerender(<AssignmentStatusBadge status="draft" className="class-2" />)

      badge = container.firstChild as HTMLElement
      expect(badge).not.toHaveClass('class-1')
      expect(badge).toHaveClass('class-2')
    })
  })

  // =============================================================================
  // Integration with Status Types
  // =============================================================================

  describe('Integration with Status Types', () => {
    it('should accept all valid AssignmentStatus values', () => {
      const validStatuses: AssignmentStatus[] = ['draft', 'published', 'closed']

      validStatuses.forEach((status) => {
        const { container } = render(<AssignmentStatusBadge status={status} />)
        expect(container.firstChild).toBeInTheDocument()
      })
    })

    it('should render different content for each status', () => {
      const statusLabels: Record<AssignmentStatus, string> = {
        draft: 'Draft',
        published: 'Published',
        closed: 'Closed',
      }

      Object.entries(statusLabels).forEach(([status, label]) => {
        const { container } = render(
          <AssignmentStatusBadge status={status as AssignmentStatus} />
        )

        expect(screen.getByText(label)).toBeInTheDocument()

        // Clean up for next iteration
        container.remove()
      })
    })
  })
})
