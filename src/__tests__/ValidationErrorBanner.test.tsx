/**
 * ValidationErrorBanner Component Tests
 *
 * Tests for KAN-91: Display Validation Errors Before Publish
 * Validates error display, navigation, and accessibility
 *
 * Note: Requires Vitest and @testing-library/react
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ValidationErrorBanner from '../components/assignment/ValidationErrorBanner'
import { ValidationError } from '../types/assignmentActions'

describe('ValidationErrorBanner', () => {
  const mockAssignmentErrors: ValidationError[] = [
    {
      scope: 'assignment',
      field: 'title',
      message: 'Assignment title is required',
    },
    {
      scope: 'assignment',
      field: 'classId',
      message: 'Please select a class',
    },
  ]

  const mockQuestionErrors: ValidationError[] = [
    {
      scope: 'question',
      questionId: 'q1',
      message: 'Must have at least one correct answer',
    },
    {
      scope: 'question',
      questionId: 'q2',
      message: 'Option text cannot be empty',
    },
  ]

  const allErrors = [...mockAssignmentErrors, ...mockQuestionErrors]

  // =============================================================================
  // Rendering Tests
  // =============================================================================

  describe('Rendering', () => {
    it('should render nothing when no errors', () => {
      const { container } = render(<ValidationErrorBanner errors={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render error banner with assignment errors', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      expect(screen.getByText('Cannot publish assignment')).toBeInTheDocument()
      expect(screen.getByText(/2 field errors/)).toBeInTheDocument()
      expect(screen.getByText(/Assignment title is required/)).toBeInTheDocument()
      expect(screen.getByText(/Please select a class/)).toBeInTheDocument()
    })

    it('should render error banner with question errors', () => {
      render(<ValidationErrorBanner errors={mockQuestionErrors} />)

      expect(screen.getByText(/2 question errors/)).toBeInTheDocument()
      expect(screen.getByText(/Must have at least one correct answer/)).toBeInTheDocument()
      expect(screen.getByText(/Option text cannot be empty/)).toBeInTheDocument()
    })

    it('should render mixed assignment and question errors', () => {
      render(<ValidationErrorBanner errors={allErrors} />)

      expect(screen.getByText(/2 field errors and 2 question errors/)).toBeInTheDocument()
    })

    it('should display correct field labels', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      expect(screen.getByText('Assignment Title:')).toBeInTheDocument()
      expect(screen.getByText(/Class Selection:/)).toBeInTheDocument()
    })

    it('should display correct question labels', () => {
      render(<ValidationErrorBanner errors={mockQuestionErrors} />)

      expect(screen.getByText('Question q1:')).toBeInTheDocument()
      expect(screen.getByText('Question q2:')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ValidationErrorBanner errors={mockAssignmentErrors} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  // =============================================================================
  // Summary Text Tests
  // =============================================================================

  describe('Summary Text', () => {
    it('should show singular "field error" for one assignment error', () => {
      render(
        <ValidationErrorBanner
          errors={[
            {
              scope: 'assignment',
              field: 'title',
              message: 'Title is required',
            },
          ]}
        />
      )

      expect(screen.getByText(/1 field error/)).toBeInTheDocument()
    })

    it('should show plural "field errors" for multiple assignment errors', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      expect(screen.getByText(/2 field errors/)).toBeInTheDocument()
    })

    it('should show singular "question error" for one question error', () => {
      render(
        <ValidationErrorBanner
          errors={[
            {
              scope: 'question',
              questionId: 'q1',
              message: 'Error',
            },
          ]}
        />
      )

      expect(screen.getByText(/1 question error/)).toBeInTheDocument()
    })

    it('should show plural "question errors" for multiple question errors', () => {
      render(<ValidationErrorBanner errors={mockQuestionErrors} />)

      expect(screen.getByText(/2 question errors/)).toBeInTheDocument()
    })
  })

  // =============================================================================
  // Interaction Tests
  // =============================================================================

  describe('Interactions', () => {
    it('should call onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()

      render(
        <ValidationErrorBanner errors={mockAssignmentErrors} onDismiss={onDismiss} />
      )

      const dismissButton = screen.getByLabelText('Dismiss error banner')
      fireEvent.click(dismissButton)

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('should not render dismiss button when onDismiss is not provided', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      expect(screen.queryByLabelText('Dismiss error banner')).not.toBeInTheDocument()
    })

    it('should call onErrorClick when error item is clicked', () => {
      const onErrorClick = vi.fn()

      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={onErrorClick}
        />
      )

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      fireEvent.click(errorItem!)

      expect(onErrorClick).toHaveBeenCalledTimes(1)
      expect(onErrorClick).toHaveBeenCalledWith(mockAssignmentErrors[0])
    })

    it('should call onErrorClick when Enter key is pressed on error item', () => {
      const onErrorClick = vi.fn()

      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={onErrorClick}
        />
      )

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      fireEvent.keyDown(errorItem!, { key: 'Enter' })

      expect(onErrorClick).toHaveBeenCalledTimes(1)
    })

    it('should call onErrorClick when Space key is pressed on error item', () => {
      const onErrorClick = vi.fn()

      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={onErrorClick}
        />
      )

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      fireEvent.keyDown(errorItem!, { key: ' ' })

      expect(onErrorClick).toHaveBeenCalledTimes(1)
    })

    it('should not make error items clickable when onErrorClick is not provided', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      expect(errorItem).not.toHaveAttribute('role', 'button')
      expect(errorItem).not.toHaveAttribute('tabIndex')
    })

    it('should show navigation hint when onErrorClick is provided', () => {
      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={vi.fn()}
        />
      )

      expect(
        screen.getByText('Click on an error to navigate to the relevant section.')
      ).toBeInTheDocument()
    })

    it('should not show navigation hint when onErrorClick is not provided', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      expect(
        screen.queryByText('Click on an error to navigate to the relevant section.')
      ).not.toBeInTheDocument()
    })
  })

  // =============================================================================
  // Accessibility Tests
  // =============================================================================

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const banner = screen.getByRole('alert')
      expect(banner).toBeInTheDocument()
    })

    it('should have aria-live="assertive"', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const banner = screen.getByRole('alert')
      expect(banner).toHaveAttribute('aria-live', 'assertive')
    })

    it('should have aria-atomic="true"', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const banner = screen.getByRole('alert')
      expect(banner).toHaveAttribute('aria-atomic', 'true')
    })

    it('should have proper aria-label for clickable errors', () => {
      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={vi.fn()}
        />
      )

      const errorItem = screen.getByLabelText('Click to go to Assignment Title')
      expect(errorItem).toBeInTheDocument()
    })

    it('should have role="button" for clickable errors', () => {
      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={vi.fn()}
        />
      )

      const errorItems = screen.getAllByRole('button')
      expect(errorItems.length).toBeGreaterThan(0)
    })

    it('should have tabIndex={0} for clickable errors', () => {
      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={vi.fn()}
        />
      )

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      expect(errorItem).toHaveAttribute('tabIndex', '0')
    })

    it('should have aria-label for error list', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const errorList = screen.getByLabelText('List of validation errors')
      expect(errorList).toBeInTheDocument()
    })

    it('should mark icons as aria-hidden', () => {
      const { container } = render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const icons = container.querySelectorAll('.material-symbols-outlined')
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  // =============================================================================
  // Error Grouping Tests
  // =============================================================================

  describe('Error Grouping', () => {
    it('should display assignment errors before question errors', () => {
      render(<ValidationErrorBanner errors={allErrors} />)

      const errorList = screen.getByLabelText('List of validation errors')
      const listItems = errorList.querySelectorAll('li')

      // First two should be assignment errors
      expect(listItems[0]).toHaveTextContent('Assignment Title:')
      expect(listItems[1]).toHaveTextContent(/Class Selection:/)

      // Next two should be question errors
      expect(listItems[2]).toHaveTextContent('Question q1:')
      expect(listItems[3]).toHaveTextContent('Question q2:')
    })

    it('should use correct icons for assignment vs question errors', () => {
      const { container } = render(<ValidationErrorBanner errors={allErrors} />)

      const errorList = container.querySelector('ul')
      const listItems = errorList!.querySelectorAll('li')

      // Assignment errors should have 'description' icon
      const assignmentIcon = listItems[0].querySelector('.material-symbols-outlined')
      expect(assignmentIcon).toHaveTextContent('description')

      // Question errors should have 'quiz' icon
      const questionIcon = listItems[2].querySelector('.material-symbols-outlined')
      expect(questionIcon).toHaveTextContent('quiz')
    })
  })

  // =============================================================================
  // Edge Cases
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle error without field name', () => {
      const errors: ValidationError[] = [
        {
          scope: 'assignment',
          message: 'General error',
        },
      ]

      render(<ValidationErrorBanner errors={errors} />)

      expect(screen.getByText('General:')).toBeInTheDocument()
      expect(screen.getByText('General error')).toBeInTheDocument()
    })

    it('should handle error without questionId', () => {
      const errors: ValidationError[] = [
        {
          scope: 'question',
          message: 'General question error',
        },
      ]

      render(<ValidationErrorBanner errors={errors} />)

      expect(screen.getByText('General:')).toBeInTheDocument()
    })

    it('should handle very long error messages', () => {
      const errors: ValidationError[] = [
        {
          scope: 'assignment',
          field: 'title',
          message:
            'This is a very long error message that should still be displayed correctly without breaking the layout or causing overflow issues.',
        },
      ]

      render(<ValidationErrorBanner errors={errors} />)

      expect(
        screen.getByText(/This is a very long error message/)
      ).toBeInTheDocument()
    })

    it('should handle undefined errors array gracefully', () => {
      const { container } = render(
        <ValidationErrorBanner errors={undefined as any} />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  // =============================================================================
  // Visual Styling Tests
  // =============================================================================

  describe('Visual Styling', () => {
    it('should have hover effect for clickable errors', () => {
      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={vi.fn()}
        />
      )

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      expect(errorItem).toHaveClass('cursor-pointer')
      expect(errorItem).toHaveClass('hover:bg-red-100')
    })

    it('should not have hover effect for non-clickable errors', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      expect(errorItem).not.toHaveClass('cursor-pointer')
    })

    it('should show arrow icon for clickable errors', () => {
      render(
        <ValidationErrorBanner
          errors={mockAssignmentErrors}
          onErrorClick={vi.fn()}
        />
      )

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      const arrow = errorItem!.querySelector('.material-symbols-outlined[aria-hidden="true"]')

      // Should have multiple icons including arrow_forward
      expect(errorItem!.textContent).toContain('arrow_forward')
    })

    it('should not show arrow icon for non-clickable errors', () => {
      render(<ValidationErrorBanner errors={mockAssignmentErrors} />)

      const errorItem = screen.getByText(/Assignment title is required/).closest('li')
      expect(errorItem!.textContent).not.toContain('arrow_forward')
    })
  })
})
