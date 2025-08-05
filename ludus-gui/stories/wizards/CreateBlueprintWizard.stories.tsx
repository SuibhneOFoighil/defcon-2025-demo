import type { Meta, StoryObj } from '@storybook/react'
import { CreateBlueprintWizard } from '@/components/wizards/create-blueprint-wizard'

const meta: Meta<typeof CreateBlueprintWizard> = {
  title: 'Wizards/CreateBlueprintWizard',
  component: CreateBlueprintWizard,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CreateBlueprintWizard>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: (open: boolean) => {
      console.log('Modal open state changed to:', open)
    },
    onSuccess: () => {
      console.log('Blueprint creation successful!')
    },
  },
}