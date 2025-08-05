import type { Meta, StoryObj } from '@storybook/react'
import { BlueprintsCard } from '@/components/blueprints/blueprints-card'

const meta: Meta<typeof BlueprintsCard> = {
  title: 'Dashboard/BlueprintsCard',
  component: BlueprintsCard,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof BlueprintsCard>

export const WindowsBlueprint: Story = {
  args: {
    item: {
      id: "windows-server-2019",
      name: "Windows Server 2019",
      description: "Standard Windows Server 2019 with IIS and SQL Server",
      category: "Windows",
      vmCount: 1,
      networkCount: 1,
      estimatedDeployTime: "15 min",
      tags: ["windows", "server", "iis", "sql"]
    },
    onNavigate: (id: string) => {
      console.log('Navigate to blueprint:', id)
    },
  },
}

export const LinuxBlueprint: Story = {
  args: {
    item: {
      id: "linux-web-stack",
      name: "Linux Web Stack",
      description: "Ubuntu 22.04 with NGINX, PHP, and MySQL",
      category: "Linux",
      vmCount: 2,
      networkCount: 1,
      estimatedDeployTime: "10 min",
      tags: ["linux", "nginx", "php", "mysql"]
    },
    onNavigate: (id: string) => {
      console.log('Navigate to blueprint:', id)
    },
  },
}

export const SecurityBlueprint: Story = {
  args: {
    item: {
      id: "security-lab",
      name: "Security Lab",
      description: "Kali Linux and vulnerable VMs for penetration testing",
      category: "Security",
      vmCount: 4,
      networkCount: 2,
      estimatedDeployTime: "25 min",
      tags: ["kali", "penetration-testing", "vulnerable"]
    },
    onNavigate: (id: string) => {
      console.log('Navigate to blueprint:', id)
    },
  },
}

export const ComplexBlueprint: Story = {
  args: {
    item: {
      id: "enterprise-ad",
      name: "Enterprise Active Directory",
      description: "Windows domain with DC, member servers, and workstations",
      category: "Windows",
      vmCount: 5,
      networkCount: 2,
      estimatedDeployTime: "30 min",
      tags: ["windows", "active-directory", "domain", "enterprise", "windows-server", "domain-controller"]
    },
    onNavigate: (id: string) => {
      console.log('Navigate to blueprint:', id)
    },
  },
}