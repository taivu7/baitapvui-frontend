import React, { useMemo } from 'react'

/**
 * Props for the GreetingSection component
 */
interface GreetingSectionProps {
  /** Teacher's first name for personalized greeting */
  firstName: string
  /** Teacher's last name (optional, for full name display) */
  lastName?: string
  /** User role to display */
  role?: 'teacher' | 'student'
  /** Callback when CTA button is clicked */
  onCreateAssignment?: () => void
  /** Custom class name for additional styling */
  className?: string
}

/**
 * Returns a time-based greeting based on the current hour
 * - 5:00 - 11:59: Good morning
 * - 12:00 - 16:59: Good afternoon
 * - 17:00 - 4:59: Good evening
 */
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
}

/**
 * Capitalizes the first letter of a string
 */
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * GreetingSection Component
 *
 * Displays a personalized greeting section on the Teacher Dashboard with:
 * - Time-based greeting (morning/afternoon/evening)
 * - Teacher name and role
 * - Overview message
 * - CTA button for creating new assignments
 *
 * Supports responsive design and dark mode.
 */
const GreetingSection: React.FC<GreetingSectionProps> = ({
  firstName,
  lastName,
  role = 'teacher',
  onCreateAssignment,
  className = '',
}) => {
  // Memoize greeting to avoid recalculating on every render
  const greeting = useMemo(() => getTimeBasedGreeting(), [])

  // Format display name for greeting (first name only for friendly tone)
  const displayName = useMemo(() => {
    return capitalizeFirstLetter(firstName) || 'Teacher'
  }, [firstName])

  // Format full name for accessibility and potential profile display
  const fullName = useMemo(() => {
    const first = capitalizeFirstLetter(firstName)
    const last = lastName ? capitalizeFirstLetter(lastName) : ''
    return last ? `${first} ${last}` : first
  }, [firstName, lastName])

  // Format the role for display
  const roleLabel = useMemo(() => {
    return capitalizeFirstLetter(role)
  }, [role])

  return (
    <section
      className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${className}`}
      aria-label={`Welcome section for ${fullName}`}
    >
      {/* Greeting Content */}
      <div className="space-y-2">
        {/* Role Badge */}
        <div className="inline-flex items-center gap-1.5">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20"
            role="status"
            aria-label={`Logged in as ${roleLabel}`}
          >
            <span className="material-symbols-outlined text-sm mr-1" aria-hidden="true">
              school
            </span>
            {roleLabel}
          </span>
        </div>

        {/* Main Greeting */}
        <h1 className="text-3xl md:text-4xl font-black text-[#111813] dark:text-white tracking-tight">
          {greeting}, {displayName}!
        </h1>

        {/* Subtitle/Overview */}
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
          Here is an overview of your classes and student progress today.
        </p>
      </div>

      {/* CTA Button - Only visible for teachers */}
      {role === 'teacher' && onCreateAssignment && (
        <button
          onClick={onCreateAssignment}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-green-400 text-[#0d3b1e] px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95 group whitespace-nowrap"
          aria-label="Create a new assignment"
        >
          <span
            className="material-symbols-outlined group-hover:rotate-90 transition-transform"
            aria-hidden="true"
          >
            add
          </span>
          <span>Create Assignment</span>
        </button>
      )}
    </section>
  )
}

export default GreetingSection
