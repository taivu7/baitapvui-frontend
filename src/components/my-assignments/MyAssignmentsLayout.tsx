/**
 * MyAssignmentsLayout Component (KAN-124)
 *
 * Main dashboard layout component for the "My Assignments" page.
 * Provides a responsive layout with:
 * - Page header with title and description
 * - Create New Assignment CTA button
 * - Content area for assignment cards/grid
 *
 * Follows mobile-first responsive design using Tailwind CSS.
 */

import React, { memo } from 'react'
import { MyAssignmentsLayoutProps } from '../../types/myAssignments'

/**
 * MyAssignmentsLayout Component
 *
 * Renders the main layout structure for the My Assignments dashboard.
 * Includes header section with title, subtitle, and create button.
 *
 * @param props - MyAssignmentsLayoutProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <MyAssignmentsLayout
 *   title="My Assignments"
 *   subtitle="Manage and track progress of all your created tasks."
 *   onCreateAssignment={() => navigate('/teacher/assignments/new')}
 * >
 *   <AssignmentGrid assignments={assignments} />
 * </MyAssignmentsLayout>
 * ```
 */
const MyAssignmentsLayout: React.FC<MyAssignmentsLayoutProps> = ({
  title = 'My Assignments',
  subtitle = 'Manage and track progress of all your created tasks.',
  onCreateAssignment,
  children,
  className = '',
}) => {
  return (
    <main
      className={`
        flex-1 overflow-y-auto
        bg-background-light dark:bg-background-dark
        p-6 lg:p-10
        ${className}
      `}
      role="main"
      aria-label="My Assignments Dashboard"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title and Subtitle */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#111813] dark:text-white tracking-tight mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>

          {/* Create New Assignment Button */}
          {onCreateAssignment && (
            <button
              onClick={onCreateAssignment}
              className="
                flex items-center justify-center gap-2
                bg-primary hover:bg-green-400
                text-[#0d3b1e]
                px-6 py-3
                rounded-xl
                font-bold
                transition-all
                shadow-lg shadow-green-500/20
                active:scale-95
                group
              "
              aria-label="Create a new assignment"
            >
              <span
                className="material-symbols-outlined group-hover:rotate-90 transition-transform"
                aria-hidden="true"
              >
                add
              </span>
              <span>Create New Assignment</span>
            </button>
          )}
        </header>

        {/* Main Content Area */}
        {children}
      </div>
    </main>
  )
}

export default memo(MyAssignmentsLayout)
