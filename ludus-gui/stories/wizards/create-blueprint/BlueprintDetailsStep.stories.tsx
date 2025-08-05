import type { Meta, StoryObj } from '@storybook/react'
import { BlueprintDetailsStep } from '@/components/wizards/create-blueprint/blueprint-details-step'
import type { BlueprintFormData } from '@/components/wizards/create-blueprint/types'

const meta: Meta<typeof BlueprintDetailsStep> = {
  title: 'Wizards/CreateBlueprint/BlueprintDetailsStep',
  component: BlueprintDetailsStep,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BlueprintDetailsStep>

const mockFormData: BlueprintFormData = {
  blueprintId: "",
  blueprintName: "",
  blueprintDescription: "",
  category: "",
  tags: [],
  yamlFile: null,
}

export const Default: Story = {
  args: {
    formData: mockFormData,
    onInputChange: (field: string, value: unknown) => {
      console.log(`Field "${field}" changed to:`, value)
    },
  },
}

export const WithData: Story = {
  args: {
    formData: {
      ...mockFormData,
      blueprintId: "security-lab-v1",
      blueprintName: "Security Lab",
      blueprintDescription: "A comprehensive security testing environment with Kali Linux and vulnerable VMs for penetration testing practice.",
      category: "security",
      tags: ["kali", "penetration-testing", "vulnerable", "security"],
    },
    onInputChange: (field: string, value: unknown) => {
      console.log(`Field "${field}" changed to:`, value)
    },
  },
}