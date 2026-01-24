/**
 * AssignmentCreationContext
 *
 * React Context for managing assignment creation state with persistence.
 * Implements KAN-67: Persist Assignment Basic Info State
 *
 * Features:
 * - Centralized state management with useReducer
 * - sessionStorage persistence for page refresh resilience
 * - Automatic state restoration on component mount
 * - Clean state reset functionality
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import {
  AssignmentFormData,
  AssignmentSettings,
  AssignmentVisibility,
  AssignmentCreationAction,
  DEFAULT_ASSIGNMENT_FORM_DATA,
  ASSIGNMENT_CREATION_STORAGE_KEY,
} from '../types/assignmentCreation'

/**
 * Context value interface
 */
interface AssignmentCreationContextValue {
  /** Current form data state */
  formData: AssignmentFormData
  /** Whether form has unsaved changes */
  isDirty: boolean
  /** Update draft ID (from backend response) */
  setDraftId: (draftId: string | null) => void
  /** Update assignment title */
  setTitle: (title: string) => void
  /** Update assignment description */
  setDescription: (description: string) => void
  /** Update all settings at once */
  setSettings: (settings: Partial<AssignmentSettings>) => void
  /** Update specific settings */
  setClassId: (classId: string) => void
  setDueDate: (dueDate: string | null) => void
  setDueTime: (dueTime: string | null) => void
  setVisibility: (visibility: AssignmentVisibility) => void
  setMaxAttempts: (maxAttempts: number | null) => void
  /** Reset form to initial state and clear storage */
  resetForm: () => void
  /** Clear only the stored data without resetting current state */
  clearStorage: () => void
}

/**
 * Assignment creation reducer
 */
function assignmentCreationReducer(
  state: AssignmentFormData,
  action: AssignmentCreationAction
): AssignmentFormData {
  switch (action.type) {
    case 'SET_DRAFT_ID':
      return { ...state, draftId: action.payload }

    case 'SET_TITLE':
      return { ...state, title: action.payload }

    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload }

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }

    case 'SET_CLASS_ID':
      return {
        ...state,
        settings: { ...state.settings, classId: action.payload },
      }

    case 'SET_DUE_DATE':
      return {
        ...state,
        settings: { ...state.settings, dueDate: action.payload },
      }

    case 'SET_DUE_TIME':
      return {
        ...state,
        settings: { ...state.settings, dueTime: action.payload },
      }

    case 'SET_VISIBILITY':
      return {
        ...state,
        settings: { ...state.settings, visibility: action.payload },
      }

    case 'SET_MAX_ATTEMPTS':
      return {
        ...state,
        settings: { ...state.settings, maxAttempts: action.payload },
      }

    case 'RESET':
      return { ...DEFAULT_ASSIGNMENT_FORM_DATA }

    case 'LOAD_FROM_STORAGE':
      return action.payload

    default:
      return state
  }
}

/**
 * Helper function to safely parse stored data
 */
