"use client"

import type React from "react"

import { useCallback, useState, useRef, useEffect } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  Panel,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { MindMapNode } from "./mindmap-node"
import { MindMapEdge, type CustomEdgeData } from "./mindmap-edge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Download, Upload, Undo, Redo, Eye, Edit3, X, GripVertical, Sparkles, Layout } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const nodeTypes = {
  mindmap: MindMapNode,
}

const edgeTypes = {
  mindmap: MindMapEdge as any,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "mindmap",
    data: { label: "Central Idea", emoji: "💡", color: "oklch(0.45 0.15 265)" },
    position: { x: 250, y: 250 },
  },
]

const initialEdges: Edge[] = []

type HistoryState = {
  nodes: Node[]
  edges: Edge[]
}

const COLOR_PRESETS = [
  { name: "Purple", value: "oklch(0.45 0.15 265)" },
  { name: "Blue", value: "oklch(0.45 0.15 240)" },
  { name: "Green", value: "oklch(0.45 0.15 150)" },
  { name: "Orange", value: "oklch(0.45 0.15 50)" },
  { name: "Pink", value: "oklch(0.45 0.15 330)" },
  { name: "Red", value: "oklch(0.45 0.15 20)" },
]

const EDGE_COLORS = [
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

const EXTENDED_EMOJI_LIST = [
  "💡",
  "🎯",
  "🚀",
  "⭐",
  "✨",
  "🔥",
  "💪",
  "🎨",
  "📝",
  "📊",
  "💼",
  "🏆",
  "🎓",
  "🌟",
  "💰",
  "📈",
  "🔔",
  "⚡",
  "🎉",
  "🌈",
  "🧠",
  "💻",
  "📱",
  "🎮",
  "🎵",
  "📚",
  "🔍",
  "✅",
  "❌",
  "❓",
  "🏠",
  "🌍",
  "🌙",
  "☀️",
  "🌸",
  "🍀",
  "🎁",
  "🔑",
  "🎪",
  "🎭",
  "🎬",
  "📷",
  "🎤",
  "🎧",
  "🎸",
  "🎹",
  "🎺",
  "🎻",
  "🥁",
  "🎲",
  "🎯",
  "🎰",
  "🎳",
  "🏀",
  "⚽",
  "🏈",
  "⚾",
  "🎾",
  "🏐",
  "🏉",
  "🥊",
  "🥋",
  "🏓",
  "🏸",
  "🏒",
  "🏑",
  "🥍",
  "🏏",
  "🥅",
  "⛳",
  "🏹",
  "🎣",
  "🤿",
  "🥊",
  "🥋",
  "🎽",
  "🛹",
  "🛼",
  "🛷",
  "⛸️",
  "🥌",
  "🎿",
  "⛷️",
  "🏂",
  "🪂",
  "🏋️",
  "🤸",
  "🤺",
  "🤾",
  "🏌️",
  "🧘",
  "🏃",
  "🚴",
  "🤹",
  "🧗",
  "🤠",
  "🥳",
  "🥸",
  "😎",
  "🤓",
  "🧐",
  "🤩",
  "🥰",
  "😍",
  "🤗",
  "🤭",
  "🤫",
  "🤔",
  "🤐",
  "🤨",
]

export function MindMapCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeId, setNodeId] = useState(2)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [saveStatus, setSaveStatus] = useState<"draft" | "saved">("draft")
  const [showControls, setShowControls] = useState(true)
  const [toolboxPosition, setToolboxPosition] = useState({ x: 16, y: 0 })
  const [isDraggingToolbox, setIsDraggingToolbox] = useState(false)
  const toolboxDragStart = useRef({ x: 0, y: 0 })

  const [history, setHistory] = useState<HistoryState[]>([{ nodes: initialNodes, edges: initialEdges }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedoAction = useRef(false)

  const [showEmojiPanel, setShowEmojiPanel] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [sourceColors, setSourceColors] = useState<{ [key: string]: string }>({})
  const [edgeSettings, setEdgeSettings] = useState({
    size: 2,
    dashed: false,
    animated: false,
  })

  useEffect(() => {
    const selected = nodes.find((node) => node.selected)
    setSelectedNode(selected || null)
  }, [nodes])

  useEffect(() => {
    const selected = edges.find((edge) => edge.selected)
    setSelectedEdge(selected || null)
  }, [edges])

  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false
      return
    }

    const newState = { nodes, edges }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)

    setSaveStatus("draft")

    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }

    setHistory(newHistory)
  }, [nodes, edges])

  const handleToolboxMouseDown = (e: React.MouseEvent) => {
    setIsDraggingToolbox(true)
    toolboxDragStart.current = {
      x: e.clientX - toolboxPosition.x,
      y: e.clientY - toolboxPosition.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingToolbox) {
        setToolboxPosition({
          x: e.clientX - toolboxDragStart.current.x,
          y: e.clientY - toolboxDragStart.current.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDraggingToolbox(false)
    }

    if (isDraggingToolbox) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingToolbox])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setNodes(history[newIndex].nodes)
      setEdges(history[newIndex].edges)
    }
  }, [historyIndex, history, setNodes, setEdges])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setNodes(history[newIndex].nodes)
      setEdges(history[newIndex].edges)
    }
  }, [historyIndex, history, setNodes, setEdges])

  const addNode = useCallback(
    (emoji = "✨") => {
      const newNode: Node = {
        id: `${nodeId}`,
        type: "mindmap",
        data: { label: "New Idea", emoji, color: "oklch(0.45 0.15 265)" },
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 500 + 100,
        },
      }
      setNodes((nds) => [...nds, newNode])
      setNodeId((id) => id + 1)
    },
    [nodeId, setNodes],
  )

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected))
    setEdges((eds) => eds.filter((edge) => !edge.selected))
  }, [setNodes, setEdges])

  const updateSelectedNode = useCallback(
    (updates: Partial<Node["data"]>) => {
      if (!selectedNode) return
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: { ...node.data, ...updates },
            }
          }
          return node
        }),
      )
    },
    [selectedNode, setNodes],
  )

  const exportMindmap = useCallback(() => {
    const data = {
      nodes,
      edges,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mindmap.json"
    link.click()
    URL.revokeObjectURL(url)
    setSaveStatus("saved")
  }, [nodes, edges])

  const importMindmap = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.nodes && data.edges) {
            setNodes(data.nodes)
            setEdges(data.edges)
            const maxId = Math.max(...data.nodes.map((n: Node) => Number.parseInt(n.id)))
            setNodeId(maxId + 1)
          }
        } catch (error) {
          console.error("Error importing mindmap:", error)
        }
      }
      reader.readAsText(file)
    },
    [setNodes, setEdges],
  )

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return

    // Get or assign color for this source node
    let sourceColor = sourceColors[params.source]
    if (!sourceColor) {
      const usedColors = Object.values(sourceColors)
      const availableColors = EDGE_COLORS.filter(color => !usedColors.includes(color))
      sourceColor = availableColors[0] || EDGE_COLORS[0]
      setSourceColors(prev => ({ ...prev, [params.source!]: sourceColor! }))
    }

    const newEdge: Edge = {
      ...params,
      id: `${params.source}-${params.target}`,
      type: "mindmap",
      data: {
        color: sourceColor,
        size: edgeSettings.size,
        dashed: edgeSettings.dashed,
        animated: edgeSettings.animated,
      },
    }

    setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges, sourceColors, edgeSettings])

  // Auto-arrange algorithm
  const autoArrange = useCallback(() => {
    if (nodes.length === 0) return

    const NODE_WIDTH = 200
    const NODE_HEIGHT = 80
    const HORIZONTAL_SPACING = 300
    const VERTICAL_SPACING = 150
    const LEVEL_HEIGHT = 200

    // Build adjacency list
    const adjacencyList: { [key: string]: string[] } = {}
    const inDegree: { [key: string]: number } = {}
    
    // Initialize
    nodes.forEach(node => {
      adjacencyList[node.id] = []
      inDegree[node.id] = 0
    })

    // Build graph
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        adjacencyList[edge.source].push(edge.target)
        inDegree[edge.target]++
      }
    })

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => inDegree[node.id] === 0)
    
    if (rootNodes.length === 0) {
      // If no clear root, use the first node
      const firstNode = nodes[0]
      const newNodes = nodes.map(node => ({
        ...node,
        position: {
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
        }
      }))
      setNodes(newNodes)
      return
    }

    const visited = new Set<string>()
    const nodePositions: { [key: string]: { x: number; y: number } } = {}
    const levelWidths: { [key: number]: number } = {}

    // BFS to assign levels and calculate positions
    const queue: { nodeId: string; level: number; index: number }[] = []
    
    rootNodes.forEach((node, index) => {
      queue.push({ nodeId: node.id, level: 0, index })
      visited.add(node.id)
    })

    while (queue.length > 0) {
      const { nodeId, level, index } = queue.shift()!
      
      // Calculate position for this node
      const levelWidth = levelWidths[level] || 0
      const x = level * HORIZONTAL_SPACING + 100
      const y = levelWidth * VERTICAL_SPACING + 200
      
      nodePositions[nodeId] = { x, y }
      levelWidths[level] = levelWidth + 1

      // Add children to queue
      const children = adjacencyList[nodeId] || []
      children.forEach((childId, childIndex) => {
        if (!visited.has(childId)) {
          visited.add(childId)
          queue.push({ 
            nodeId: childId, 
            level: level + 1, 
            index: childIndex 
          })
        }
      })
    }

    // Handle unvisited nodes (disconnected components)
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        nodePositions[node.id] = {
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
        }
      }
    })

    // Update node positions
    const newNodes = nodes.map(node => ({
      ...node,
      position: nodePositions[node.id] || { x: 100, y: 100 }
    }))

    setNodes(newNodes)
  }, [nodes, edges, setNodes])

  const updateSelectedEdge = useCallback(
    (updates: Partial<CustomEdgeData>) => {
      if (!selectedEdge) return
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === selectedEdge.id) {
            return {
              ...edge,
              data: { ...edge.data, ...updates },
            }
          }
          return edge
        }),
      )
    },
    [selectedEdge, setEdges],
  )

  const updateEdgeSettings = useCallback(
    (updates: Partial<typeof edgeSettings>) => {
      setEdgeSettings(prev => ({ ...prev, ...updates }))
    },
    [],
  )

  return (
    <div className="h-full w-full relative flex">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
        <Input
          value={workflowName}
          onChange={(e) => {
            setWorkflowName(e.target.value)
            setSaveStatus("draft")
          }}
          className="h-8 text-sm font-semibold border-0 focus-visible:ring-0 bg-transparent w-48"
        />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${saveStatus === "saved" ? "bg-green-500" : "bg-yellow-500"}`}
            title={saveStatus === "saved" ? "Saved" : "Draft"}
          />
          <span className="text-xs font-medium text-muted-foreground capitalize">{saveStatus}</span>
        </div>
      </div>

      {mode === "edit" && (
        <div
          className="absolute z-10 w-14 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-2 space-y-1.5 shadow-lg"
          style={{
            left: `${toolboxPosition.x}px`,
            top: toolboxPosition.y === 0 ? "50%" : `${toolboxPosition.y}px`,
            transform: toolboxPosition.y === 0 ? "translateY(-50%)" : "none",
            cursor: isDraggingToolbox ? "grabbing" : "default",
          }}
        >
          <div
            className="flex items-center justify-center cursor-grab active:cursor-grabbing py-1"
            onMouseDown={handleToolboxMouseDown}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-[10px] font-medium text-center text-muted-foreground">Tools</div>
          <Separator />
          <Button
            onClick={() => addNode("💡")}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="Add Idea Node"
          >
            <span className="text-lg">💡</span>
            <span className="text-[9px]">Idea</span>
          </Button>
          <Button
            onClick={() => addNode("🎯")}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="Add Goal Node"
          >
            <span className="text-lg">🎯</span>
            <span className="text-[9px]">Goal</span>
          </Button>
          <Button
            onClick={() => addNode("📝")}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="Add Note Node"
          >
            <span className="text-lg">📝</span>
            <span className="text-[9px]">Note</span>
          </Button>
          <Button
            onClick={() => addNode("⭐")}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="Add Star Node"
          >
            <span className="text-lg">⭐</span>
            <span className="text-[9px]">Star</span>
          </Button>
          <Button
            onClick={() => addNode("🚀")}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="Add Action Node"
          >
            <span className="text-lg">🚀</span>
            <span className="text-[9px]">Action</span>
          </Button>
          <Separator />
          <Button
            onClick={() => setShowEmojiPanel(true)}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="View More Emojis"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-[9px]">More</span>
          </Button>
          <Separator />
          <Button
            onClick={autoArrange}
            size="sm"
            variant="ghost"
            className="w-full h-10 flex flex-col gap-0.5 hover:bg-primary/10 p-1"
            title="Auto-arrange nodes"
          >
            <Layout className="h-4 w-4" />
            <span className="text-[9px]">Arrange</span>
          </Button>
        </div>
      )}

      {showEmojiPanel && mode === "edit" && (
        <div className="absolute left-20 top-1/2 -translate-y-1/2 z-20 w-80 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl">
          <div className="p-3 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Choose Emoji</h3>
            <Button onClick={() => setShowEmojiPanel(false)} size="sm" variant="ghost" className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-96 p-3">
            <div className="grid grid-cols-8 gap-2">
              {EXTENDED_EMOJI_LIST.map((emoji, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    addNode(emoji)
                    setShowEmojiPanel(false)
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 text-2xl hover:scale-125 transition-transform hover:bg-primary/10"
                  title={`Add ${emoji} node`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {mode === "edit" && selectedNode && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-48 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-2.5 space-y-2.5 shadow-lg max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            <h3 className="font-semibold text-[11px]">Node Properties</h3>
            <Separator />
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="node-label" className="text-[9px]">
                Label
              </Label>
              <Input
                id="node-label"
                value={selectedNode.data.label as string}
                onChange={(e) => updateSelectedNode({ label: e.target.value })}
                className="h-6 text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px]">Emoji</Label>
              <div className="text-xl text-center py-0.5">{selectedNode.data.emoji as string}</div>
            </div>

            <div className="space-y-1">
              <Label className="text-[9px]">Color</Label>
              <div className="grid grid-cols-3 gap-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateSelectedNode({ color: color.value })}
                    className="h-7 rounded-md border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: color.value,
                      borderColor: selectedNode.data.color === color.value ? "white" : "transparent",
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <Button onClick={deleteSelected} size="sm" variant="destructive" className="w-full gap-1.5 h-6 text-[10px]">
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>

            <div className="space-y-0.5 text-[9px] text-muted-foreground">
              <p>
                <strong>ID:</strong> {selectedNode.id}
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === "edit" && selectedEdge && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-48 bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-2.5 space-y-2.5 shadow-lg max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            <h3 className="font-semibold text-[11px]">Edge Properties</h3>
            <Separator />
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-[9px]">Color</Label>
              <div className="grid grid-cols-3 gap-1">
                {EDGE_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => updateSelectedEdge({ color })}
                    className="h-7 rounded-md border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: color,
                      borderColor: (selectedEdge.data as CustomEdgeData)?.color === color ? "white" : "transparent",
                    }}
                    title={`Color ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edge-size" className="text-[9px]">
                Size: {(selectedEdge.data as CustomEdgeData)?.size || 2}
              </Label>
              <input
                id="edge-size"
                type="range"
                min="1"
                max="8"
                value={(selectedEdge.data as CustomEdgeData)?.size || 2}
                onChange={(e) => updateSelectedEdge({ size: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px]">Style</Label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[9px]">
                  <input
                    type="checkbox"
                    checked={(selectedEdge.data as CustomEdgeData)?.dashed || false}
                    onChange={(e) => updateSelectedEdge({ dashed: e.target.checked })}
                    className="rounded"
                  />
                  Dashed
                </label>
                <label className="flex items-center gap-2 text-[9px]">
                  <input
                    type="checkbox"
                    checked={(selectedEdge.data as CustomEdgeData)?.animated || false}
                    onChange={(e) => updateSelectedEdge({ animated: e.target.checked })}
                    className="rounded"
                  />
                  Animated
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edge-label" className="text-[9px]">
                Label
              </Label>
              <Input
                id="edge-label"
                value={(selectedEdge.data as CustomEdgeData)?.label || ""}
                onChange={(e) => updateSelectedEdge({ label: e.target.value })}
                className="h-6 text-[11px]"
                placeholder="Edge label"
              />
            </div>

            <Separator />

            <Button onClick={deleteSelected} size="sm" variant="destructive" className="w-full gap-1.5 h-6 text-[10px]">
              <Trash2 className="h-3 w-3" />
              Delete Edge
            </Button>

            <div className="space-y-0.5 text-[9px] text-muted-foreground">
              <p>
                <strong>From:</strong> {selectedEdge.source}
              </p>
              <p>
                <strong>To:</strong> {selectedEdge.target}
              </p>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-background flex-1"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={mode === "edit"}
        nodesConnectable={mode === "edit"}
        elementsSelectable={mode === "edit"}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls className="!bg-background/80 !backdrop-blur-md !border-border/50" />
        <MiniMap
          className="!bg-background/80 !backdrop-blur-md !border-border/50"
          nodeColor={(node) => {
            return (node.data as any)?.color || "oklch(0.45 0.15 265)"
          }}
        />
        <Panel position="top-left" className="flex gap-2">
          <div className="flex gap-1 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg p-1">
            <Button
              onClick={() => setMode("edit")}
              size="sm"
              variant={mode === "edit" ? "default" : "ghost"}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => setMode("preview")}
              size="sm"
              variant={mode === "preview" ? "default" : "ghost"}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </Panel>
        <Panel position="top-center" className="flex gap-2">
          <div className="flex gap-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg p-2">
            <Button onClick={() => addNode()} size="sm" className="gap-2" disabled={mode === "preview"}>
              <Plus className="h-4 w-4" />
              Add Node
            </Button>
            <Button
              onClick={deleteSelected}
              size="sm"
              variant="destructive"
              className="gap-2"
              disabled={mode === "preview"}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button
              onClick={undo}
              size="sm"
              variant="secondary"
              className="gap-2"
              disabled={historyIndex === 0 || mode === "preview"}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              size="sm"
              variant="secondary"
              className="gap-2"
              disabled={historyIndex === history.length - 1 || mode === "preview"}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button onClick={exportMindmap} size="sm" variant="secondary" className="gap-2">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="secondary"
              className="gap-2"
              disabled={mode === "preview"}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              onClick={autoArrange}
              size="sm"
              variant="secondary"
              className="gap-2"
              disabled={mode === "preview"}
              title="Auto-arrange nodes for better layout"
            >
              <Layout className="h-4 w-4" />
              Arrange
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 bg-background/50 rounded border">
              <Label className="text-xs text-muted-foreground">Edge:</Label>
              <input
                type="range"
                min="1"
                max="8"
                value={edgeSettings.size}
                onChange={(e) => updateEdgeSettings({ size: Number(e.target.value) })}
                className="w-16"
                title="Edge thickness"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={edgeSettings.dashed}
                  onChange={(e) => updateEdgeSettings({ dashed: e.target.checked })}
                  className="rounded"
                />
                Dashed
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={edgeSettings.animated}
                  onChange={(e) => updateEdgeSettings({ animated: e.target.checked })}
                  className="rounded"
                />
                Animated
              </label>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={importMindmap} className="hidden" />
          </div>
        </Panel>
        {showControls && (
          <Panel position="top-right" className="text-sm text-muted-foreground">
            <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-lg p-3 space-y-1 relative">
              <Button
                onClick={() => setShowControls(false)}
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="font-medium text-foreground text-xs">Controls:</p>
              <p className="text-xs">• Double-click node to edit</p>
              <p className="text-xs">• Drag to connect nodes</p>
              <p className="text-xs">• Click edge to customize</p>
              <p className="text-xs">• Select & press Delete</p>
              <p className="text-xs">• Click Arrange to auto-layout</p>
              <p className="text-xs">• Ctrl/Cmd+Z to undo</p>
              <p className="text-xs">• Ctrl/Cmd+Y to redo</p>
              <p className="text-xs">• Scroll to zoom</p>
            </div>
          </Panel>
        )}
        {!showControls && (
          <Panel position="top-right">
            <Button
              onClick={() => setShowControls(true)}
              size="sm"
              variant="secondary"
              className="bg-background/80 backdrop-blur-md border border-border/50"
            >
              Show Controls
            </Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
