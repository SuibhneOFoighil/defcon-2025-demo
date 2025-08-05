import type { Meta, StoryObj } from '@storybook/react';
import { RangesCard } from '@/components/ranges/ranges-card';
import { fn } from '@storybook/test';

// Sample range items for different states
const sampleRanges = {
  success: {
    id: "JD001",
    name: "LUDUS-001",
    labTemplate: "GOAD AD Lab",
    state: "SUCCESS" as const,
    vmsRunning: 8,
    vmsTotal: 8,
    lastUse: "20 h ago",
  },
  failure: {
    id: "JD002",
    name: "LUDUS-002",
    labTemplate: "Wazuh Blue",
    state: "FAILURE" as const,
    vmsRunning: 5,
    vmsTotal: 7,
    lastUse: "18 h ago",
  },
  pending: {
    id: "JD004",
    name: "LUDUS-004",
    labTemplate: "Kali Playground",
    state: "PENDING" as const,
    vmsRunning: 0,
    vmsTotal: 3,
    lastUse: "8 h ago",
  },
  neverDeployed: {
    id: "EDGE1",
    name: "Zero VMs Lab",
    labTemplate: "Empty Template",
    state: "NEVER DEPLOYED" as const,
    vmsRunning: 0,
    vmsTotal: 0,
    lastUse: "never",
  }
};

const meta: Meta<typeof RangesCard> = {
  title: 'Dashboard/RangesCard',
  component: RangesCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RangesCard>;

export const Default: Story = {
  args: {
    item: sampleRanges.success,
    onNavigate: fn(),
  },
};

export const FailureState: Story = {
  args: {
    item: sampleRanges.failure,
    onNavigate: fn(),
  },
};

export const PendingState: Story = {
  args: {
    item: sampleRanges.pending,
    onNavigate: fn(),
  },
};

export const NeverDeployedState: Story = {
  args: {
    item: sampleRanges.neverDeployed,
    onNavigate: fn(),
  },
}; 