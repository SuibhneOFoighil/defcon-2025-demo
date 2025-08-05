import type { Meta, StoryObj } from '@storybook/react';
import { RangePreview } from '@/components/ranges/range-preview';

const meta: Meta<typeof RangePreview> = {
  title: 'Dashboard/RangePreview',
  component: RangePreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A miniature network topology preview component that renders a simplified version of the range's network diagram:

## Features:
- **Miniature ReactFlow**: Uses ReactFlow to render actual network topology
- **Simplified nodes**: Compact VLAN nodes showing name and VM count
- **Non-interactive**: Disabled dragging, zooming, and selection for preview purposes
- **Responsive**: Fits the topology within the preview area automatically
- **Themed**: Uses design system colors and styling

## Network Topologies:
Different range IDs show different network configurations:
- **JD001**: Simple DMZ + Internal network (2 VLANs)
- **JD002**: Three-tier architecture (Web, App, DB)
- **AL003**: Splunk deployment (Central + Forwarders + Endpoints)
- **JD004**: Penetration testing lab (Kali + Targets)
- **JD005**: Single Windows 11 environment
- **Default**: Generic network for unknown range IDs

## Usage:
Used within range cards to give users a visual preview of the network topology they'll be working with.
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    rangeId: {
      control: 'select',
      options: ['JD001', 'JD002', 'AL003', 'JD004', 'JD005', 'UNKNOWN'],
      description: 'Range ID that determines which network topology to display'
    }
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RangePreview>;

// DMZ + Internal network
export const DMZNetwork: Story = {
  name: "DMZ Network (JD001)",
  args: {
    rangeId: "JD001"
  },
};

// Three-tier architecture
export const ThreeTierArchitecture: Story = {
  name: "Three-Tier Architecture (JD002)",
  args: {
    rangeId: "JD002"
  },
};

// Splunk deployment
export const SplunkDeployment: Story = {
  name: "Splunk Deployment (AL003)",
  args: {
    rangeId: "AL003"
  },
};

// Penetration testing lab
export const PentestLab: Story = {
  name: "Pentest Lab (JD004)",
  args: {
    rangeId: "JD004"
  },
};

// Single node
export const SingleNode: Story = {
  name: "Single Node (JD005)",
  args: {
    rangeId: "JD005"
  },
};

// Unknown range (default)
export const DefaultNetwork: Story = {
  name: "Default Network (Unknown Range)",
  args: {
    rangeId: "UNKNOWN"
  },
};

// All previews in a grid
export const AllPreviews: Story = {
  name: "All Network Previews",
  render: () => {
    const ranges = [
      { id: 'JD001', name: 'DMZ Network' },
      { id: 'JD002', name: 'Three-Tier' },
      { id: 'AL003', name: 'Splunk' },
      { id: 'JD004', name: 'Pentest Lab' },
      { id: 'JD005', name: 'Single Node' },
      { id: 'UNKNOWN', name: 'Default' }
    ];

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
        {ranges.map((range) => (
          <div key={range.id} className="space-y-2">
            <h3 className="text-sm font-medium text-center">{range.name}</h3>
            <RangePreview rangeId={range.id} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Overview of all available network topology previews showing the variety of configurations.'
      }
    }
  }
}; 