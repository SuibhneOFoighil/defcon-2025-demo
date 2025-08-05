"use client"

import type React from "react"

import { useState } from "react"
import { FormCheckbox } from "@/components/ui/form/form-checkbox"
import type { StepProps } from "./types"
import { WizardStepHeader } from "./wizard-step-header"
// Import the FormSelect component instead of CustomDropdown
import { FormSelect } from "@/components/ui/form/form-select"
import { logUserAction } from "@/lib/logger"

export function NetworkDetailsStep({ formData, onInputChange }: StepProps) {
  // Initialize local state from formData
  const [localState, setLocalState] = useState({
    vlanCount: formData.numberOfVLANs || 0,
    sameVMCount: formData.sameVMsPerVLAN !== false,
    vmsPerVLAN: formData.vmsPerVLAN || 0,
    vlanVMs: formData.vlanVMs || {},
  })

  // Handle VLAN count change
  const handleVLANCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = Number.parseInt(e.target.value, 10)
    setLocalState((prev) => ({ ...prev, vlanCount: count }))
    onInputChange("numberOfVLANs", count)
  }

  // Handle same VM count toggle
  const handleSameVMCountToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setLocalState((prev) => ({ ...prev, sameVMCount: checked }))
    onInputChange("sameVMsPerVLAN", checked)
  }

  // Handle VMs per VLAN change
  const handleVMsPerVLANChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = Number.parseInt(e.target.value, 10)
    setLocalState((prev) => ({ ...prev, vmsPerVLAN: count }))
    onInputChange("vmsPerVLAN", count)
  }

  // Handle individual VLAN VM count change
  const handleVLANVMChange = (vlanNumber: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = Number.parseInt(e.target.value, 10)
    const updatedVlanVMs = { ...localState.vlanVMs, [vlanNumber]: count }
    setLocalState((prev) => ({ ...prev, vlanVMs: updatedVlanVMs }))
    onInputChange("vlanVMs", updatedVlanVMs)
  }

  // Generate number options for dropdowns
  const generateNumberOptions = (max: number) => {
    return Array.from({ length: max + 1 }, (_, i) => ({
      value: i.toString(),
      label: i.toString(),
    }))
  }

  const vlanCountOptions = generateNumberOptions(20)
  const vmsPerVLANOptions = generateNumberOptions(20)

  return (
    <div className="max-w-3xl mx-auto p-6 bg-background">
      <WizardStepHeader title="Network Details" showSkip onSkip={() => logUserAction('skip-network-details', 'NetworkDetailsStep', { rangeName: formData.name })} />

      <div className="space-y-6">
        {/* Number of VLANs */}
        <div>
          <FormSelect
            label="Number of VLANs"
            options={vlanCountOptions}
            value={localState.vlanCount.toString()}
            onChange={handleVLANCountChange}
          />
        </div>

        {localState.vlanCount > 0 && (
          <>
            {/* Same number of VMs option */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Number of VMs (Optional)</label>
              <FormCheckbox
                checked={localState.sameVMCount}
                onChange={handleSameVMCountToggle}
                label="Same number of VMs in each VLAN"
                description="We will generate the required #VM placeholders based on this. You can assign properties to individual VMs later while setting up the range."
              />
            </div>

            {/* VM count fields */}
            {localState.sameVMCount ? (
              <div>
                <FormSelect
                  label="Number of VMs under each VLAN"
                  options={vmsPerVLANOptions}
                  value={localState.vmsPerVLAN.toString()}
                  onChange={handleVMsPerVLANChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: localState.vlanCount }, (_, i) => i + 1).map((vlanNumber) => (
                  <div key={vlanNumber}>
                    <FormSelect
                      label={`Number of VMs in VLAN ${vlanNumber}`}
                      options={vmsPerVLANOptions}
                      value={(localState.vlanVMs[vlanNumber] || 0).toString()}
                      onChange={(e) => handleVLANVMChange(vlanNumber, e)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
