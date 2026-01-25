/**
 * AssignmentActions Component Tests
 *
 * Tests for KAN-89, KAN-90: Save Draft and Publish action buttons
 * Validates button states, loading states, and publish confirmation dialog
 *
 * Note: Requires Vitest and @testing-library/react
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AssignmentActions from '../components/assignment/AssignmentActions'
import { ApiAssignmentStatus } from '../types/assignmentActions'

describe('AssignmentActions', () => {
  const defaultProps = {
    status: 'DRAFT' as ApiAssignmentStatus,
    isSaving: false,
    isPublishing: false,
    isValidForDraft: true,
    isValidForPublish: true,
    onSaveDraft: vi.fn(),
    onPublish: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =============================================================================
  // Draft Status Tests
  // =============================================================================

  describe('Draft Status', () => {
    it('should render Save Draft and Publish buttons when status is DRAFT', () => {
      render(<AssignmentActions {...defaultProps} />)

      expect(screen.getByText('Save Draft')).toBeInTheDocument()
      expect(screen.getByText('Publish')).toBeInTheDocument()
    })

    it('should call onSaveDraft when Save Draft button is clicked', () => {
      const onSaveDraft = vi.fn()

      render(<AssignmentActions {...defaultProps} onSaveDraft={onSaveDraft} />)

      fireEvent.click(screen.getByText('Save Draft'))

      expect(onSaveDraft).toHaveBeenCalledTimes(1)
    })

    it('should show confirmation dialog when Publish button is clicked', () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      expect(screen.getByText('Publish Assignment')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument()
    })

    it('should disable Save Draft button when isValidForDraft is false', () => {
      render(<AssignmentActions {...defaultProps} isValidForDraft={false} />)

      const saveDraftButton = screen.getByText('Save Draft').closest('button')
      expect(saveDraftButton).toBeDisabled()
    })

    it('should disable Publish button when isValidForPublish is false', () => {
      render(<AssignmentActions {...defaultProps} isValidForPublish={false} />)

      const publishButton = screen.getByText('Publish').closest('button')
      expect(publishButton).toBeDisabled()
    })

    it('should have correct aria-label for Save Draft button', () => {
      render(<AssignmentActions {...defaultProps} />)

      const saveDraftButton = screen.getByLabelText('Save as draft')
      expect(saveDraftButton).toBeInTheDocument()
    })

    it('should have correct aria-label for Publish button', () => {
      render(<AssignmentActions {...defaultProps} />)

      const publishButton = screen.getByLabelText('Publish assignment')
      expect(publishButton).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Published Status Tests
  // =============================================================================

  describe('Published Status', () => {
    it('should render Published indicator when status is PUBLISHED', () => {
      render(<AssignmentActions {...defaultProps} status="PUBLISHED" />)

      expect(screen.getByText('Published')).toBeInTheDocument()
      expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
      expect(screen.queryByText('Publish')).not.toBeInTheDocument()
    })

    it('should show check circle icon for Published status', () => {
      const { container } = render(
        <AssignmentActions {...defaultProps} status="PUBLISHED" />
      )

      const icon = container.querySelector('.material-symbols-outlined')
      expect(icon).toHaveTextContent('check_circle')
    })

    it('should not render action buttons when status is PUBLISHED', () => {
      render(<AssignmentActions {...defaultProps} status="PUBLISHED" />)

      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })
  })

  // =============================================================================
  // Loading States Tests
  // =============================================================================

  describe('Loading States', () => {
    it('should show "Saving..." text when isSaving is true', () => {
      render(<AssignmentActions {...defaultProps} isSaving={true} />)

      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
    })

    it('should show spinner icon when saving', () => {
      const { container } = render(
        <AssignmentActions {...defaultProps} isSaving={true} />
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveTextContent('progress_activity')
    })

    it('should disable Save Draft button when isSaving is true', () => {
      render(<AssignmentActions {...defaultProps} isSaving={true} />)

      const saveDraftButton = screen.getByText('Saving...').closest('button')
      expect(saveDraftButton).toBeDisabled()
    })

    it('should disable Publish button when isSaving is true', () => {
      render(<AssignmentActions {...defaultProps} isSaving={true} />)

      const publishButton = screen.getByText('Publish').closest('button')
      expect(publishButton).toBeDisabled()
    })

    it('should show "Publishing..." in dialog when isPublishing is true', async () => {
      render(<AssignmentActions {...defaultProps} isPublishing={true} />)

      // Open dialog first
      fireEvent.click(screen.getByText('Publish'))

      await waitFor(() => {
        expect(screen.getByText('Publishing...')).toBeInTheDocument()
      })
    })

    it('should disable dialog buttons when isPublishing is true', async () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      // Update props to simulate publishing state
      const { rerender } = render(
        <AssignmentActions {...defaultProps} isPublishing={true} />
      )

      // Re-open dialog
      fireEvent.click(screen.getByText('Publish'))

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel').closest('button')
        const confirmButton = screen.getByText(/Publishing/).closest('button')

        expect(cancelButton).toBeDisabled()
        expect(confirmButton).toBeDisabled()
      })
    })

    it('should change aria-label when saving', () => {
      render(<AssignmentActions {...defaultProps} isSaving={true} />)

      const saveDraftButton = screen.getByLabelText('Saving draft...')
      expect(saveDraftButton).toBeInTheDocument()
    })

    it('should change aria-label when publishing', () => {
      render(<AssignmentActions {...defaultProps} isPublishing={true} />)

      const publishButton = screen.getByLabelText('Publishing...')
      expect(publishButton).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Publish Confirmation Dialog Tests
  // =============================================================================

  describe('Publish Confirmation Dialog', () => {
    it('should not show dialog initially', () => {
      render(<AssignmentActions {...defaultProps} />)

      expect(screen.queryByText('Publish Assignment')).not.toBeInTheDocument()
    })

    it('should show dialog when Publish button is clicked', () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      expect(screen.getByText('Publish Assignment')).toBeInTheDocument()
    })

    it('should display warning message in dialog', () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      expect(screen.getByText(/Once published:/)).toBeInTheDocument()
      expect(
        screen.getByText(/Students will be able to see and complete the assignment/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/You will not be able to make major changes/)
      ).toBeInTheDocument()
      expect(screen.getByText(/The assignment cannot be unpublished/)).toBeInTheDocument()
    })

    it('should close dialog when Cancel is clicked', async () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))
      expect(screen.getByText('Publish Assignment')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Cancel'))

      await waitFor(() => {
        expect(screen.queryByText('Publish Assignment')).not.toBeInTheDocument()
      })
    })

    it('should call onPublish when Publish Now is clicked in dialog', () => {
      const onPublish = vi.fn()

      render(<AssignmentActions {...defaultProps} onPublish={onPublish} />)

      fireEvent.click(screen.getByText('Publish'))
      fireEvent.click(screen.getByText('Publish Now'))

      expect(onPublish).toHaveBeenCalledTimes(1)
    })

    it('should close dialog when Escape key is pressed', async () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))
      expect(screen.getByText('Publish Assignment')).toBeInTheDocument()

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByText('Publish Assignment')).not.toBeInTheDocument()
      })
    })

    it('should close dialog when backdrop is clicked', async () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      const backdrop = screen.getByRole('dialog').previousSibling as HTMLElement
      fireEvent.click(backdrop)

      await waitFor(() => {
        expect(screen.queryByText('Publish Assignment')).not.toBeInTheDocument()
      })
    })

    it('should not close dialog when backdrop is clicked during publishing', async () => {
      render(<AssignmentActions {...defaultProps} isPublishing={true} />)

      fireEvent.click(screen.getByText('Publish'))

      const backdrop = screen.getByRole('dialog').previousSibling as HTMLElement
      fireEvent.click(backdrop)

      // Dialog should remain open
      expect(screen.getByText('Publish Assignment')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for dialog', () => {
      render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'publish-dialog-title')
    })

    it('should show publish icon in dialog', () => {
      const { container } = render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      const icons = container.querySelectorAll('.material-symbols-outlined')
      const publishIcon = Array.from(icons).find((icon) =>
        icon.textContent?.includes('publish')
      )
      expect(publishIcon).toBeInTheDocument()
    })

    it('should show warning icon in dialog', () => {
      const { container } = render(<AssignmentActions {...defaultProps} />)

      fireEvent.click(screen.getByText('Publish'))

      const icons = container.querySelectorAll('.material-symbols-outlined')
      const warningIcon = Array.from(icons).find((icon) =>
        icon.textContent?.includes('warning')
      )
      expect(warningIcon).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Button Interaction Edge Cases
  // =============================================================================

  describe('Button Interaction Edge Cases', () => {
    it('should not call onSaveDraft when button is disabled', () => {
      const onSaveDraft = vi.fn()

      render(
        <AssignmentActions
          {...defaultProps}
          onSaveDraft={onSaveDraft}
          isValidForDraft={false}
        />
      )

      const saveDraftButton = screen.getByText('Save Draft').closest('button')
      fireEvent.click(saveDraftButton!)

      expect(onSaveDraft).not.toHaveBeenCalled()
    })

    it('should not show dialog when Publish button is disabled and clicked', () => {
      render(<AssignmentActions {...defaultProps} isValidForPublish={false} />)

      const publishButton = screen.getByText('Publish').closest('button')
      fireEvent.click(publishButton!)

      expect(screen.queryByText('Publish Assignment')).not.toBeInTheDocument()
    })

    it('should not call onSaveDraft when status is PUBLISHED', () => {
      const onSaveDraft = vi.fn()

      render(
        <AssignmentActions
          {...defaultProps}
          status="PUBLISHED"
          onSaveDraft={onSaveDraft}
        />
      )

      expect(screen.queryByText('Save Draft')).not.toBeInTheDocument()
      expect(onSaveDraft).not.toHaveBeenCalled()
    })

    it('should not call onPublish when status is PUBLISHED', () => {
      const onPublish = vi.fn()

      render(
        <AssignmentActions
          {...defaultProps}
          status="PUBLISHED"
          onPublish={onPublish}
        />
      )

      expect(screen.queryByText('Publish')).not.toBeInTheDocument()
      expect(onPublish).not.toHaveBeenCalled()
    })
  })

  // =============================================================================
  // Custom ClassName Tests
  // =============================================================================

  describe('Custom ClassName', () => {
    it('should apply custom className to wrapper', () => {
      const { container } = render(
        <AssignmentActions {...defaultProps} className="custom-class" />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should apply custom className to Published indicator wrapper', () => {
      const { container } = render(
        <AssignmentActions
          {...defaultProps}
          status="PUBLISHED"
          className="custom-class"
        />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Visual Styling Tests
  // =============================================================================

  describe('Visual Styling', () => {
    it('should have primary button styling for Publish button', () => {
      render(<AssignmentActions {...defaultProps} />)

      const publishButton = screen.getByText('Publish').closest('button')
      expect(publishButton).toHaveClass('bg-primary')
    })

    it('should have secondary button styling for Save Draft button', () => {
      render(<AssignmentActions {...defaultProps} />)

      const saveDraftButton = screen.getByText('Save Draft').closest('button')
      expect(saveDraftButton).toHaveClass('text-gray-600')
    })

    it('should have shadow effect on Publish button', () => {
      render(<AssignmentActions {...defaultProps} />)

      const publishButton = screen.getByText('Publish').closest('button')
      expect(publishButton).toHaveClass('shadow-lg')
    })

    it('should have green styling for Published indicator', () => {
      const { container } = render(
        <AssignmentActions {...defaultProps} status="PUBLISHED" />
      )

      const indicator = container.querySelector('.bg-green-50')
      expect(indicator).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Dialog Auto-close Tests
  // =============================================================================

  describe('Dialog Auto-close', () => {
    it('should close dialog after publishing completes', async () => {
      const { rerender } = render(<AssignmentActions {...defaultProps} />)

      // Open dialog
      fireEvent.click(screen.getByText('Publish'))
      expect(screen.getByText('Publish Assignment')).toBeInTheDocument()

      // Simulate publishing
      rerender(<AssignmentActions {...defaultProps} isPublishing={true} />)

      // Simulate publishing complete
      rerender(<AssignmentActions {...defaultProps} isPublishing={false} />)

      // Dialog should close after delay
      await waitFor(
        () => {
          expect(screen.queryByText('Publish Assignment')).not.toBeInTheDocument()
        },
        { timeout: 200 }
      )
    })
  })
})
