"use client"

import type React from "react"
import { memo } from "react"
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react"

export interface CustomEdgeData extends Record<string, unknown> {
  color?: string
  size?: number
  dashed?: boolean
  animated?: boolean
  label?: string
}

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

export const MindMapEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selectable = true,
  deletable = true,
  selected = false,
  animated = false,
}: EdgeProps<CustomEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const edgeColor = data?.color || EDGE_COLORS[0]
  const edgeSize = data?.size || 2
  const isDashed = data?.dashed || false
  const isAnimated = data?.animated || false

  const edgeStyle = {
    ...style,
    stroke: edgeColor,
    strokeWidth: edgeSize,
    strokeDasharray: isDashed ? "5,5" : "none",
    strokeDashoffset: isAnimated && isDashed ? "0" : "none",
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
        className={isAnimated ? (isDashed ? "animate-flow" : "animate-pulse") : ""}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: "rgba(255, 255, 255, 0.8)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "500",
              color: edgeColor,
              border: `1px solid ${edgeColor}`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

MindMapEdge.displayName = "MindMapEdge"
