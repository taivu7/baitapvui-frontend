/**
 * CreateAssignment Page (Placeholder)
 *
 * Placeholder page for the assignment creation workflow.
 * This page will be fully implemented in a future ticket.
 *
 * Features to be implemented:
 * - Assignment title and description form
 * - Question bank integration
 * - Class selection
 * - Due date and time settings
 * - Save draft / Publish functionality
 */

import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate()

  const handleGoBack = useCallback(() => {
    navigate('/teacher/dashboard')
  }, [navigate])

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back Button and Page Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Assignment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new assignment for your students.
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">assignment_add</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Assignment Creation Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This feature is currently under development. You will be able to create assignments,
            add questions, and assign them to your classes here.
          </p>
        </div>
      </div>
    </main>
  )
}

export default CreateAssignment
