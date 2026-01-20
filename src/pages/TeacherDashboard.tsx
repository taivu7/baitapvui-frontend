/**
 * TeacherDashboard Page
 *
 * Main dashboard page for teachers displaying:
 * - Personalized greeting section
 * - Overview statistics cards (KAN-34)
 * - Current assignments list with submission progress (KAN-40, KAN-43)
 * - Recent activity feed (KAN-46)
 * - Teacher tips
 */

import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GreetingSection, OverviewStatistics, RecentActivityFeed } from '../components/dashboard'
import { AssignmentsList } from '../components/assignments'
import { useTeacherStatistics, useTeacherAssignments, useSubmissionProgress } from '../hooks'

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch teacher statistics using the custom hook
  const { statistics, isLoading, error, refetch } = useTeacherStatistics()

  // Fetch teacher assignments using the custom hook (KAN-40)
  const {
    assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useTeacherAssignments({ limit: 5 })

  // Fetch submission progress data for assignments (KAN-43)
  const {
    getProgress,
    isLoading: progressLoading,
  } = useSubmissionProgress()

  // Handler for creating new assignment
  const handleCreateAssignment = useCallback(() => {
    navigate('/teacher/assignments/new')
  }, [navigate])

  // Handler for statistics card clicks (optional navigation)
  const handleStatisticClick = useCallback(
    (statisticId: string) => {
      // Navigate to relevant pages based on statistic type
      const routeMap: Record<string, string> = {
        'active-assignments': '/teacher/assignments',
        'pending-grading': '/teacher/grading',
        'avg-class-score': '/teacher/analytics',
        'active-classes': '/teacher/classes',
        'total-students': '/teacher/students',
        'completion-rate': '/teacher/analytics',
      }

      const route = routeMap[statisticId]
      if (route) {
        navigate(route)
      }
    },
    [navigate]
  )

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Greeting & CTA Section */}
        <GreetingSection
          firstName={user?.first_name || 'Teacher'}
          lastName={user?.last_name}
          role={user?.role || 'teacher'}
          onCreateAssignment={handleCreateAssignment}
        />

        {/* Overview Statistics Section (KAN-34) */}
        <OverviewStatistics
          statistics={statistics}
          isLoading={isLoading}
          error={error}
          columns={3}
          onCardClick={handleStatisticClick}
          onRetry={refetch}
        />

        {/* Main Content Grid: Assignments & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Assignments Section (2/3 width) - KAN-40, KAN-43 */}
          <div className="lg:col-span-2">
            <AssignmentsList
              assignments={assignments}
              isLoading={assignmentsLoading || progressLoading}
              error={assignmentsError}
              onRetry={refetchAssignments}
              viewAllHref="/teacher/assignments"
              title="Current Assignments"
              getSubmissionProgress={getProgress}
              showProgress={true}
            />
          </div>

          {/* Recent Activity & Teacher Tip Section (1/3 width) */}
          <div className="flex flex-col gap-6">
            {/* Recent Activity Feed (KAN-46) */}
            <RecentActivityFeed limit={5} />

            {/* Teacher Tip Card */}
            <div className="bg-gradient-to-br from-primary/20 to-green-200/20 dark:from-primary/10 dark:to-green-900/20 p-5 rounded-2xl border border-primary/20 flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-white dark:bg-surface-dark rounded-full shadow-sm text-primary">
                <span className="material-symbols-outlined">tips_and_updates</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Teacher Tip</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Try the Question Bank to quickly generate quizzes for your next class!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TeacherDashboard
