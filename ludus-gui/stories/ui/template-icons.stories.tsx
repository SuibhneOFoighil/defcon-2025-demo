import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TemplateIcon } from '@/lib/utils/template-icons'

const meta: Meta = {
  title: 'UI/Template Icons',
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj

// A helper component to render a label under each icon
function IconWithLabel({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 w-24">
      <TemplateIcon templateName={name} className="h-12 w-12" />
      <span className="text-xs text-muted-foreground text-center">{name}</span>
    </div>
  )
}

const templateNames = [
  'Debian',
  'Kali Linux',
  'Ubuntu',
  'Windows 11',
  'Rocky Linux',
  'CentOS 7',
  'Commando VM',
  'Flare VM',
  'Remnux',
  'Generic Desktop',
  'Generic Server',
]

export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-6 bg-card rounded-lg">
      {templateNames.map((name) => (
        <IconWithLabel key={name} name={name} />
      ))}
    </div>
  ),
} 