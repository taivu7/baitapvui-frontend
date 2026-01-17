/**
 * TeacherDashboard Page
 *
 * Main dashboard page for teachers displaying:
 * - Personalized greeting section
 * - Overview statistics cards (KAN-34)
 * - Current assignments list
 * - Recent activity feed
 * - Teacher tips
 */

import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GreetingSection, OverviewStatistics } from '../components/dashboard'
import { useTeacherStatistics } from '../hooks'

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch teacher statistics using the custom hook
  const { statistics, isLoading, error, refetch } = useTeacherStatistics()

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

  // Mock data for demonstration (to be replaced with real data)
  const mockAssignments = [
    {
      id: 1,
      title: 'Math Homework - Chapter 3',
      className: 'Class 5A',
      dueDate: 'Due Tomorrow, 10:00 AM',
      submitted: 15,
      total: 30,
      progress: 50,
      icon: 'calculate',
      iconColor: 'orange',
      status: 'active',
    },
    {
      id: 2,
      title: 'Physics Lab Report',
      className: 'Class 9B',
      dueDate: 'Due in 3 Days',
      submitted: 5,
      total: 28,
      progress: 18,
      icon: 'science',
      iconColor: 'blue',
      status: 'active',
    },
    {
      id: 3,
      title: 'English Vocab Quiz',
      className: 'Class 4C',
      dueDate: 'Completed',
      submitted: 25,
      total: 25,
      progress: 100,
      icon: 'translate',
      iconColor: 'pink',
      status: 'completed',
    },
  ]

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

  const getIconColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600',
    }
    return colorMap[color] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-600'
  }

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
          {/* Current Assignments Section (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#111813] dark:text-white">Current Assignments</h3>
              <a className="text-sm font-bold text-primary hover:text-green-400 hover:underline" href="#">
                View All
              </a>
            </div>

            {/* Assignment Cards */}
            {mockAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-4">
                    <div
                      className={`${getIconColorClasses(assignment.iconColor)} p-3 rounded-xl flex items-center justify-center h-12 w-12 shrink-0`}
                    >
                      <span className="material-symbols-outlined">{assignment.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {assignment.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-md font-medium">
                          {assignment.className}
                        </span>
                        <span className="text-gray-400 text-xs">-</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            {assignment.status === 'completed' ? 'check_circle' : 'schedule'}
                          </span>
                          {assignment.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {assignment.status === 'completed' ? 'Grading' : 'Progress'}
                    </span>
                    <span
                      className={`font-bold ${
                        assignment.status === 'completed'
                          ? 'text-green-600 dark:text-primary'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {assignment.status === 'completed'
                        ? 'Done'
                        : `${assignment.submitted}/${assignment.total} Submitted`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
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
