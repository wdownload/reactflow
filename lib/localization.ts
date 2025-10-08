import ptTranslations from "@/data/translations/pt.json"
import zhTranslations from "@/data/translations/zh.json"

export type SupportedLanguage = "en" | "pt" | "zh"

export type TranslationBundle = {
  colors: Record<string, string>
  labels: Record<string, string>
}

const TRANSLATIONS: Record<SupportedLanguage, TranslationBundle> = {
  en: { colors: {}, labels: {} },
  pt: ptTranslations as TranslationBundle,
  zh: zhTranslations as TranslationBundle,
}

export function translateColor(
  colorId: string,
  fallback: string,
  language: SupportedLanguage,
): string {
  return TRANSLATIONS[language]?.colors?.[colorId] ?? fallback
}

export function translateLabel(
  labelId: string,
  fallback: string,
  language: SupportedLanguage,
): string {
  return TRANSLATIONS[language]?.labels?.[labelId] ?? fallback
}
