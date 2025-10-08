export function isValidCssColor(value: string): boolean {
  if (typeof value !== "string") {
    return false
  }

  const normalized = value.trim()
  if (!normalized) {
    return false
  }

  if (typeof window !== "undefined" && window.CSS?.supports) {
    return window.CSS.supports("color", normalized)
  }

  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("color", normalized)
  }

  if (typeof document !== "undefined") {
    const element = document.createElement("div")
    element.style.color = ""
    element.style.color = normalized
    return element.style.color !== ""
  }

  const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  const RGB_REGEX = /^rgb\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*\)$/
  const RGBA_REGEX = /^rgba\(\s*(?:\d{1,3}%?\s*,\s*){3}(?:0|1|0?\.\d+)\s*\)$/
  const HSL_REGEX = /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/
  const HSLA_REGEX = /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)$/

  return (
    HEX_REGEX.test(normalized) ||
    RGB_REGEX.test(normalized) ||
    RGBA_REGEX.test(normalized) ||
    HSL_REGEX.test(normalized) ||
    HSLA_REGEX.test(normalized)
  )
}
