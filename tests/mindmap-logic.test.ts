import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_EMOJI,
  DEFAULT_NODE_LABEL,
  EDGE_COLORS,
  EDGE_COLOR_OPTIONS,
  EXTENDED_EMOJI_LIST,
  buildMindmapExport,
  createMindMapNode,
  assignSourceColor,
  autoArrangeNodes,
  pushHistory,
  type MindMapHistoryState,
} from "../lib/mindmap-logic"

import type { Edge, Node } from "@xyflow/react"

describe("createMindMapNode", () => {
  it("applies defaults and id conversion", () => {
    const randomValues = [0.2, 0.4]
    let callIndex = 0
    const random = () => randomValues[callIndex++ % randomValues.length]

    const node = createMindMapNode(5, undefined, random)

    assert.equal(node.id, "5")
    assert.equal(node.type, "mindmap")
    assert.deepEqual(node.data, {
      label: DEFAULT_NODE_LABEL,
      emoji: DEFAULT_NODE_EMOJI,
      color: DEFAULT_NODE_COLOR,
    })
    assert.ok(Math.abs(node.position.x - (0.2 * 500 + 100)) < 1e-6)
    assert.ok(Math.abs(node.position.y - (0.4 * 500 + 100)) < 1e-6)
  })

  it("supports overriding the emoji while keeping defaults", () => {
    const node = createMindMapNode("abc", "🎯", () => 0.5)

    assert.equal(node.id, "abc")
    assert.equal(node.data.emoji, "🎯")
    assert.equal(node.data.label, DEFAULT_NODE_LABEL)
    assert.equal(node.data.color, DEFAULT_NODE_COLOR)
  })
})

describe("assignSourceColor", () => {
  it("reuses palette intelligently", () => {
    const first = assignSourceColor("1", {})
    assert.equal(first.color, EDGE_COLORS[0])
    assert.equal(first.map["1"], EDGE_COLORS[0])

    const second = assignSourceColor("2", first.map)
    assert.equal(second.color, EDGE_COLORS[1])
    assert.equal(second.map["1"], EDGE_COLORS[0])
    assert.equal(second.map["2"], EDGE_COLORS[1])

    const repeated = assignSourceColor("1", second.map)
    assert.equal(repeated.color, EDGE_COLORS[0])
    assert.deepEqual(repeated.map, second.map)

    const filledPalette = EDGE_COLORS.reduce<Record<string, string>>((acc, color, index) => {
      acc[`node-${index}`] = color
      return acc
    }, {})

    const recycled = assignSourceColor("fresh", filledPalette)
    assert.equal(recycled.color, EDGE_COLORS[0])
    assert.equal(recycled.map.fresh, EDGE_COLORS[0])
  })

  it("keeps previously selected colors for the same source", () => {
    const initial = assignSourceColor("source", {})
    const next = assignSourceColor("source", initial.map)

    assert.equal(initial.color, next.color)
    assert.deepEqual(initial.map, next.map)
  })
})

describe("autoArrangeNodes", () => {
  it("places tree levels deterministically", () => {
    const nodes: Node[] = [
      { id: "1", type: "mindmap", data: {}, position: { x: 0, y: 0 } },
      { id: "2", type: "mindmap", data: {}, position: { x: 0, y: 0 } },
      { id: "3", type: "mindmap", data: {}, position: { x: 0, y: 0 } },
    ]

    const edges: Edge[] = [
      { id: "1-2", source: "1", target: "2" },
      { id: "1-3", source: "1", target: "3" },
    ] as Edge[]

    const arranged = autoArrangeNodes(nodes, edges)

    const node1 = arranged.find((node) => node.id === "1")!
    const node2 = arranged.find((node) => node.id === "2")!
    const node3 = arranged.find((node) => node.id === "3")!

    assert.equal(node1.position.x, 100)
    assert.equal(node1.position.y, 200)
    assert.equal(node2.position.x, 400)
    assert.equal(node2.position.y, 200)
    assert.equal(node3.position.x, 400)
    assert.equal(node3.position.y, 350)
  })

  it("randomises disconnected graphs", () => {
    const nodes: Node[] = [
      { id: "1", type: "mindmap", data: {}, position: { x: 0, y: 0 } },
      { id: "2", type: "mindmap", data: {}, position: { x: 0, y: 0 } },
    ]

    const edges: Edge[] = [
      { id: "1-2", source: "1", target: "1" },
      { id: "loop", source: "2", target: "2" },
    ] as Edge[]

    const randomValues = [0.1, 0.3, 0.5, 0.7]
    let index = 0
    const random = () => randomValues[index++ % randomValues.length]

    const arranged = autoArrangeNodes(nodes, edges, random)

    assert.ok(Math.abs(arranged[0].position.x - (0.1 * 800 + 100)) < 1e-6)
    assert.ok(Math.abs(arranged[0].position.y - (0.3 * 600 + 100)) < 1e-6)
    assert.ok(Math.abs(arranged[1].position.x - (0.5 * 800 + 100)) < 1e-6)
    assert.ok(Math.abs(arranged[1].position.y - (0.7 * 600 + 100)) < 1e-6)
  })
})

describe("pushHistory", () => {
  it("trims entries beyond the limit", () => {
    const initial: MindMapHistoryState[] = [{ nodes: [], edges: [] }]
    let result = { history: initial, index: 0 }

    for (let i = 0; i < 55; i++) {
      result = pushHistory(result.history, result.index, {
        nodes: [{ id: String(i), type: "mindmap", data: {}, position: { x: i, y: i } }] as Node[],
        edges: [],
      })
    }

    assert.equal(result.history.length, 50)
    assert.equal(result.index, 49)
    assert.equal(result.history[0].nodes[0]?.id, "5")
    assert.equal(result.history[49].nodes[0]?.id, "54")
  })
})

describe("buildMindmapExport", () => {
  it("serialises nodes and edges", () => {
    const nodes: Node[] = [
      { id: "1", type: "mindmap", data: { label: "Test" }, position: { x: 10, y: 20 } },
    ]
    const edges: Edge[] = [
      { id: "e1", source: "1", target: "1", data: { color: "red" } },
    ] as Edge[]

    const json = buildMindmapExport(nodes, edges)
    const parsed = JSON.parse(json)

    assert.deepEqual(parsed, { nodes, edges })
  })
})

describe("default configuration", () => {
  it("exposes matching color metadata", () => {
    assert.equal(EDGE_COLOR_OPTIONS.length, EDGE_COLORS.length)
    EDGE_COLOR_OPTIONS.forEach((option) => {
      assert.ok(option.id.length > 0)
      assert.ok(option.name.length > 0)
      assert.ok(option.value.length > 0)
    })
  })

  it("includes emojis for interactive palette", () => {
    assert.ok(EXTENDED_EMOJI_LIST.length > 0)
    assert.ok(EXTENDED_EMOJI_LIST.includes(DEFAULT_NODE_EMOJI))
  })
})
