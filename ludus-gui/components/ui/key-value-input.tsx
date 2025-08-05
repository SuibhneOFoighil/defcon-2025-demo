"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { X } from "lucide-react"

interface KeyValueInputProps {
  values: Record<string, unknown>
  onValuesChange: (values: Record<string, unknown>) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  buttonText?: string
  className?: string
}

export function KeyValueInput({
  values,
  onValuesChange,
  keyPlaceholder = "Variable name",
  valuePlaceholder = "Variable value",
  buttonText = "Add",
  className = "",
}: KeyValueInputProps) {
  const [keyInput, setKeyInput] = useState("")
  const [valueInput, setValueInput] = useState("")

  const handleAdd = () => {
    if (keyInput.trim() && valueInput.trim()) {
      const newValues = { ...values, [keyInput.trim()]: valueInput.trim() }
      onValuesChange(newValues)
      setKeyInput("")
      setValueInput("")
    }
  }

  const handleRemove = (key: string) => {
    const newValues = { ...values }
    delete newValues[key]
    onValuesChange(newValues)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  const entries = Object.entries(values)

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <Input
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={keyPlaceholder}
          className="h-8 text-xs"
        />
        <Input
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={valuePlaceholder}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!keyInput.trim() || !valueInput.trim()}
          className="h-8 text-xs"
        >
          {buttonText}
        </Button>
      </div>
      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground">{key}</span>
                <span className="text-xs text-muted-foreground mx-2">=</span>
                <span className="text-xs text-muted-foreground break-all">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(key)}
                className="h-6 w-6 p-0 ml-2 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}