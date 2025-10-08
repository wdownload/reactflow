import assert from "node:assert/strict"
import { describe, it } from "node:test"

import defaults from "../data/defaults.json"
import ptTranslations from "../data/translations/pt.json"
import zhTranslations from "../data/translations/zh.json"

import { COLOR_PRESETS, EDGE_COLOR_OPTIONS } from "../lib/mindmap-logic"

describe("defaults configuration", () => {
  it("stays in sync with exported color presets", () => {
    const presetIds = new Set(COLOR_PRESETS.map((preset) => preset.id))
    const edgeIds = new Set(EDGE_COLOR_OPTIONS.map((option) => option.id))

    defaults.colorPresets.forEach((preset) => {
      assert.ok(presetIds.has(preset.id))
    })

    defaults.edgeColors.forEach((edge) => {
      assert.ok(edgeIds.has(edge.id))
    })
  })

  it("provides translations for every configured color", () => {
    const allColorIds = new Set([
      ...defaults.colorPresets.map((preset) => preset.id),
      ...defaults.edgeColors.map((edge) => edge.id),
    ])

    const ptColors = ptTranslations.colors as Record<string, string>
    const zhColors = zhTranslations.colors as Record<string, string>

    allColorIds.forEach((colorId) => {
      assert.ok(ptColors[colorId], `missing pt translation for ${colorId}`)
      assert.ok(zhColors[colorId], `missing zh translation for ${colorId}`)
    })
  })

  it("lists the default emoji at least once", () => {
    assert.ok(defaults.emojiList.includes(defaults.defaults.nodeEmoji))
    assert.ok(defaults.emojiList.includes(defaults.defaults.initialNode.emoji))
  })
})
