/**
 * i18n Configuration
 *
 * Internationalization setup using a lightweight custom implementation.
 * Supports English and Vietnamese languages.
 *
 * Note: This is a simple implementation. For production, consider using
 * react-i18next for more advanced features like:
 * - Pluralization with ICU format
 * - Lazy loading of translations
 * - Context-based translations
 * - Type-safe translations
 */

import enTranslations from './locales/en.json'
import viTranslations from './locales/vi.json'

// =============================================================================
// Types
// =============================================================================

export type SupportedLanguage = 'en' | 'vi'

export interface TranslationParams {
  [key: string]: string | number
}

type NestedObject = {
  [key: string]: string | NestedObject
}

// =============================================================================
// Configuration
// =============================================================================

const translations: Record<SupportedLanguage, NestedObject> = {
  en: enTranslations,
  vi: viTranslations,
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'en'
const STORAGE_KEY = 'baitapvui_language'

// =============================================================================
// State
// =============================================================================

let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE

/**
 * Initialize language from localStorage or browser settings
 */
export function initializeLanguage(): SupportedLanguage {
  // Try to get from localStorage
  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null
  if (stored && (stored === 'en' || stored === 'vi')) {
    currentLanguage = stored
    return currentLanguage
  }

  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'vi') {
    currentLanguage = 'vi'
  } else {
    currentLanguage = 'en'
  }

  localStorage.setItem(STORAGE_KEY, currentLanguage)
  return currentLanguage
}

/**
 * Get current language
 */
export function getLanguage(): SupportedLanguage {
  return currentLanguage
}

/**
 * Set language
 */
export function setLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang
  localStorage.setItem(STORAGE_KEY, lang)
}

// =============================================================================
// Translation Functions
// =============================================================================

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: NestedObject, path: string): string | undefined {
  const keys = path.split('.')
  let current: NestedObject | string = obj

  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }
    current = current[key]
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * Replace placeholders in a string with provided values
 * Supports {{key}} format
 */
function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key]
    return value !== undefined ? String(value) : match
  })
}

/**
 * Translate a key to the current language
 *
 * @param key - Translation key in dot notation (e.g., 'importQuestions.title')
 * @param params - Optional parameters for interpolation
 * @param options - Additional options
 * @returns Translated string
 *
 * @example
 * t('importQuestions.title') // "Import Questions"
 * t('importQuestions.dropzone.maxFileSize', { size: '10MB' }) // "Max 10MB"
 * t('importQuestions.success.questionsImported', { count: 5 }) // "5 questions have been imported"
 */
export function t(
  key: string,
  params?: TranslationParams,
  options?: { lang?: SupportedLanguage; count?: number }
): string {
  const lang = options?.lang ?? currentLanguage
  const translationSet = translations[lang] ?? translations[DEFAULT_LANGUAGE]

  // Handle pluralization
  if (options?.count !== undefined && options.count !== 1) {
    const pluralKey = `${key}_plural`
    const pluralValue = getNestedValue(translationSet, pluralKey)
    if (pluralValue) {
      return interpolate(pluralValue, { ...params, count: options.count })
    }
  }

  const value = getNestedValue(translationSet, key)

  if (value === undefined) {
    // Fallback to English if not found in current language
    if (lang !== 'en') {
      const fallbackValue = getNestedValue(translations.en, key)
      if (fallbackValue) {
        console.warn(`Missing translation for "${key}" in "${lang}", using English fallback`)
        return interpolate(fallbackValue, params)
      }
    }

    // Return the key itself if not found
    console.warn(`Missing translation for key: "${key}"`)
    return key
  }

  return interpolate(value, params)
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string, lang?: SupportedLanguage): boolean {
  const translationSet = translations[lang ?? currentLanguage]
  return getNestedValue(translationSet, key) !== undefined
}

// Initialize language on module load
initializeLanguage()

// Export default object
const i18n = {
  t,
  getLanguage,
  setLanguage,
  initializeLanguage,
  hasTranslation,
}

export default i18n
