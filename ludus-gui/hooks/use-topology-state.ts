import { useState, useCallback, useRef, useEffect } from "react"
import { 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  type Connection, 
  type Edge, 
  type Node, 
  type ReactFlowInstance,
  type NodeChange
} from "@xyflow/react"
import { v4 as uuidv4 } from 'uuid'
import type { Template, VMData, NodeData } from "@/lib/types"
import type { RangeConfig } from "@/lib/types/range-config"
import { hookLogger, logUserAction } from "@/lib/logger"

interface UseTopologyStateProps {
  initialNodes: Node<NodeData>[]
  initialEdges: Edge[]
  savedPositions?: Map<string, { x: number; y: number }> | null
  templates: Template[]
  saveConfig: (nodes: Node<NodeData>[], edges: Edge[], options?: { force?: boolean; networkConfig?: RangeConfig['network']; defaultsConfig?: RangeConfig['defaults'] }) => void
  saveNodePositions: (nodes: Node<NodeData>[]) => void
  onSelectionChange: (params: { nodes: Node[]; edges: Edge[] }) => void
}

// Helper functions
function generateUniqueId(prefix: string): string {
  return `${prefix}-${uuidv4()}`
}

function generateSequentialVlanId(existingNodes: Node[]): string {
  const existingVlanNumbers = existingNodes
    .filter(node => node.type === 'vlan')
    .map(node => {
      const match = node.id.match(/vlan(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(num => num !== null && num >= 10)
    .sort((a, b) => (a ?? 0) - (b ?? 0));
  
  
  let nextVlanNumber = 10;
  for (const existingNumber of existingVlanNumbers) {
    if (nextVlanNumber === existingNumber) {
      nextVlanNumber++;
    } else {
      break;
    }
  }
  
  const newVlanId = `vlan${nextVlanNumber}`;
  return newVlanId;
}

function generateUniqueHostname(nodes: Node[], vlanId: string, templateName: string): string {
  // Extract VLAN number from ID (e.g., "vlan10" -> "10")
  const vlanMatch = vlanId.match(/vlan(\d+)/);
  const vlanNumber = vlanMatch ? vlanMatch[1] : '10';
  
  // Clean template name: remove version numbers, spaces, and special characters
  // e.g., "ubuntu-22.04-x64-server" -> "ubuntu"
  // e.g., "Windows Server 2022" -> "windows-server"
  const cleanTemplateName = templateName
    .toLowerCase()
    .replace(/[-_]\d+\.\d+/, '') // Remove version like -22.04
    .replace(/[-_]x64|[-_]x86|[-_]amd64|[-_]arm64/, '') // Remove architecture
    .replace(/[-_]server|[-_]desktop|[-_]cloud/, '') // Remove edition
    .split(/[-_\s]/)[0] // Take first part
    .replace(/[^a-z0-9]/g, ''); // Remove any remaining special chars
  
  // Start with base hostname: vlan{number}-{template}
  let baseHostname = `vlan${vlanNumber}-${cleanTemplateName}`;
  
  // Find all existing hostnames in all VLANs
  const existingHostnames = new Set<string>();
  nodes.forEach(node => {
    if (node.type === 'vlan' && node.data.vms && Array.isArray(node.data.vms)) {
      (node.data.vms as VMData[]).forEach(vm => {
        if (vm.hostname) {
          existingHostnames.add(vm.hostname);
        }
      });
    }
  });
  
  // If base hostname doesn't exist, use it
  if (!existingHostnames.has(baseHostname)) {
    return baseHostname;
  }
  
  // Otherwise, append a number
  let counter = 1;
  while (existingHostnames.has(`${baseHostname}${counter}`)) {
    counter++;
  }
  
  return `${baseHostname}${counter}`;
}


export function useTopologyState({
  initialNodes,
  initialEdges,
  savedPositions,
  templates,
  saveConfig,
  saveNodePositions,
  onSelectionChange
}: UseTopologyStateProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  
  // Refs for drag and drop
  const reactFlowWrapper = useRef<HTMLDivElement>(null!)
  const dropIndicatorRef = useRef<HTMLDivElement | null>(null)
  const lastSaveTimeRef = useRef<number>(0)

  // Custom handler for node changes that also saves positions
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    
    const hasPositionChange = changes.some((change) => 
      change.type === 'position' && !change.dragging
    )
    
    if (hasPositionChange) {
      saveNodePositions(nodes)
    }
  }, [onNodesChange, nodes, saveNodePositions])

  // Sync VM states from backend
  const syncVMStatesWithBackend = useCallback((currentNodes: Node[], backendVMs: { name?: string; poweredOn?: boolean }[]) => {
    return currentNodes.map((node) => {
      if (node.type === 'vlan' && node.data.vms && Array.isArray(node.data.vms)) {
        const updatedVMs = (node.data.vms as VMData[]).map((canvasVM) => {
          const backendVM = backendVMs.find((bvm) => 
            bvm.name === canvasVM.label || 
            (bvm.name && canvasVM.label && (
              bvm.name.includes(canvasVM.label) ||
              canvasVM.label.includes(bvm.name)
            ))
          )
          
          if (backendVM) {
            const newStatus = backendVM.poweredOn ? 'Running' : 'Stopped'
            return {
              ...canvasVM,
              status: newStatus,
            }
          }
          
          return canvasVM
        })
        
        return {
          ...node,
          data: {
            ...node.data,
            vms: updatedVMs,
          },
        }
      }
      return node
    })
  }, [])

  // Update nodes when initialNodes prop changes and apply saved positions
  useEffect(() => {
    // Only process initialNodes on first mount (when they have content)
    // The parent component will handle updates via setNodes/setEdges
    if (initialNodes.length === 0) {
      return
    }
    
    // Check if we've already initialized
    const hasInitialized = nodes.length > 0
    if (hasInitialized) {
      return
    }
    
    
    const timeSinceLastSave = Date.now() - lastSaveTimeRef.current
    if (timeSinceLastSave < 2000) {
      return
    }
    
    let nodesToSet = initialNodes;
    
    if (savedPositions) {
      nodesToSet = initialNodes.map(node => {
        const savedPosition = savedPositions.get(node.id);
        
        if (savedPosition && typeof savedPosition.x === 'number' && typeof savedPosition.y === 'number') {
          return {
            ...node,
            position: { x: savedPosition.x, y: savedPosition.y },
          };
        }
        return node;
      });
    }
    
    setNodes(currentNodes => {
      
      const currentNodesMap = new Map(currentNodes.map(n => [n.id, n]))
      const mergedNodes: typeof currentNodes = []
      const processedIds = new Set<string>()
      
      for (const newNode of nodesToSet) {
        const currentNode = currentNodesMap.get(newNode.id)
        processedIds.add(newNode.id)
        
        if (currentNode) {
          const currentTimestamp = currentNode.data?.lastModified || 0
          const newTimestamp = newNode.data?.lastModified || 0
          
          if (currentTimestamp > newTimestamp) {
            mergedNodes.push(currentNode)
          } else if (currentTimestamp === newTimestamp) {
            const currentVMCount = currentNode.data?.vms?.length || 0
            const newVMCount = newNode.data?.vms?.length || 0
            
            if (currentVMCount !== newVMCount) {
              if (currentVMCount > newVMCount) {
                mergedNodes.push(currentNode)
              } else {
                mergedNodes.push(newNode)
              }
            } else {
              mergedNodes.push(newNode)
            }
          } else {
            mergedNodes.push(newNode)
          }
        } else {
          mergedNodes.push(newNode)
        }
      }
      
      for (const currentNode of currentNodes) {
        if (!processedIds.has(currentNode.id)) {
          mergedNodes.push(currentNode)
        }
      }
      
      
      if (mergedNodes.length === currentNodes.length) {
        const hasChanges = mergedNodes.some((node, index) => {
          const currentNode = currentNodes[index]
          return !currentNode || 
                 currentNode.id !== node.id || 
                 currentNode.data?.vms?.length !== node.data?.vms?.length ||
                 Math.abs(currentNode.position.x - node.position.x) > 1 ||
                 Math.abs(currentNode.position.y - node.position.y) > 1
        })
        
        if (!hasChanges) {
          return currentNodes
        }
      }
      
      return mergedNodes
    })
  }, [initialNodes, savedPositions, setNodes])

  // Apply saved positions when ALL data is available
  useEffect(() => {
    // Only run when we have both saved positions AND nodes
    if (!savedPositions || savedPositions.size === 0 || nodes.length === 0) {
      return;
    }
    
    // Apply saved positions to existing nodes
    setNodes(currentNodes => {
      return currentNodes.map(node => {
        const savedPosition = savedPositions.get(node.id);
        if (savedPosition && typeof savedPosition.x === 'number' && typeof savedPosition.y === 'number') {
          return {
            ...node,
            position: { x: savedPosition.x, y: savedPosition.y },
          };
        }
        return node;
      });
    });
  }, [savedPositions?.size, nodes.length]); // Only depend on the existence of data, not the data itself

  // Edge initialization effect - only run once on mount
  useEffect(() => {
    if (initialEdges.length === 0 || edges.length > 0) {
      return // Skip if no edges or already initialized
    }
    
    const edgesWithHandlers = initialEdges.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
      },
    }))
    setEdges(edgesWithHandlers)
  }, []) // Empty deps - only run once

  // Handle adding a new VLAN node
  const handleAddVLAN = useCallback(
    (position?: { x: number; y: number }, initialVM?: VMData) => {
      if (!reactFlowInstance) return

      const nodePosition = position || reactFlowInstance.screenToFlowPosition({
        x: reactFlowWrapper.current!.clientWidth / 2,
        y: reactFlowWrapper.current!.clientHeight / 2,
      })

      const newVlanId = generateSequentialVlanId(nodes)
      const vlanNumber = newVlanId.match(/vlan(\d+)/)?.[1] || '10'
      const initialVMs = initialVM ? [initialVM] : []

      const newNode = {
        id: newVlanId,
        type: "vlan",
        position: nodePosition,
        style: { width: 380 },
        data: {
          label: `VLAN ${vlanNumber}`,
          vms: initialVMs,
          lastModified: Date.now(),
        },
        selected: false,
      }

      hookLogger.info({ newVlanId, position: nodePosition }, 'Adding new VLAN node')
      setNodes((nds) => {
        const updatedNodes = [...nds, newNode]
        hookLogger.debug({ nodeCount: updatedNodes.length }, 'Updated nodes after VLAN addition')
        return updatedNodes
      })

      return newVlanId
    },
    [reactFlowInstance, setNodes, nodes]
  )

  // Handle template click from sidebar
  const handleTemplateClick = useCallback(
    (template: Template) => {
      if (selectedNodes.length === 1) {
        const selectedNode = nodes.find((node) => node.id === selectedNodes[0])
        if (selectedNode && selectedNode.type === "vlan") {
          // Generate hostname for the selected VLAN
          const hostname = generateUniqueHostname(nodes, selectedNode.id, template.name)
          
          const newVM: VMData = {
            id: generateUniqueId(template.name),
            label: template.name,
            vmName: "",
            status: "Stopped",
            template: template.name,
            hostname: hostname,
          }
          
          setNodes((currentNodes) => {
            const updatedNodes = currentNodes.map((node) => {
              if (node.id === selectedNodes[0]) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    vms: [...(node.data.vms || []), newVM],
                    lastModified: Date.now(),
                  },
                }
              }
              return node
            })
            
            setTimeout(() => {
              if (reactFlowInstance) {
                const currentEdges = reactFlowInstance.getEdges()
                saveConfig(updatedNodes, currentEdges)
              }
            }, 100)
            
            return updatedNodes
          })
        }
      } else {
        // Generate VLAN ID first to use in hostname
        const newVlanId = generateSequentialVlanId(nodes)
        const hostname = generateUniqueHostname(nodes, newVlanId, template.name)
        
        const newVM: VMData = {
          id: generateUniqueId(template.name),
          label: template.name,
          vmName: "",
          status: "Stopped",
          template: template.name,
          hostname: hostname,
        }
        
        handleAddVLAN(undefined, newVM)
        
        setTimeout(() => {
          if (reactFlowInstance) {
            const currentNodes = reactFlowInstance.getNodes()
            const currentEdges = reactFlowInstance.getEdges()
            saveConfig(currentNodes, currentEdges)
          }
        }, 100)
      }
    },
    [handleAddVLAN, selectedNodes, nodes, setNodes, saveConfig, reactFlowInstance]
  )

  // Point over node detection
  const isPointOverNode = useCallback(
    (x: number, y: number) => {
      if (!reactFlowInstance) return null

      const flowPosition = reactFlowInstance.screenToFlowPosition({ x, y })

      for (const node of nodes) {
        if (node.type === "vlan") {
          const nodeX = node.position.x
          const nodeY = node.position.y
          const nodeWidth = Number(node.style?.width) || 380
          const nodeHeight = Number(node.style?.height) || 280

          if (
            flowPosition.x >= nodeX &&
            flowPosition.x <= nodeX + nodeWidth &&
            flowPosition.y >= nodeY &&
            flowPosition.y <= nodeY + nodeHeight
          ) {
            return node.id
          }
        }
      }

      return null
    },
    [reactFlowInstance, nodes]
  )

  // Drag and drop handlers
  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"

      if (reactFlowWrapper.current) {
        reactFlowWrapper.current.classList.add("bg-primary/5")

        if (!dropIndicatorRef.current) {
          const dropIndicator = document.createElement("div")
          dropIndicator.id = "drop-indicator"
          dropIndicator.className =
            "absolute rounded-full border-2 border-primary bg-primary/30 w-6 h-6 pointer-events-none z-50 transition-all duration-300"
          dropIndicator.style.transform = "translate(-50%, -50%)"
          document.body.appendChild(dropIndicator)
          dropIndicatorRef.current = dropIndicator
        }

        const hoveredNode = isPointOverNode(event.clientX, event.clientY)

        if (hoveredNode !== hoveredNodeId) {
          setNodes((nodes) =>
            nodes.map((node) => {
              if (node.id === hoveredNode) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isDropTarget: true,
                  },
                }
              } else if (node.data.isDropTarget) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isDropTarget: false,
                  },
                }
              }
              return node
            }),
          )

          setHoveredNodeId(hoveredNode)
        }

        if (dropIndicatorRef.current) {
          dropIndicatorRef.current.style.left = `${event.clientX}px`
          dropIndicatorRef.current.style.top = `${event.clientY}px`
        }
      }
    },
    [isPointOverNode, hoveredNodeId, setNodes]
  )

  const onDragLeave = useCallback(() => {
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current.classList.remove("bg-primary/5")

      if (dropIndicatorRef.current) {
        dropIndicatorRef.current.remove()
        dropIndicatorRef.current = null
      }

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.data.isDropTarget) {
            return {
              ...node,
              data: {
                ...node.data,
                isDropTarget: false,
              },
            }
          }
          return node
        }),
      )

      setHoveredNodeId(null)
    }
  }, [setNodes])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (reactFlowWrapper.current) {
        reactFlowWrapper.current.classList.remove("bg-primary/5")

        if (dropIndicatorRef.current) {
          dropIndicatorRef.current.remove()
          dropIndicatorRef.current = null
        }
      }

      const templateName = event.dataTransfer.getData("application/reactflow")

      if (!templateName || !reactFlowInstance || !reactFlowWrapper.current) {
        return
      }

      const template = templates.find((t) => t.name === templateName)
      if (!template) return

      if (hoveredNodeId) {
        // Generate hostname for the hovered VLAN
        const hostname = generateUniqueHostname(nodes, hoveredNodeId, template.name)
        
        const newVM: VMData = {
          id: generateUniqueId(template.name),
          label: template.name,
          vmName: "",
          status: "Stopped",
          template: template.name,
          hostname: hostname,
        }
        
        setNodes((nodes) => {
          const updatedNodes = nodes.map((node) => {
            if (node.id === hoveredNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  vms: [...(node.data.vms || []), newVM],
                  isDropTarget: false,
                  lastModified: Date.now(),
                },
              }
            } else if (node.data.isDropTarget) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isDropTarget: false,
                },
              }
            } else {
              return node
            }
          })
          
          setTimeout(() => {
            hookLogger.info({
              vmId: newVM.id,
              vmLabel: newVM.label,
              targetVlanId: hoveredNodeId,
              targetVlan: hoveredNodeId,
              totalNodes: updatedNodes.length,
              targetNode: updatedNodes.find(n => n.id === hoveredNodeId)
            })
            saveConfig(updatedNodes, edges)
          }, 100)
          
          return updatedNodes
        })
        
      } else {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        // Generate VLAN ID first to use in hostname
        const newVlanId = generateSequentialVlanId(nodes)
        const hostname = generateUniqueHostname(nodes, newVlanId, template.name)
        
        const newVM: VMData = {
          id: generateUniqueId(template.name),
          label: template.name,
          vmName: "",
          status: "Stopped",
          template: template.name,
          hostname: hostname,
        }

        handleAddVLAN(position, newVM)
        
        setTimeout(() => {
          setNodes((currentNodes) => {
            hookLogger.info({
              nodeCount: currentNodes.length,
              newVlanId,
              vlanNodes: currentNodes.filter(n => n.type === 'vlan').map(n => n.id)
            })
            saveConfig(currentNodes, edges)
            return currentNodes
          })
        }, 100)
      }

      setHoveredNodeId(null)
    },
    [reactFlowInstance, handleAddVLAN, templates, hoveredNodeId, setNodes, saveConfig, edges]
  )

  // Connection handler
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const isSelfConnection = params.source === params.target

      // Check if this is a router connection for better labeling
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      const isRouterConnection = sourceNode?.type === 'router' || targetNode?.type === 'router'
      
      let label: string
      let ruleName: string
      
      if (isSelfConnection) {
        label = `Self-connection ${params.source}`
        ruleName = `Rule ${params.source} to ${params.target}`
      } else if (isRouterConnection) {
        if (sourceNode?.type === 'router') {
          // Router to VLAN (Internet to VLAN)
          const targetVlanLabel = targetNode?.data?.label || targetNode?.id || 'VLAN'
          label = `Internet → ${targetVlanLabel}`
          ruleName = `Internet to ${targetVlanLabel}`
        } else if (targetNode?.type === 'router') {
          // VLAN to Router (VLAN to Internet)
          const sourceVlanLabel = sourceNode?.data?.label || sourceNode?.id || 'VLAN'
          label = `${sourceVlanLabel} → Internet`
          ruleName = `${sourceVlanLabel} to Internet`
        } else {
          // Fallback
          label = `Connection ${params.source} → ${params.target}`
          ruleName = `Rule ${params.source} to ${params.target}`
        }
      } else {
        // Regular VLAN to VLAN connection
        const sourceLabel = sourceNode?.data?.label || sourceNode?.id || params.source
        const targetLabel = targetNode?.data?.label || targetNode?.id || params.target
        label = `${sourceLabel} → ${targetLabel}`
        ruleName = `${sourceLabel} to ${targetLabel}`
      }

      const newEdge = {
        ...params,
        type: "custom",
        data: {
          label,
          status: {
            connectionType: "accept",
            name: ruleName,
            protocol: "tcp",
            ports: "",
            ip_last_octet_src: "",
            ip_last_octet_dst: "",
            bandwidth: "1 Gbps",
            latency: "5ms",
            packetLoss: "0%",
          },
        },
      }
      
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds)
        
        setTimeout(() => {
          if (reactFlowInstance) {
            const currentNodes = reactFlowInstance.getNodes()
            saveConfig(currentNodes, updatedEdges)
          }
        }, 100)
        
        return updatedEdges
      })
    },
    [setEdges, reactFlowInstance, saveConfig, nodes]
  )

  // Custom connection validation
  const isValidConnection = useCallback((connection: Edge | Connection) => {
    // Prevent self-connections
    if (connection.source === connection.target) return false
    
    // Find the source and target nodes
    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)
    
    // Allow router-VLAN connections (bidirectional)
    if ((sourceNode?.type === 'router' && targetNode?.type === 'vlan') ||
        (sourceNode?.type === 'vlan' && targetNode?.type === 'router')) {
      return true
    }
    
    // Allow VLAN-VLAN connections
    if (sourceNode?.type === 'vlan' && targetNode?.type === 'vlan') {
      return true
    }
    
    // Disallow all other connections
    return false
  }, [nodes])

  // Delete handler
  const onDelete = useCallback(({ nodes: deletedNodes, edges: deletedEdges }: { nodes: Node[]; edges: Edge[] }) => {
    logUserAction('topology-delete', 'TopologyState', {
      deletedNodeIds: deletedNodes.map(n => n.id),
      deletedEdgeIds: deletedEdges.map(e => e.id),
      deletedNodeCount: deletedNodes.length,
      deletedEdgeCount: deletedEdges.length
    })

    setTimeout(() => {
      if (reactFlowInstance) {
        const currentNodes = reactFlowInstance.getNodes()
        const currentEdges = reactFlowInstance.getEdges()
        
        hookLogger.info({
          remainingVLANCount: currentNodes.filter(n => n.type === 'vlan').length,
          remainingEdges: currentEdges.map(e => e.id),
          deletedNodes: deletedNodes.map(n => n.id),
          deletedEdges: deletedEdges.map(e => e.id)
        })
        
        saveConfig(currentNodes, currentEdges)
      } else {
        hookLogger.warn({}, 'ReactFlow instance not available, cannot save config after deletion')
      }
    }, 100)
  }, [reactFlowInstance, saveConfig])

  const onMove = () => {
    // Handle zoom changes if needed
  }

  // Delete VM from VLAN
  const onDeleteVM = useCallback(async (vmId: string, vlanId: string): Promise<void> => {
    logUserAction('vm-delete', 'TopologyState', { vmId, vlanId })
    
    setNodes((currentNodes) => 
      currentNodes.map((node) => {
        if (node.id === vlanId && node.type === 'vlan') {
          const updatedVMs = node.data.vms?.filter((vm: VMData) => vm.id !== vmId) || []
          hookLogger.debug({ 
            vlanId,
            originalCount: node.data.vms?.length || 0, 
            newCount: updatedVMs.length,
            removedVM: vmId
          })
          
          return {
            ...node,
            data: {
              ...node.data,
              vms: updatedVMs
            }
          }
        }
        return node
      })
    )

    // Save configuration after VM removal
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (reactFlowInstance) {
          const currentNodes = reactFlowInstance.getNodes()
          const currentEdges = reactFlowInstance.getEdges()
          
          hookLogger.info({
            vlanId,
            removedVMId: vmId,
            totalNodes: currentNodes.length
          })
          
          saveConfig(currentNodes, currentEdges)
        }
        resolve()
      }, 100)
    })
  }, [reactFlowInstance, saveConfig])

  return {
    // State
    nodes,
    edges,
    reactFlowInstance,
    selectedNodes,
    hoveredNodeId,
    reactFlowWrapper,
    lastSaveTimeRef,
    // Setters
    setNodes,
    setEdges,
    setReactFlowInstance,
    setSelectedNodes,
    setHoveredNodeId,
    // Node state handlers
    onNodesChange: handleNodesChange,
    onEdgesChange,
    // Event handlers
    onConnect,
    isValidConnection,
    onSelectionChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onDelete,
    onDeleteVM,
    onMove,
    // Actions
    handleAddVLAN,
    handleTemplateClick,
    syncVMStatesWithBackend,
    // Utilities
    isPointOverNode,
  }
}