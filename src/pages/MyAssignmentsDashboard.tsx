/**
 * MyAssignmentsDashboard Page (KAN-126)
 *
 * Main dashboard container component for the "My Assignments" page.
 * Part of the "View My Assignments Dashboard" story (KAN-117).
 *
 * This component orchestrates:
 * - Layout component (KAN-124)
 * - Data fetching hook (KAN-125)
 * - Filter tabs for status filtering
 * - Assignment cards grid
 * - Loading, error, and empty states
 *
 * Features:
 * - Lists all assignments created by the logged-in teacher
 * - Filters by status (All, Active, Drafts, Completed)
 * - Create New Assignment button
 * - Responsive grid layout
 */

import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MyAssignmentsLayout,
  AssignmentFilterTabs,
  AssignmentsGrid,
} from '../components/my-assignments'
import useMyAssignments from '../hooks/useMyAssignments'
import { Assignment, MyAssignmentsDashboardProps } from '../types/myAssignments'

/**
 * MyAssignmentsDashboard Component
 *
 * Main container for the My Assignments dashboard page.
 * Integrates the layout, data fetching hook, and grid components.
 *
 * @param props - MyAssignmentsDashboardProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * // In App.tsx routes
 * <Route
 *   path="/teacher/assignments"
 *   element={
 *     <RoleBasedRoute allowedRole="teacher">
 *       <DashboardLayout>
 *         <MyAssignmentsDashboard />
 *       </DashboardLayout>
 *     </RoleBasedRoute>
 *   }
 * />
 * ```
 */
const MyAssignmentsDashboard: React.FC<MyAssignmentsDashboardProps> = ({
  className = '',
}) => {
  const navigate = useNavigate()

  // Fetch assignments using the custom hook (KAN-125)
  const {
    filteredAssignments,
    isLoading,
    error,
    refetch,
    statusFilter,
    setStatusFilter,
    statusCounts,
  } = useMyAssignments()

  /**
   * Handle "Create New Assignment" button click
   */
  const handleCreateAssignment = useCallback(() => {
    navigate('/teacher/assignments/new')
  }, [navigate])

  /**
   * Handle assignment card click
   * Navigates to assignment detail/edit page based on status
   */
  const handleAssignmentClick = useCallback(
    (assignment: Assignment) => {
      if (assignment.status === 'draft') {
        // Navigate to edit page for drafts
        navigate(`/teacher/assignments/${assignment.id}/edit`)
      } else if (assignment.status === 'closed') {
        // Navigate to results page for completed assignments
        navigate(`/teacher/assignments/${assignment.id}/results`)
      } else {
        // Navigate to management page for active assignments
        navigate(`/teacher/assignments/${assignment.id}`)
      }
    },
    [navigate]
  )

  return (
    <MyAssignmentsLayout
      title="My Assignments"
      subtitle="Manage and track progress of all your created tasks."
      onCreateAssignment={handleCreateAssignment}
      className={className}
    >
      {/* Filter Tabs */}
      <AssignmentFilterTabs
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        counts={statusCounts}
        className="mb-2"
      />

      {/* Assignments Grid */}
      <AssignmentsGrid
        assignments={filteredAssignments}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onAssignmentClick={handleAssignmentClick}
        onCreateClick={handleCreateAssignment}
        currentFilter={statusFilter}
        showCreateCard={!isLoading && !error}
      />
    </MyAssignmentsLayout>
  )
}

export default MyAssignmentsDashboard
