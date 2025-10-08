"use client"

import type React from "react"
import { memo } from "react"
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, MarkerType } from "@xyflow/react"
import { EDGE_COLORS } from "@/lib/mindmap-logic"

export interface CustomEdgeData extends Record<string, unknown> {
  color?: string
  size?: number
  dashed?: boolean
  animated?: boolean
  label?: string
  indicator?: "none" | "arrow"
}

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
  const indicator = data?.indicator || "none"

  const edgeStyle = {
    ...style,
    stroke: edgeColor,
    strokeWidth: edgeSize,
    strokeDasharray: isDashed ? "5,5" : "none",
    strokeDashoffset: isAnimated && isDashed ? "0" : "none",
  }

  const markerEndDefinition =
    indicator === "arrow"
      ? {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 22,
          height: 22,
        }
      : undefined

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={markerEndDefinition ?? markerEnd}
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
