/**
 * Question Builder Feature
 *
 * Main export file for the question builder feature.
 * Provides all components, hooks, types, and utilities.
 */

// Components
export * from './components'

// Context and hooks
export { QuestionBuilderProvider, useQuestionBuilder } from './context'
export * from './hooks'

// Types
export type {
  Question,
  DraftQuestion,
  QuestionType,
  QuestionOption,
  MediaAttachment,
  MediaType,
  QuestionBuilderState,
  QuestionBuilderContextValue,
  QuestionBuilderProps,
} from './types'

// API
export { default as questionApi } from './api'

// Utils
export * from './utils'
