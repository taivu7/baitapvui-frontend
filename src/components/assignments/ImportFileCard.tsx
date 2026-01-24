/**
 * ImportFileCard Component
 *
 * Card for importing questions from document files (DOCX, PDF).
 * Displays an upload area with drag-and-drop support.
 */

import React, { useCallback, useRef, useState } from 'react'

interface ImportFileCardProps {
  onFileSelect?: (file: File) => void
  isUploading?: boolean
  className?: string
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

const ImportFileCard: React.FC<ImportFileCardProps> = ({
  onFileSelect,
  isUploading = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onFileSelect) {
        onFileSelect(file)
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && onFileSelect && ACCEPTED_TYPES.includes(file.type)) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm relative overflow-hidden group ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-8xl text-blue-600">
          upload_file
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        <div className="p-3 bg-white dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-transparent">
          <span className="material-symbols-outlined">upload_file</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Import File</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
            Auto-generate questions from doc
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative z-10 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center
          transition-all cursor-pointer
          ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/40'
              : 'border-blue-300 dark:border-blue-700/50 bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 hover:border-blue-400'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        aria-label="Upload document file"
      >
        {isUploading ? (
          <>
            <span className="material-symbols-outlined text-blue-400 dark:text-blue-300 text-3xl mb-2 animate-spin">
              progress_activity
            </span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              Uploading...
            </span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-blue-400 dark:text-blue-300 text-3xl mb-2 group-hover:scale-110 transition-transform">
              cloud_upload
            </span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              Click to Browse
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              DOCX, PDF supported
            </span>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.doc"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}

export default ImportFileCard
