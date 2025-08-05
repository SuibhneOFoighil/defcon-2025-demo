import type { Meta, StoryObj } from '@storybook/react'
import { ImportYamlStep } from '@/components/wizards/create-blueprint/import-yaml-step'
import type { BlueprintFormData } from '@/components/wizards/create-blueprint/types'

const meta: Meta<typeof ImportYamlStep> = {
  title: 'Wizards/CreateBlueprint/ImportYamlStep',
  component: ImportYamlStep,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ImportYamlStep>

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

// Create a mock file for the story
const mockYamlFile = new File(['ludus:\n  - vm_name: "test-vm"\n    template: "ubuntu-22.04"'], 'test-blueprint.yaml', {
  type: 'text/yaml'
})

export const WithSelectedFile: Story = {
  args: {
    formData: {
      ...mockFormData,
      yamlFile: mockYamlFile,
    },
    onInputChange: (field: string, value: unknown) => {
      console.log(`Field "${field}" changed to:`, value)
    },
  },
}