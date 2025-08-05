"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RangeDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  projectMetadata: {
    id: string
    name: string
    status: string
  }
  rangeStats: {
    cpus: number
    ram: number
    disk: number
    vlans: {
      name: string
      description: string
    }[]
  }
  onSave: (data: {
    name: string
    description: string
    purpose: string
    cpus: number
    ram: number
    disk: number
  }) => void
}

export function RangeDetailsModal({ isOpen, onClose, projectMetadata, rangeStats, onSave }: RangeDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: projectMetadata.name,
    description: "A cyber security lab environment for penetration testing and ethical hacking simulations.",
    purpose: "Training and assessment of security professionals in a controlled environment.",
    cpus: rangeStats.cpus,
    ram: rangeStats.ram,
    disk: rangeStats.disk,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Range Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              Range ID
            </Label>
            <Input id="id" value={projectMetadata.id} disabled className="col-span-3 bg-muted" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Input id="status" value={projectMetadata.status} disabled className="col-span-3 bg-muted" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="purpose" className="text-right pt-2">
              Purpose
            </Label>
            <Textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="col-span-3 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpus">CPUs</Label>
              <Input id="cpus" name="cpus" type="number" min="1" value={formData.cpus} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ram">RAM (GB)</Label>
              <Input id="ram" name="ram" type="number" min="1" value={formData.ram} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disk">Disk (GB)</Label>
              <Input id="disk" name="disk" type="number" min="1" value={formData.disk} onChange={handleChange} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
