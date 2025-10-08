import type { Edge, Node } from "@xyflow/react"

export const DEFAULT_NODE_COLOR = "oklch(0.45 0.15 265)"
export const DEFAULT_NODE_EMOJI = "✨"
export const DEFAULT_NODE_LABEL = "New Idea"

export const COLOR_PRESETS = [
  { name: "Purple", value: "oklch(0.45 0.15 265)" },
  { name: "Blue", value: "oklch(0.45 0.15 240)" },
  { name: "Green", value: "oklch(0.45 0.15 150)" },
  { name: "Orange", value: "oklch(0.45 0.15 50)" },
  { name: "Pink", value: "oklch(0.45 0.15 330)" },
  { name: "Red", value: "oklch(0.45 0.15 20)" },
]

export const EDGE_COLORS = [
  "oklch(0.45 0.15 265)", // Purple
  "oklch(0.45 0.15 240)", // Blue
  "oklch(0.45 0.15 150)", // Green
  "oklch(0.45 0.15 50)",  // Orange
  "oklch(0.45 0.15 330)", // Pink
  "oklch(0.45 0.15 20)",  // Red
  "oklch(0.45 0.15 300)", // Magenta
  "oklch(0.45 0.15 180)", // Cyan
  "oklch(0.45 0.15 60)",  // Yellow
  "oklch(0.45 0.15 120)", // Lime
]

export type MindMapHistoryState = {
  nodes: Node[]
  edges: Edge[]
}

export function createMindMapNode(
  id: number | string,
  emoji: string = DEFAULT_NODE_EMOJI,
  random: () => number = Math.random,
): Node {
  const nodeId = typeof id === "number" ? String(id) : id
  const position = {
    x: random() * 500 + 100,
    y: random() * 500 + 100,
  }

  return {
    id: nodeId,
    type: "mindmap",
    data: { label: DEFAULT_NODE_LABEL, emoji, color: DEFAULT_NODE_COLOR },
    position,
  }
}

export function assignSourceColor(
  sourceId: string,
  current: Record<string, string>,
  palette: string[] = EDGE_COLORS,
): { color: string; map: Record<string, string> } {
  const existingColor = current[sourceId]
  if (existingColor) {
    return { color: existingColor, map: current }
  }

  const usedColors = new Set(Object.values(current))
  const nextColor = palette.find((color) => !usedColors.has(color)) ?? palette[0]

  return {
    color: nextColor,
    map: { ...current, [sourceId]: nextColor },
  }
}

export function autoArrangeNodes(
  nodes: Node[],
  edges: Edge[],
  random: () => number = Math.random,
): Node[] {
  if (nodes.length === 0) {
    return nodes
  }

  const adjacencyList: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}

  for (const node of nodes) {
    adjacencyList[node.id] = []
    inDegree[node.id] = 0
  }

  for (const edge of edges) {
    if (edge.source && edge.target) {
      adjacencyList[edge.source]?.push(edge.target)
      if (edge.target in inDegree) {
        inDegree[edge.target]! += 1
      }
    }
  }

  const rootNodes = nodes.filter((node) => inDegree[node.id] === 0)

  if (rootNodes.length === 0) {
    return nodes.map((node) => ({
      ...node,
      position: {
        x: random() * 800 + 100,
        y: random() * 600 + 100,
      },
    }))
  }

  const visited = new Set<string>()
  const nodePositions: Record<string, { x: number; y: number }> = {}
  const levelWidths: Record<number, number> = {}

  const queue: Array<{ nodeId: string; level: number }> = []
  rootNodes.forEach((node) => {
    queue.push({ nodeId: node.id, level: 0 })
    visited.add(node.id)
  })

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!

    const levelWidth = levelWidths[level] ?? 0
    const x = level * 300 + 100
    const y = levelWidth * 150 + 200

    nodePositions[nodeId] = { x, y }
    levelWidths[level] = levelWidth + 1

    const children = adjacencyList[nodeId] ?? []
    for (const childId of children) {
      if (!visited.has(childId)) {
        visited.add(childId)
        queue.push({ nodeId: childId, level: level + 1 })
      }
    }
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      nodePositions[node.id] = {
        x: random() * 800 + 100,
        y: random() * 600 + 100,
      }
    }
  }

  return nodes.map((node) => ({
    ...node,
    position: nodePositions[node.id] ?? node.position,
  }))
}

export function pushHistory(
  history: MindMapHistoryState[],
  currentIndex: number,
  newState: MindMapHistoryState,
  limit = 50,
): { history: MindMapHistoryState[]; index: number } {
  const base = history.slice(0, currentIndex + 1)
  const extended = [...base, newState]

  if (extended.length <= limit) {
    return { history: extended, index: extended.length - 1 }
  }

  const trimmed = extended.slice(extended.length - limit)
  return { history: trimmed, index: trimmed.length - 1 }
}

export function buildMindmapExport(nodes: Node[], edges: Edge[]): string {
  return JSON.stringify({ nodes, edges }, null, 2)
}
