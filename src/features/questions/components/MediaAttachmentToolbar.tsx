/**
 * MediaAttachmentToolbar Component
 *
 * Implements KAN-80: Implement Media Attachment for Questions
 *
 * Toolbar for uploading and managing media attachments (images, audio, video).
 */

import React, { useRef, useState } from 'react'
import { MediaAttachmentToolbarProps, MediaType } from '../types'
import { getMediaTypeIcon, formatFileSize } from '../utils'

const MediaAttachmentToolbar: React.FC<MediaAttachmentToolbarProps> = ({
  media,
  onUpload,
  onDelete,
  isUploading = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const mediaButtons: Array<{ type: MediaType; label: string; icon: string; accept: string }> = [
    {
      type: 'image',
      label: 'Image',
      icon: 'image',
      accept: 'image/png,image/jpeg,image/jpg,image/gif',
    },
    {
      type: 'audio',
      label: 'Audio',
      icon: 'music_note',
      accept: 'audio/mpeg,audio/mp3,audio/wav',
    },
    {
      type: 'video',
      label: 'Video',
      icon: 'videocam',
      accept: 'video/mp4,video/webm',
    },
  ]

  const handleButtonClick = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    try {
      await onUpload(file)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload media'
      setUploadError(message)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (mediaId: string) => {
    setUploadError(null)
    try {
      await onDelete(mediaId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete media'
      setUploadError(message)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        {mediaButtons.map((btn) => (
          <button
            key={btn.type}
            type="button"
            onClick={() => handleButtonClick(btn.accept)}
            disabled={isUploading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-white dark:bg-[#102216] text-gray-700 dark:text-gray-300
              border border-gray-200 dark:border-[#2a3c30]
              hover:bg-gray-50 dark:hover:bg-[#1a2c20]
              transition-all
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {btn.icon}
            </span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload media file"
      />

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="material-symbols-outlined text-red-500 text-xl">error</span>
          <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-blue-700 dark:text-blue-400">Uploading media...</p>
        </div>
      )}

      {/* Media previews */}
      {media.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Attached Media
          </h4>
          <div className="space-y-2">
            {media.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-[#102216] border border-gray-200 dark:border-[#2a3c30] rounded-lg"
              >
                {/* Media preview */}
                <div className="flex-shrink-0">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt="Attached"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-[#0d1a12] rounded">
                      <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 text-2xl">
                        {getMediaTypeIcon(item.type)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Media info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.filename || `${item.type} attachment`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.type}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete media"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    delete
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaAttachmentToolbar
