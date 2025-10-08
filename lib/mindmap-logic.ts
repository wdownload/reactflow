import defaultsData from "@/data/defaults.json"
import type { Edge, Node } from "@xyflow/react"

type LabelConfig = {
  id: string
  text: string
}

export type ColorOption = {
  id: string
  name: string
  value: string
}

type DefaultsConfig = {
  defaults: {
    nodeColor: string
    nodeEmoji: string
    nodeLabel: LabelConfig
    initialNode: {
      emoji: string
      label: LabelConfig
    }
  }
  colorPresets: ColorOption[]
  edgeColors: ColorOption[]
  emojiList: string[]
}

const CONFIG = defaultsData as DefaultsConfig

export const DEFAULT_NODE_COLOR = CONFIG.defaults.nodeColor
export const DEFAULT_NODE_EMOJI = CONFIG.defaults.nodeEmoji
export const DEFAULT_NODE_LABEL = CONFIG.defaults.nodeLabel.text
export const DEFAULT_NODE_LABEL_ID = CONFIG.defaults.nodeLabel.id

export const INITIAL_NODE_LABEL = CONFIG.defaults.initialNode.label.text
export const INITIAL_NODE_LABEL_ID = CONFIG.defaults.initialNode.label.id
export const INITIAL_NODE_EMOJI = CONFIG.defaults.initialNode.emoji

export const COLOR_PRESETS = CONFIG.colorPresets

export const EDGE_COLOR_OPTIONS = CONFIG.edgeColors
export const EDGE_COLORS = EDGE_COLOR_OPTIONS.map((option) => option.value)

export const EXTENDED_EMOJI_LIST = CONFIG.emojiList

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
