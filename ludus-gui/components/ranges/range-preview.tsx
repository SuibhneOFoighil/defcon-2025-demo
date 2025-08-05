"use client"

import React, { useMemo } from 'react';
import { 
  ReactFlow,
  Node, 
  Edge, 
  Background, 
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils';

interface RangePreviewProps {
  rangeId: string;
  className?: string;
}

// Simplified node component for cleaner preview with handles
const PreviewVlanNode = ({ data }: { data: { label: string; vms?: unknown[] } }) => {
  const vmCount = data.vms?.length || 0;
  
  return (
    <div className="bg-background border border-border rounded px-2 py-1 min-w-[50px] text-center shadow-sm relative">
      {/* Invisible handles for edge connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      
      <div className="text-[10px] font-medium text-foreground truncate">
        {data.label}
      </div>
      <div className="text-[9px] text-muted-foreground">
        {vmCount} VM{vmCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

const nodeTypes = {
  vlan: PreviewVlanNode,
};

// Default edge style for better visibility
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { 
    stroke: 'hsl(var(--border))', 
    strokeWidth: 2,
    strokeDasharray: '0'
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'hsl(var(--border))',
    width: 12,
    height: 12
  }
};

// Enhanced data generator with better layouts and edge styling
const generatePreviewData = (rangeId: string) => {
  const configs: Record<string, { nodes: Node[], edges: Edge[] }> = {
    'JD001': {
      nodes: [
        {
          id: 'vlan1',
          type: 'vlan',
          position: { x: 20, y: 20 },
          data: { label: 'DMZ', vms: [1, 2, 3] }
        },
        {
          id: 'vlan2', 
          type: 'vlan',
          position: { x: 140, y: 20 },
          data: { label: 'Internal', vms: [1, 2, 3, 4, 5] }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'vlan1',
          target: 'vlan2',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions,
          label: 'Router'
        }
      ]
    },
    'JD002': {
      nodes: [
        {
          id: 'vlan1',
          type: 'vlan', 
          position: { x: 20, y: 10 },
          data: { label: 'Web Tier', vms: [1, 2] }
        },
        {
          id: 'vlan2',
          type: 'vlan',
          position: { x: 140, y: 10 },
          data: { label: 'App Tier', vms: [1, 2, 3] }
        },
        {
          id: 'vlan3',
          type: 'vlan',
          position: { x: 80, y: 70 },
          data: { label: 'DB Tier', vms: [1, 2] }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'vlan1',
          target: 'vlan2',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions
        },
        {
          id: 'e2-3',
          source: 'vlan2',
          target: 'vlan3',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions
        }
      ]
    },
    'AL003': {
      nodes: [
        {
          id: 'vlan1',
          type: 'vlan',
          position: { x: 80, y: 10 },
          data: { label: 'Splunk', vms: [1] }
        },
        {
          id: 'vlan2',
          type: 'vlan', 
          position: { x: 20, y: 70 },
          data: { label: 'Forwarders', vms: [1, 2] }
        },
        {
          id: 'vlan3',
          type: 'vlan',
          position: { x: 140, y: 70 },
          data: { label: 'Endpoints', vms: [1] }
        }
      ],
      edges: [
        {
          id: 'e2-1',
          source: 'vlan2',
          target: 'vlan1',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions,
          label: 'Logs'
        },
        {
          id: 'e3-1', 
          source: 'vlan3',
          target: 'vlan1',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions,
          label: 'Logs'
        }
      ]
    },
    'JD004': {
      nodes: [
        {
          id: 'vlan1',
          type: 'vlan',
          position: { x: 20, y: 40 },
          data: { label: 'Kali', vms: [1] }
        },
        {
          id: 'vlan2',
          type: 'vlan',
          position: { x: 120, y: 10 },
          data: { label: 'Target 1', vms: [1] }
        },
        {
          id: 'vlan3',
          type: 'vlan',
          position: { x: 120, y: 70 },
          data: { label: 'Target 2', vms: [1] }
        }
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'vlan1',
          target: 'vlan2',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions,
          style: { 
            ...defaultEdgeOptions.style,
            stroke: 'hsl(var(--destructive))',
            strokeDasharray: '5,5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--destructive))'
          },
          label: 'Attack'
        },
        {
          id: 'e1-3',
          source: 'vlan1', 
          target: 'vlan3',
          sourceHandle: null,
          targetHandle: null,
          ...defaultEdgeOptions,
          style: { 
            ...defaultEdgeOptions.style,
            stroke: 'hsl(var(--destructive))',
            strokeDasharray: '5,5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--destructive))'
          },
          label: 'Attack'
        }
      ]
    },
    'JD005': {
      nodes: [
        {
          id: 'vlan1',
          type: 'vlan',
          position: { x: 80, y: 40 },
          data: { label: 'Windows 11', vms: [1] }
        }
      ],
      edges: []
    }
  };

  return configs[rangeId] || {
    nodes: [
      {
        id: 'vlan1',
        type: 'vlan',
        position: { x: 80, y: 40 },
        data: { label: 'Network', vms: [1, 2] }
      }
    ],
    edges: []
  };
};

function RangePreviewFlow({ rangeId }: { rangeId: string }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => 
    generatePreviewData(rangeId), [rangeId]
  );
  
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      panOnScroll={false}
      panOnDrag={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
      attributionPosition="bottom-left"
      proOptions={{ hideAttribution: true }}
      style={{ pointerEvents: 'none' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="opacity-20" />
    </ReactFlow>
  );
}

export function RangePreview({ rangeId, className }: RangePreviewProps) {
  return (
    <div className={cn("w-full h-32 bg-muted/30 rounded-lg overflow-hidden border border-border/50", className)}>
      <RangePreviewFlow rangeId={rangeId} />
    </div>
  );
} 