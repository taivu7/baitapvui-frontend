/**
 * Question Builder Utility Functions
 */

/**
 * Generate a simple UUID v4
 * This is a lightweight implementation to avoid external dependencies
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if a question has unsaved changes
 */
export function hasUnsavedChanges(question: { isSaved: boolean }): boolean {
  return !question.isSaved
}

/**
 * Get media type icon name (for Material Symbols)
 */
export function getMediaTypeIcon(type: 'image' | 'audio' | 'video'): string {
  const icons = {
    image: 'image',
    audio: 'music_note',
    video: 'videocam',
  }
  return icons[type]
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
