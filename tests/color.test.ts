import assert from "node:assert/strict"
import { describe, it, beforeEach, afterEach } from "node:test"

import { isValidCssColor } from "../lib/color.ts"

describe("isValidCssColor", () => {
  let originalCSS: typeof globalThis.CSS

  beforeEach(() => {
    originalCSS = globalThis.CSS
    // Ensure CSS API is not defined unless explicitly set inside a test
    // @ts-expect-error - allow manipulating the global for tests
    delete globalThis.CSS
  })

  afterEach(() => {
    if (originalCSS) {
      globalThis.CSS = originalCSS
    } else {
      // @ts-expect-error - cleanup test mutation
      delete globalThis.CSS
    }
  })

  it("returns true for valid hex values", () => {
    assert.equal(isValidCssColor("#123abc"), true)
    assert.equal(isValidCssColor("#fff"), true)
  })

  it("returns true for valid functional color notations", () => {
    assert.equal(isValidCssColor("rgb(255, 0, 0)"), true)
    assert.equal(isValidCssColor("rgba(34, 12, 64, 0.5)"), true)
    assert.equal(isValidCssColor("hsl(210, 50%, 40%)"), true)
    assert.equal(isValidCssColor("hsla(90, 100%, 50%, 0.75)"), true)
  })

  it("returns false for invalid entries", () => {
    assert.equal(isValidCssColor(""), false)
    assert.equal(isValidCssColor("invalid-color"), false)
    assert.equal(isValidCssColor("#12"), false)
  })

  it("defers to CSS.supports when available", () => {
    // @ts-expect-error - simulate browser CSS API
    globalThis.CSS = {
      supports: (property: string, value: string) => property === "color" && value === "papayawhip",
    }

    assert.equal(isValidCssColor("papayawhip"), true)

    // @ts-expect-error - simulate environment rejecting the value
    globalThis.CSS = {
      supports: () => false,
    }

    assert.equal(isValidCssColor("papayawhip"), false)
  })
})
