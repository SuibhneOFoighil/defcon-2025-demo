"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Badge } from "./badge"
import { X } from "lucide-react"

interface AddItemInputProps {
  items: string[]
  onItemsChange: (items: string[]) => void
  placeholder?: string
  buttonText?: string
  inputClassName?: string
  buttonClassName?: string
  containerClassName?: string
  badgeClassName?: string
}

export function AddItemInput({
  items,
  onItemsChange,
  placeholder = "Add item...",
  buttonText = "Add",
  inputClassName = "h-8 text-xs flex-1",
  buttonClassName = "h-8 text-xs",
  containerClassName = "flex gap-2",
  badgeClassName = "text-xs",
}: AddItemInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleAdd = () => {
    if (inputValue.trim()) {
      onItemsChange([...items, inputValue.trim()])
      setInputValue("")
    }
  }

  const handleRemove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <div className={containerClassName}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          className={buttonClassName}
        >
          {buttonText}
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <Badge key={idx} variant="secondary" className={badgeClassName}>
              {item}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleRemove(idx)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}