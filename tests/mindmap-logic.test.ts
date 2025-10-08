import { describe, expect, it } from "@jest/globals"

import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_EMOJI,
  DEFAULT_NODE_LABEL,
  EDGE_COLORS,
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

    expect(node.id).toBe("5")
    expect(node.type).toBe("mindmap")
    expect(node.data).toEqual({
      label: DEFAULT_NODE_LABEL,
      emoji: DEFAULT_NODE_EMOJI,
      color: DEFAULT_NODE_COLOR,
    })
    expect(node.position.x).toBeCloseTo(0.2 * 500 + 100)
    expect(node.position.y).toBeCloseTo(0.4 * 500 + 100)
  })
})

describe("assignSourceColor", () => {
  it("reuses palette intelligently", () => {
    const first = assignSourceColor("1", {})
    expect(first.color).toBe(EDGE_COLORS[0])
    expect(first.map["1"]).toBe(EDGE_COLORS[0])

    const second = assignSourceColor("2", first.map)
    expect(second.color).toBe(EDGE_COLORS[1])
    expect(second.map["1"]).toBe(EDGE_COLORS[0])
    expect(second.map["2"]).toBe(EDGE_COLORS[1])

    const repeated = assignSourceColor("1", second.map)
    expect(repeated.color).toBe(EDGE_COLORS[0])
    expect(repeated.map).toEqual(second.map)

    const filledPalette = EDGE_COLORS.reduce<Record<string, string>>((acc, color, index) => {
      acc[`node-${index}`] = color
      return acc
    }, {})

    const recycled = assignSourceColor("fresh", filledPalette)
    expect(recycled.color).toBe(EDGE_COLORS[0])
    expect(recycled.map.fresh).toBe(EDGE_COLORS[0])
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

    expect(node1.position.x).toBe(100)
    expect(node1.position.y).toBe(200)
    expect(node2.position.x).toBe(400)
    expect(node2.position.y).toBe(200)
    expect(node3.position.x).toBe(400)
    expect(node3.position.y).toBe(350)
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

    expect(arranged[0].position.x).toBeCloseTo(0.1 * 800 + 100)
    expect(arranged[0].position.y).toBeCloseTo(0.3 * 600 + 100)
    expect(arranged[1].position.x).toBeCloseTo(0.5 * 800 + 100)
    expect(arranged[1].position.y).toBeCloseTo(0.7 * 600 + 100)
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

    expect(result.history).toHaveLength(50)
    expect(result.index).toBe(49)
    expect(result.history[0].nodes[0]?.id).toBe("5")
    expect(result.history[49].nodes[0]?.id).toBe("54")
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

    expect(parsed).toEqual({ nodes, edges })
  })
})
