import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TemplateBuildSelectionModal } from '@/components/templates/template-build-selection-modal'
import { Button } from '@/components/ui/button'
import type { Template } from '@/lib/types'

const meta: Meta<typeof TemplateBuildSelectionModal> = {
  title: 'Templates/TemplateBuildSelectionModal',
  component: TemplateBuildSelectionModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TemplateBuildSelectionModal>

// Mock templates with various edge cases
const mockTemplates: Template[] = [
  {
    name: 'ubuntu-22.04',
    built: true,
  },
  {
    name: 'windows-server-2019',
    built: false,
  },
  {
    name: 'centos-stream-9',
    built: true,
  },
  {
    name: 'debian-bullseye',
    built: false,
  },
]

const mockTemplatesWithLongNames: Template[] = [
  {
    name: 'could not find template name in /opt/ludus/users/suibhne-foighil/packer/_centos-7.8.2003-x64-fr-server.pkr.hcl',
    built: false,
  },
  {
    name: 'could not find template name in /opt/ludus/users/suibhne-foighil/packer/_rocky-9-x64-server.pkr.hcl',
    built: false,
  },
  {
    name: 'could not find template name in /opt/ludus/users/suibhne-foighil/packer/_ubuntu-24.04.2-x64-us-server.pkr.hcl',
    built: false,
  },
  {
    name: 'could not find template name in /opt/ludus/users/suibhne-foighil/packer/rocky-9-x64-server/._rocky-9-x64-server.pkr.hcl',
    built: false,
  },
  {
    name: 'windows-server-2022-datacenter-with-desktop-experience-evaluation',
    built: true,
  },
  {
    name: 'rhel-9.4-enterprise-linux-server-with-gui-x86_64-dvd.iso',
    built: true,
  },
]

const mockEmptyTemplates: Template[] = []

const mockAllBuiltTemplates: Template[] = [
  {
    name: 'ubuntu-22.04',
    built: true,
  },
  {
    name: 'windows-server-2019',
    built: true,
  },
  {
    name: 'centos-stream-9',
    built: true,
  },
]

// Template wrapper component for stories
function TemplateModalWrapper({ 
  templates, 
  isBuilding = false 
}: { 
  templates: Template[]
  isBuilding?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleBuildTemplates = (template: string | undefined, parallel: boolean) => {
    console.log('Building templates:', { template, parallel })
    setIsOpen(false)
  }

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>
        Open Template Build Modal
      </Button>
      
      <TemplateBuildSelectionModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onBuildTemplates={handleBuildTemplates}
        templates={templates}
        isBuilding={isBuilding}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <TemplateModalWrapper templates={mockTemplates} />,
}

export const LongTemplateNames: Story = {
  render: () => <TemplateModalWrapper templates={mockTemplatesWithLongNames} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows how the modal handles very long template names that might cause layout issues.',
      },
    },
  },
}

export const EmptyState: Story = {
  render: () => <TemplateModalWrapper templates={mockEmptyTemplates} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no templates are available.',
      },
    },
  },
}

export const AllTemplatesBuilt: Story = {
  render: () => <TemplateModalWrapper templates={mockAllBuiltTemplates} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the modal when all templates are already built.',
      },
    },
  },
}

export const IsBuilding: Story = {
  render: () => <TemplateModalWrapper templates={mockTemplates} isBuilding={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the modal state when templates are currently being built.',
      },
    },
  },
}

export const MixedLengthTemplates: Story = {
  render: () => <TemplateModalWrapper templates={[
    ...mockTemplates,
    ...mockTemplatesWithLongNames.slice(0, 2),
  ]} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the modal with a mix of normal and long template names.',
      },
    },
  },
}

export const SingleTemplate: Story = {
  render: () => <TemplateModalWrapper templates={[mockTemplates[0]]} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the modal with only one template available.',
      },
    },
  },
}

export const ManyTemplates: Story = {
  render: () => <TemplateModalWrapper templates={[
    ...mockTemplates,
    ...mockTemplatesWithLongNames,
    { name: 'fedora-39', built: true },
    { name: 'opensuse-leap-15.5', built: false },
    { name: 'arch-linux-latest', built: true },
    { name: 'alpine-3.18', built: false },
    { name: 'freebsd-13.2', built: true },
  ]} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the modal with many templates to test scrolling behavior.',
      },
    },
  },
}