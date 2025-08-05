"use client"

import type React from "react"
import {
  ReactFlow,
  Background,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
  ConnectionLineType,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { NodeData } from "@/lib/types"
import { FlowControls } from "./flow-controls"

interface FlowCanvasProps {
  nodes: Node<NodeData>[]
  edges: Edge[]
  nodeTypes: NodeTypes
  edgeTypes: EdgeTypes
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: (params: Edge | Connection) => void
  isValidConnection?: (connection: Edge | Connection) => boolean
  onSelectionChange: (params: { nodes: Node[]; edges: Edge[] }) => void
  onInit: (instance: ReactFlowInstance) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
  onDrop: (event: React.DragEvent) => void
  onMove?: (event: MouseEvent | TouchEvent | null, viewport: { x: number; y: number; zoom: number }) => void
  onPaneClick?: () => void
  onDelete?: (params: { nodes: Node[]; edges: Edge[] }) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  deleteKeyCode?: string | string[] | null
  reactFlowWrapper: React.RefObject<HTMLDivElement>
  reactFlowInstance: ReactFlowInstance | null
  floatingActions?: React.ReactNode
}

export function FlowCanvas({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isValidConnection,
  onSelectionChange,
  onInit,
  onDragOver,
  onDragLeave,
  onDrop,
  onMove,
  onPaneClick,
  onDelete,
  onKeyDown,
  deleteKeyCode,
  reactFlowWrapper,
  reactFlowInstance,
  floatingActions,
}: FlowCanvasProps) {
  return (
    <div className="flex-1 relative bg-background w-full" ref={reactFlowWrapper}>
      <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onInit={onInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onMove={onMove}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
          onDelete={onDelete}
          onKeyDown={onKeyDown}
          deleteKeyCode={deleteKeyCode}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: "custom",
            style: { strokeWidth: 2 },
          }}
          connectionLineStyle={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "5,5" }}
          connectionLineType={ConnectionLineType.Straight}
          proOptions={{ hideAttribution: true }}
          selectNodesOnDrag={false}
          nodesConnectable={true}
          nodesDraggable={true}
          elementsSelectable={true}
          nodesFocusable={true}
        >
          <Background gap={20} size={1} color="hsl(var(--topology-dot))" variant={BackgroundVariant.Dots} />
          <MiniMap
            position="top-right"
            style={{
              backgroundColor: "hsl(var(--topology-node-bg))",
              border: "1px solid hsl(var(--topology-node-border))",
            }}
            nodeColor={(n) => {
              if (n.type === "vlan") return "hsl(var(--node-macos))"
              return "#666"
            }}
            nodeStrokeWidth={3}
          />
        </ReactFlow>
      <FlowControls onZoomIn={() => reactFlowInstance?.zoomIn()} onZoomOut={() => reactFlowInstance?.zoomOut()} />
      {/* Floating Actions positioned in bottom right of canvas */}
      {floatingActions && (
        <div className="absolute bottom-4 right-4 z-20">
          {floatingActions}
        </div>
      )}
    </div>
  )
}
