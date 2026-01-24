/**
 * Question Builder Types
 *
 * TypeScript types for the Assignment Question Builder feature.
 * Supports Tasks KAN-75 through KAN-81.
 */

/**
 * Question type enum
 */
export type QuestionType = 'multiple_choice' | 'essay'

/**
 * Media type enum
 */
export type MediaType = 'image' | 'audio' | 'video'

/**
 * Media attachment interface
 */
export interface MediaAttachment {
  id: string
  type: MediaType
  url: string
  filename?: string
}

/**
 * Question option interface (for multiple choice questions)
 */
export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

/**
 * Question interface
 */
export interface Question {
  id: string
  assignmentId: string
  type: QuestionType
  content: string
  order: number
  options?: QuestionOption[]
  media?: MediaAttachment[]
  createdAt: string
  updatedAt: string
}

/**
 * Draft question state (before saving to backend)
 */
export interface DraftQuestion {
  id: string // Local UUID for tracking before backend save
  type: QuestionType
  content: string
  order: number
  options: QuestionOption[]
  media: MediaAttachment[]
  isSaved: boolean // Whether synced with backend
  backendId?: string // ID from backend after save
}

/**
 * Question builder state
 */
export interface QuestionBuilderState {
  questions: DraftQuestion[]
  currentQuestionId: string | null
  isLoading: boolean
  error: string | null
  isDirty: boolean // Has unsaved changes
}

/**
 * API request for creating a question
 */
export interface CreateQuestionRequest {
  type: QuestionType
  content: string
  order: number
  options?: Array<{
    text: string
    isCorrect: boolean
  }>
  mediaIds?: string[]
}

/**
 * API request for updating a question
 */
export interface UpdateQuestionRequest {
  type?: QuestionType
  content?: string
  order?: number
  options?: Array<{
    id?: string
    text: string
    isCorrect: boolean
  }>
  mediaIds?: string[]
}

/**
 * API request for reordering questions
 */
export interface ReorderQuestionsRequest {
  questions: Array<{
    id: string
    order: number
  }>
}

/**
 * API response for question operations
 */
export interface QuestionApiResponse {
  id: string
  assignment_id: string
  type: QuestionType
  content: string
  order: number
  options?: Array<{
    id: string
    text: string
    is_correct: boolean
  }>
  media?: Array<{
    id: string
    type: MediaType
    url: string
  }>
  created_at: string
  updated_at: string
}

/**
 * Media upload API response
 */
export interface MediaUploadResponse {
  id: string
  type: MediaType
  url: string
  filename: string
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  code: string
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

/**
 * Question builder context value
 */
export interface QuestionBuilderContextValue {
  state: QuestionBuilderState
  currentQuestion: DraftQuestion | null

  // Question CRUD operations
  addQuestion: (type?: QuestionType) => void
  updateQuestion: (questionId: string, updates: Partial<DraftQuestion>) => void
  deleteQuestion: (questionId: string) => Promise<void>

  // Question navigation
  setCurrentQuestion: (questionId: string | null) => void

  // Question reordering
  reorderQuestions: (sourceIndex: number, destinationIndex: number) => void
  moveQuestionUp: (questionId: string) => void
  moveQuestionDown: (questionId: string) => void

  // Question type operations
  setQuestionType: (questionId: string, type: QuestionType) => void

  // Question content operations
  setQuestionContent: (questionId: string, content: string) => void

  // Multiple choice options operations
  addOption: (questionId: string) => void
  updateOption: (questionId: string, optionId: string, text: string) => void
  deleteOption: (questionId: string, optionId: string) => void
  setCorrectOption: (questionId: string, optionId: string, isCorrect: boolean) => void

  // Media operations
  uploadMedia: (questionId: string, file: File) => Promise<void>
  deleteMedia: (questionId: string, mediaId: string) => Promise<void>

  // Persistence operations
  saveQuestion: (questionId: string) => Promise<void>
  saveAllQuestions: () => Promise<void>
  loadQuestions: (assignmentId: string) => Promise<void>

  // State management
  resetBuilder: () => void
}

/**
 * Props for QuestionBuilder component
 */
export interface QuestionBuilderProps {
  assignmentId: string
  className?: string
}

/**
 * Props for QuestionEditor component
 */
export interface QuestionEditorProps {
  question: DraftQuestion
  onUpdate: (updates: Partial<DraftQuestion>) => void
  onDelete: () => void
  className?: string
}

/**
 * Props for QuestionList component
 */
export interface QuestionListProps {
  questions: DraftQuestion[]
  currentQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  onReorder: (sourceIndex: number, destinationIndex: number) => void
  onDelete: (questionId: string) => void
  className?: string
}

/**
 * Props for QuestionTypeToggle component
 */
export interface QuestionTypeToggleProps {
  value: QuestionType
  onChange: (type: QuestionType) => void
  disabled?: boolean
  className?: string
}

/**
 * Props for MultipleChoiceOptions component
 */
export interface MultipleChoiceOptionsProps {
  options: QuestionOption[]
  onAddOption: () => void
  onUpdateOption: (optionId: string, text: string) => void
  onDeleteOption: (optionId: string) => void
  onSetCorrect: (optionId: string, isCorrect: boolean) => void
  className?: string
}

/**
 * Props for MediaAttachmentToolbar component
 */
export interface MediaAttachmentToolbarProps {
  media: MediaAttachment[]
  onUpload: (file: File) => Promise<void>
  onDelete: (mediaId: string) => Promise<void>
  isUploading?: boolean
  className?: string
}

/**
 * Default values
 */
export const DEFAULT_DRAFT_QUESTION: Omit<DraftQuestion, 'id' | 'order'> = {
  type: 'multiple_choice',
  content: '',
  options: [],
  media: [],
  isSaved: false,
}

/**
 * Default question builder state
 */
export const DEFAULT_QUESTION_BUILDER_STATE: QuestionBuilderState = {
  questions: [],
  currentQuestionId: null,
  isLoading: false,
  error: null,
  isDirty: false,
}

/**
 * Storage key for sessionStorage persistence
 */
export const QUESTION_BUILDER_STORAGE_KEY = 'baitapvui_question_builder'
