"use client"

import type React from "react"

import { memo, useState, useCallback } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { EXTENDED_EMOJI_LIST } from "../lib/mindmap-logic"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type MindMapNodeData = {
  label: string
  emoji?: string
  color?: string
  [key: string]: unknown
}

type MindMapNodeType = Node<MindMapNodeData, "mindmap">

const EMOJI_OPTIONS = EXTENDED_EMOJI_LIST

export const MindMapNode = memo(({ data }: NodeProps<MindMapNodeType>) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const [emoji, setEmoji] = useState(data.emoji || "💡")

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    data.label = label
    data.emoji = emoji
  }, [label, emoji, data])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        setIsEditing(false)
        data.label = label
        data.emoji = emoji
      }
    },
    [label, emoji, data],
  )

  const handleEmojiSelect = useCallback(
    (selectedEmoji: string) => {
      setEmoji(selectedEmoji)
      data.emoji = selectedEmoji
    },
    [data],
  )

  const nodeColor: string = data.color || "oklch(0.45 0.15 265)"

  return (
    <div
      className="px-4 py-3 rounded-xl border-2 shadow-lg min-w-[180px] transition-all hover:shadow-xl hover:scale-105"
      style={{
        borderColor: nodeColor,
        backgroundColor: `color-mix(in oklch, ${nodeColor} 20%, oklch(0.98 0 0 / 0.7))`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "oklch(0.2 0 0)",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} style={{ background: nodeColor }} />
      <Handle type="source" position={Position.Bottom} style={{ background: nodeColor }} />
      <Handle type="target" position={Position.Left} style={{ background: nodeColor }} />
      <Handle type="source" position={Position.Right} style={{ background: nodeColor }} />

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xl hover:scale-110 transition-transform">
              {emoji}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 bg-popover/95 backdrop-blur-md">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_OPTIONS.map((emojiOption) => (
                <Button
                  key={emojiOption}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                  onClick={() => handleEmojiSelect(emojiOption)}
                >
                  {emojiOption}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {isEditing ? (
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-auto p-1 border-0 focus-visible:ring-0 font-medium flex-1 bg-transparent text-foreground"
            style={{ color: "oklch(0.2 0 0)" }}
          />
        ) : (
          <div className="font-medium flex-1" style={{ color: "oklch(0.2 0 0)" }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
})

MindMapNode.displayName = "MindMapNode"
