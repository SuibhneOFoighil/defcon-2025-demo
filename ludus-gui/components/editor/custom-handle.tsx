"use client"

import React from "react"
import { Handle, type HandleProps } from "@xyflow/react"

// ============================================================================
// Custom Handle Component
// ============================================================================

interface CustomHandleProps extends HandleProps {
  isHandleVisible: boolean
}

export const CustomHandle: React.FC<CustomHandleProps> = ({ isHandleVisible, style, type, ...props }) => {
  // Subtle differentiation: shape + monochromatic colors
  const handleTypeStyles = type === 'source' 
    ? {
        className: '!bg-gray-300 !border-gray-400 !rounded-full', // Source: lighter circular
        borderRadius: '50%'
      }
    : {
        className: '!bg-gray-500 !border-gray-600 !rounded-none', // Target: darker square
        borderRadius: '0'
      }
    
  return (
    <Handle
      {...props}
      type={type}
      className={`
        ${handleTypeStyles.className}
        !w-3 !h-3
        transition-all duration-200
        ${isHandleVisible ? "opacity-100 scale-100" : "opacity-0 scale-50 -z-10"}
      `}
      style={{
        pointerEvents: isHandleVisible ? "all" : "none",
        borderRadius: handleTypeStyles.borderRadius,
        ...style, // Merge in the positioning styles
      }}
    />
  )
}