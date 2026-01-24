/**
 * QuestionEditor Component
 *
 * Implements KAN-75, KAN-76, KAN-78, KAN-79, KAN-80
 *
 * Main editor component for creating and editing questions.
 * Includes content editor, type toggle, options management, and media attachments.
 */

import React, { useState } from 'react'
import { QuestionEditorProps } from '../types'
import { useQuestionBuilder } from '../context'
import QuestionTypeToggle from './QuestionTypeToggle'
import MultipleChoiceOptions from './MultipleChoiceOptions'
import MediaAttachmentToolbar from './MediaAttachmentToolbar'
import Textarea from '../../../components/ui/Textarea'

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onDelete,
  className = '',
}) => {
  const {
    setQuestionType,
    setQuestionContent,
    addOption,
    updateOption,
    deleteOption,
    setCorrectOption,
    uploadMedia,
    deleteMedia,
  } = useQuestionBuilder()

  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleTypeChange = (type: 'multiple_choice' | 'essay') => {
    setQuestionType(question.id, type)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestionContent(question.id, e.target.value)
  }

  const handleUploadMedia = async (file: File) => {
    setIsUploadingMedia(true)
    try {
      await uploadMedia(question.id, file)
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    await deleteMedia(question.id, mediaId)
  }

  const handleDelete = () => {
    if (deleteConfirmOpen) {
      onDelete()
      setDeleteConfirmOpen(false)
    } else {
      setDeleteConfirmOpen(true)
      setTimeout(() => setDeleteConfirmOpen(false), 3000)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with type toggle and delete button */}
      <div className="flex items-center justify-between">
        <QuestionTypeToggle value={question.type} onChange={handleTypeChange} />

        <button
          type="button"
          onClick={handleDelete}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              deleteConfirmOpen
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white dark:bg-[#102216] text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
            }
          `}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            delete
          </span>
          <span>{deleteConfirmOpen ? 'Click again to confirm' : 'Delete Question'}</span>
        </button>
      </div>

      {/* Question content editor */}
      <div>
        <label
          htmlFor={`question-content-${question.id}`}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          Question Content
        </label>
        <Textarea
          id={`question-content-${question.id}`}
          value={question.content}
          onChange={handleContentChange}
          placeholder="Enter your question here..."
          rows={4}
          className="w-full"
        />
        {!question.content.trim() && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            Question content is required
          </p>
        )}
      </div>

      {/* Media attachment toolbar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Media Attachments
        </h3>
        <MediaAttachmentToolbar
          media={question.media}
          onUpload={handleUploadMedia}
          onDelete={handleDeleteMedia}
          isUploading={isUploadingMedia}
        />
      </div>

      {/* Multiple choice options (only for MC type) */}
      {question.type === 'multiple_choice' && (
        <MultipleChoiceOptions
          options={question.options}
          onAddOption={() => addOption(question.id)}
          onUpdateOption={(optionId, text) => updateOption(question.id, optionId, text)}
          onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
          onSetCorrect={(optionId, isCorrect) => setCorrectOption(question.id, optionId, isCorrect)}
        />
      )}

      {/* Essay type info */}
      {question.type === 'essay' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Essay Question
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Students will provide a written response. This question requires manual grading.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save status indicator */}
      {!question.isSaved && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            schedule
          </span>
          <span>Unsaved changes</span>
        </div>
      )}
    </div>
  )
}

export default QuestionEditor