function loadFromStorage(): AssignmentFormData | null {
  try {
    const stored = sessionStorage.getItem(ASSIGNMENT_CREATION_STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored) as AssignmentFormData

    // Validate the structure
    if (
      typeof parsed.title !== 'string' ||
      typeof parsed.description !== 'string' ||
      !parsed.settings ||
      typeof parsed.settings.classId !== 'string'
    ) {
      console.warn('Invalid stored assignment data, clearing storage')
      sessionStorage.removeItem(ASSIGNMENT_CREATION_STORAGE_KEY)
      return null
    }

    // Ensure draftId exists (for backwards compatibility)
    if (parsed.draftId === undefined) {
      parsed.draftId = null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to parse stored assignment data:', error)
    sessionStorage.removeItem(ASSIGNMENT_CREATION_STORAGE_KEY)
    return null
  }
}

/**
 * Helper function to save data to storage
 */
function saveToStorage(data: AssignmentFormData): void {
  try {
    sessionStorage.setItem(ASSIGNMENT_CREATION_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save assignment data to storage:', error)
  }
}

/**
 * Helper function to check if form has any data
 */
function hasFormData(data: AssignmentFormData): boolean {
  return (
    data.title.trim() !== '' ||
    data.description.trim() !== '' ||
    data.settings.classId !== '' ||
    data.settings.dueDate !== null ||
    data.settings.dueTime !== null ||
    data.settings.maxAttempts !== null
  )
}

// Create the context
const AssignmentCreationContext = createContext<AssignmentCreationContextValue | undefined>(
  undefined
)

/**
 * Provider component for AssignmentCreationContext
 */
interface AssignmentCreationProviderProps {
  children: ReactNode
}

export const AssignmentCreationProvider: React.FC<AssignmentCreationProviderProps> = ({
  children,
}) => {
  // Initialize state with default values
  const [formData, dispatch] = useReducer(
    assignmentCreationReducer,
    DEFAULT_ASSIGNMENT_FORM_DATA
  )

  // Track if form has unsaved changes
  const isDirty = useMemo(() => hasFormData(formData), [formData])

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = loadFromStorage()
    if (storedData) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: storedData })
    }
  }, [])

  // Save to sessionStorage whenever formData changes
  useEffect(() => {
    // Only save if there's actual data
    if (hasFormData(formData)) {
      saveToStorage(formData)
    }
  }, [formData])

  // Action creators
  const setDraftId = useCallback((draftId: string | null) => {
    dispatch({ type: 'SET_DRAFT_ID', payload: draftId })
  }, [])

  const setTitle = useCallback((title: string) => {
    dispatch({ type: 'SET_TITLE', payload: title })
  }, [])

  const setDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description })
  }, [])

  const setSettings = useCallback((settings: Partial<AssignmentSettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings })
  }, [])

  const setClassId = useCallback((classId: string) => {
    dispatch({ type: 'SET_CLASS_ID', payload: classId })
  }, [])

  const setDueDate = useCallback((dueDate: string | null) => {
    dispatch({ type: 'SET_DUE_DATE', payload: dueDate })
  }, [])

  const setDueTime = useCallback((dueTime: string | null) => {
    dispatch({ type: 'SET_DUE_TIME', payload: dueTime })
  }, [])

  const setVisibility = useCallback((visibility: AssignmentVisibility) => {
    dispatch({ type: 'SET_VISIBILITY', payload: visibility })
  }, [])

  const setMaxAttempts = useCallback((maxAttempts: number | null) => {
    dispatch({ type: 'SET_MAX_ATTEMPTS', payload: maxAttempts })
  }, [])

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET' })
    sessionStorage.removeItem(ASSIGNMENT_CREATION_STORAGE_KEY)
  }, [])

  const clearStorage = useCallback(() => {
    sessionStorage.removeItem(ASSIGNMENT_CREATION_STORAGE_KEY)
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AssignmentCreationContextValue>(
    () => ({
      formData,
      isDirty,
      setDraftId,
      setTitle,
      setDescription,
      setSettings,
      setClassId,
      setDueDate,
      setDueTime,
      setVisibility,
      setMaxAttempts,
      resetForm,
      clearStorage,
    }),
    [
      formData,
      isDirty,
      setDraftId,
      setTitle,
      setDescription,
      setSettings,
      setClassId,
      setDueDate,
      setDueTime,
      setVisibility,
      setMaxAttempts,
      resetForm,
      clearStorage,
    ]
  )

  return (
    <AssignmentCreationContext.Provider value={contextValue}>
      {children}
    </AssignmentCreationContext.Provider>
  )
}

/**
 * Custom hook to access assignment creation context
 */
export function useAssignmentCreation(): AssignmentCreationContextValue {
  const context = useContext(AssignmentCreationContext)
  if (!context) {
    throw new Error(
      'useAssignmentCreation must be used within an AssignmentCreationProvider'
    )
  }
  return context
}

export default AssignmentCreationContext
