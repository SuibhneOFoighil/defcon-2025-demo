import type { Meta, StoryObj } from '@storybook/react';
import { GroupCard } from '@/components/admin/group-card';
import { Toaster } from 'sonner'; // GroupCard uses toast from sonner
import { fn } from '@storybook/test';

const meta: Meta<typeof GroupCard> = {
  title: 'Admin/Components/GroupCard',
  component: GroupCard,
  decorators: [
    (Story) => (
      <div className="p-4 max-w-sm mx-auto">
        <Story />
        <Toaster richColors position="top-right" /> {/* Sonner Toaster needs to be added to the tree */}
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    group: { control: 'object' },
    className: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultGroupData = {
  id: 'group-alpha',
  name: 'Alpha Squadron',
  memberCount: 12,
  description: 'The Alpha Squadron is responsible for pioneering new strategies and technologies in cyber defense and offense.',
  selected: false,
};

export const Default: Story = {
  args: {
    group: defaultGroupData,
    className: 'min-h-[200px]',
    onClick: fn(),
    onKeyDown: fn(),
  },
};

export const Selected: Story = {
  args: {
    group: {
      ...defaultGroupData,
      id: 'group-beta-selected',
      name: 'Beta Squadron (Selected)',
      selected: true,
    },
    className: 'min-h-[200px]',
    onClick: fn(),
    onKeyDown: fn(),
  },
};

export const FewMembers: Story = {
  args: {
    group: {
      ...defaultGroupData,
      id: 'group-bravo',
      name: 'Bravo Team',
      memberCount: 3,
      description: 'A small, agile team for rapid response.',
    },
    className: 'min-h-[200px]',
    onClick: fn(),
    onKeyDown: fn(),
  },
};

export const LongDescription: Story = {
  args: {
    group: {
      ...defaultGroupData,
      id: 'group-omega',
      name: 'Omega Protocol',
      memberCount: 25,
      description: 'The Omega Protocol encompasses a wide range of activities, including advanced threat intelligence, long-term strategic planning for cyber warfare, development of next-generation security tools, and training elite cyber operatives. This group operates globally with utmost secrecy and efficiency, often dealing with highly sensitive national security matters and international cyber espionage cases. Their work is critical and demands the highest level of skill and dedication from every member. It also involves a lot of paperwork.',
    },
    className: 'min-h-[200px]',
    onClick: fn(),
    onKeyDown: fn(),
  },
};

export const ShortDescription: Story = {
  args: {
    group: {
      ...defaultGroupData,
      id: 'group-delta',
      name: 'Delta Force',
      memberCount: 8,
      description: 'Tactical cyber unit.',
    },
    className: 'min-h-[200px]',
    onClick: fn(),
    onKeyDown: fn(),
  },
}; 