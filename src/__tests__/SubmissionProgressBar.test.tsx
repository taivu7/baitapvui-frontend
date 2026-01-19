/**
 * SubmissionProgressBar Component Tests (KAN-43)
 *
 * Unit tests for the SubmissionProgressBar component.
 * Tests rendering, accessibility, and edge cases.
 *
 * Note: These tests require a testing framework (Vitest or Jest) to be configured.
 * To run these tests, add Vitest or Jest to the project and configure accordingly.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SubmissionProgressBar, {
  SubmissionProgressBarSkeleton,
} from '../components/assignments/SubmissionProgressBar'

describe('SubmissionProgressBar', () => {
  describe('Rendering', () => {
    it('renders with correct submitted and total counts', () => {
      render(<SubmissionProgressBar submittedCount={12} totalStudents={30} />)

      expect(screen.getByText('12 / 30 submitted')).toBeInTheDocument()
    })

    it('renders progress bar with correct percentage', () => {
      render(<SubmissionProgressBar submittedCount={15} totalStudents={30} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    })

    it('renders nothing when totalStudents is 0', () => {
      const { container } = render(
        <SubmissionProgressBar submittedCount={0} totalStudents={0} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('shows Complete badge when 100% submitted', () => {
      render(<SubmissionProgressBar submittedCount={25} totalStudents={25} />)

      expect(screen.getByText('Complete')).toBeInTheDocument()
    })

    it('does not show Complete badge when less than 100%', () => {
      render(<SubmissionProgressBar submittedCount={24} totalStudents={25} />)

      expect(screen.queryByText('Complete')).not.toBeInTheDocument()
    })
  })

  describe('Label Visibility', () => {
    it('shows label by default', () => {
      render(<SubmissionProgressBar submittedCount={10} totalStudents={20} />)

      expect(screen.getByText('10 / 20 submitted')).toBeInTheDocument()
    })

    it('hides label when showLabel is false', () => {
      render(
        <SubmissionProgressBar
          submittedCount={10}
          totalStudents={20}
          showLabel={false}
        />
      )

      expect(screen.queryByText('10 / 20 submitted')).not.toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders with small size', () => {
      render(
        <SubmissionProgressBar submittedCount={10} totalStudents={20} size="sm" />
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('h-1.5')
    })

    it('renders with medium size (default)', () => {
      render(<SubmissionProgressBar submittedCount={10} totalStudents={20} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('h-2')
    })

    it('renders with large size', () => {
      render(
        <SubmissionProgressBar submittedCount={10} totalStudents={20} size="lg" />
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('h-2.5')
    })
  })

  describe('Progress Colors', () => {
    it('shows gray color for 0% progress', () => {
      render(<SubmissionProgressBar submittedCount={0} totalStudents={20} />)

      const progressFill = screen
        .getByRole('progressbar')
        .querySelector('div[class*="bg-gray"]')
      expect(progressFill).toBeInTheDocument()
    })

    it('shows red color for under 25% progress', () => {
      render(<SubmissionProgressBar submittedCount={4} totalStudents={20} />)

      const progressFill = screen
        .getByRole('progressbar')
        .querySelector('div[class*="bg-red"]')
      expect(progressFill).toBeInTheDocument()
    })

    it('shows amber color for 25-49% progress', () => {
      render(<SubmissionProgressBar submittedCount={8} totalStudents={20} />)

      const progressFill = screen
        .getByRole('progressbar')
        .querySelector('div[class*="bg-amber"]')
      expect(progressFill).toBeInTheDocument()
    })

    it('shows blue color for 50-74% progress', () => {
      render(<SubmissionProgressBar submittedCount={12} totalStudents={20} />)

      const progressFill = screen
        .getByRole('progressbar')
        .querySelector('div[class*="bg-blue"]')
      expect(progressFill).toBeInTheDocument()
    })

    it('shows green color for 75-99% progress', () => {
      render(<SubmissionProgressBar submittedCount={16} totalStudents={20} />)

      const progressFill = screen
        .getByRole('progressbar')
        .querySelector('div[class*="bg-green"]')
      expect(progressFill).toBeInTheDocument()
    })

    it('shows primary color for 100% progress', () => {
      render(<SubmissionProgressBar submittedCount={20} totalStudents={20} />)

      const progressFill = screen
        .getByRole('progressbar')
        .querySelector('div[class*="bg-primary"]')
      expect(progressFill).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes on progress bar', () => {
      render(<SubmissionProgressBar submittedCount={15} totalStudents={30} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      expect(progressBar).toHaveAttribute(
        'aria-label',
        'Submission progress: 15 / 30 submitted'
      )
    })

    it('provides screen reader text', () => {
      render(<SubmissionProgressBar submittedCount={15} totalStudents={30} />)

      const srText = screen.getByText(
        '15 out of 30 students have submitted. 50% complete.'
      )
      expect(srText).toHaveClass('sr-only')
    })
  })

  describe('Edge Cases', () => {
    it('handles submitted count greater than total gracefully', () => {
      render(<SubmissionProgressBar submittedCount={35} totalStudents={30} />)

      const progressBar = screen.getByRole('progressbar')
      // Should cap at 100%
      expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })

    it('handles negative submitted count', () => {
      const { container } = render(
        <SubmissionProgressBar submittedCount={-5} totalStudents={30} />
      )

      // Should still render but with 0% or handle gracefully
      expect(container).toBeInTheDocument()
    })
  })
})

describe('SubmissionProgressBarSkeleton', () => {
  it('renders skeleton with aria-hidden', () => {
    const { container } = render(<SubmissionProgressBarSkeleton />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('has animate-pulse class for loading animation', () => {
    const { container } = render(<SubmissionProgressBarSkeleton />)

    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SubmissionProgressBarSkeleton className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
