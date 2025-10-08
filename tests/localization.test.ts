import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { translateColor, translateLabel } from "../lib/localization"
import { EDGE_COLOR_OPTIONS, DEFAULT_NODE_LABEL, DEFAULT_NODE_LABEL_ID } from "../lib/mindmap-logic"

describe("translateColor", () => {
  it("returns localized names when available", () => {
    const sample = EDGE_COLOR_OPTIONS[0]
    const translated = translateColor(sample.id, sample.name, "pt")

    assert.notEqual(translated, sample.name)
    assert.ok(translated.length > 0)
  })

  it("falls back to source text when missing", () => {
    const fallback = translateColor("non-existent", "Magenta", "zh")
    assert.equal(fallback, "Magenta")
  })
})

describe("translateLabel", () => {
  it("resolves localized strings for known labels", () => {
    const translated = translateLabel(DEFAULT_NODE_LABEL_ID, DEFAULT_NODE_LABEL, "zh")

    assert.notEqual(translated, DEFAULT_NODE_LABEL)
    assert.ok(translated.length > 0)
  })

  it("uses fallback for unsupported language", () => {
    const translated = translateLabel("centralIdea", "Central Idea", "en")
    assert.equal(translated, "Central Idea")
  })
})
