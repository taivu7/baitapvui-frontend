/**
 * QuestionBuilderPage
 *
 * Demo page for the Question Builder feature.
 * This shows how to integrate the QuestionBuilder component in a page.
 *
 * Usage in a route:
 * <Route path="/assignments/:assignmentId/questions" element={<QuestionBuilderPage />} />
 */

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QuestionBuilderProvider, QuestionBuilder } from '../features/questions'
import Button from '../components/ui/Button'

const QuestionBuilderPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()

  if (!assignmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a120d]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Assignment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Assignment ID is required to use the question builder.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a120d]">
      {/* Page container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              arrow_back
            </span>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Question Builder */}
        <div className="bg-white dark:bg-[#0f1c13] rounded-xl shadow-lg p-6 min-h-[calc(100vh-12rem)]">
          <QuestionBuilderProvider assignmentId={assignmentId}>
            <QuestionBuilder assignmentId={assignmentId} />
          </QuestionBuilderProvider>
        </div>
      </div>
    </div>
  )
}

export default QuestionBuilderPage
