/**
 * useTranslation Hook
 *
 * React hook for accessing translations in components.
 * Provides a t() function and language switching capabilities.
 */

import { useState, useCallback, useMemo } from 'react'
import i18n, { t as translate, SupportedLanguage, TranslationParams } from '../i18n'

// =============================================================================
// Types
// =============================================================================

export interface UseTranslationReturn {
  /**
   * Translate a key with optional interpolation
   */
  t: (key: string, params?: TranslationParams, options?: { count?: number }) => string

  /**
   * Current language code
   */
  language: SupportedLanguage

  /**
   * Change the current language
   */
  setLanguage: (lang: SupportedLanguage) => void

  /**
   * Available languages
   */
  availableLanguages: SupportedLanguage[]
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for accessing translations
 *
 * @param namespace - Optional namespace prefix for all keys
 * @returns Translation function and language utilities
 *
 * @example
 * ```tsx
 * const { t, language, setLanguage } = useTranslation()
 *
 * // Basic usage
 * t('importQuestions.title') // "Import Questions"
 *
 * // With parameters
 * t('importQuestions.dropzone.maxFileSize', { size: '10MB' }) // "Max 10MB"
 *
 * // With namespace
 * const { t } = useTranslation('importQuestions')
 * t('title') // "Import Questions" (automatically prefixed with 'importQuestions.')
 * ```
 */
export function useTranslation(namespace?: string): UseTranslationReturn {
  const [language, setLanguageState] = useState<SupportedLanguage>(i18n.getLanguage())

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    i18n.setLanguage(lang)
    setLanguageState(lang)
  }, [])

  const t = useCallback(
    (key: string, params?: TranslationParams, options?: { count?: number }) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return translate(fullKey, params, { lang: language, count: options?.count })
    },
    [namespace, language]
  )

  const availableLanguages = useMemo<SupportedLanguage[]>(() => ['en', 'vi'], [])

  return {
    t,
    language,
    setLanguage,
    availableLanguages,
  }
}

export default useTranslation
