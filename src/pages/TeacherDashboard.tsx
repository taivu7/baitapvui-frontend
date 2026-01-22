/**
 * TeacherDashboard Page
 *
 * Main dashboard page for teachers displaying:
 * - Personalized greeting section
 * - Global search input (KAN-49)
 * - Overview statistics cards (KAN-34)
 * - Current assignments list with submission progress (KAN-40, KAN-43)
 * - Recent activity feed
 * - Teacher tips
 */

import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GreetingSection, OverviewStatistics } from '../components/dashboard'
import { AssignmentsList } from '../components/assignments'
import { SearchInput } from '../components/search'
import { useTeacherStatistics, useTeacherAssignments, useSubmissionProgress, useSearch } from '../hooks'
import { SearchResultItem } from '../types/search'

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

  // Global search state and handlers (KAN-49)
  const {
    query: searchQuery,
    results: searchResults,
    isLoading: searchLoading,
    error: searchError,
    setQuery: setSearchQuery,
    clearSearch,
  } = useSearch({ debounceDelay: 300, minCharacters: 2, limit: 8 })

  // Handler for search input changes (KAN-49)
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [setSearchQuery])

  // Handler for search result selection (KAN-49)
  const handleSearchResultSelect = useCallback((result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href)
    }
    clearSearch()
  }, [navigate, clearSearch])

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

  // Mock data for recent activities (to be replaced with real data in future)
  const mockActivities = [
    {
      id: 1,
      studentName: 'Minh Tuan',
      action: 'submitted',
      target: 'Math Homework',
      time: '2 mins ago',
      hasAvatar: true,
    },
    {
      id: 2,
      studentName: 'Linh Chi',
      action: 'asked a question in',
      target: 'Class 9B',
      time: '15 mins ago',
      hasAvatar: true,
    },
    {
      id: 3,
      studentName: 'System',
      action: 'Class 5A average score updated',
      target: '',
      time: '1 hour ago',
      hasAvatar: false,
      isSystem: true,
    },
    {
      id: 4,
      studentName: 'Bao Nam',
      action: 'joined',
      target: 'Physics 101',
      time: '2 hours ago',
      hasAvatar: true,
    },
  ]

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

        {/* Global Search Section (KAN-49) */}
        <section aria-label="Global Search" className="w-full max-w-2xl">
          <SearchInput
            placeholder="Search classes, assignments, or students..."
            onChange={handleSearchChange}
            onResultSelect={handleSearchResultSelect}
            onClear={clearSearch}
            isLoading={searchLoading}
            error={searchError}
            results={searchResults}
            showResults={searchQuery.length >= 2}
            size="lg"
            debounceDelay={300}
            minCharacters={2}
            ariaLabel="Search classes, assignments, or students"
            id="teacher-dashboard-search"
          />
        </section>

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
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#111813] dark:text-white">Recent Activity</h3>
            </div>

            {/* Activity Feed */}
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {mockActivities.map((activity, index) => (
                <div key={activity.id} className={`flex gap-3 py-3 ${index === 0 ? 'pt-0' : ''} ${index === mockActivities.length - 1 ? 'pb-0' : ''}`}>
                  {activity.isSystem ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full size-10 shrink-0 flex items-center justify-center text-gray-500">
                      <span className="material-symbols-outlined text-sm">school</span>
                    </div>
                  ) : (
                    <div className="bg-primary/20 rounded-full size-10 shrink-0 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.isSystem ? (
                        <>
                          System: <span className="font-medium">{activity.action}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold">{activity.studentName}</span> {activity.action}{' '}
                          {activity.target && <span className="font-medium text-primary">{activity.target}</span>}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

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
