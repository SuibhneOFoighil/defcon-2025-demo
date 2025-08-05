import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from '@/components/admin/user-card';
import type { User } from '@/lib/types/admin'; // Ensure this path is correct
import { Toaster } from 'sonner';

const meta: Meta<typeof UserCard> = {
  title: 'Admin/Components/UserCard',
  component: UserCard,
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster /> 
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    user: { control: 'object', description: 'User object' },
    className: { control: 'text', description: 'Additional class names' },
  },
};

export default meta;

type Story = StoryObj<typeof UserCard>;

const sampleUser1: User = {
  id: 'user123',
  userID: 'user123',
  name: 'Alice Wonderland',
  isAdmin: true,
  selected: false,
};

const sampleUser2: User = {
  id: 'user456',
  userID: 'user456',
  name: 'Bob The Builder',
  isAdmin: false,
  selected: true,
};

const sampleUser3: User = {
  id: 'user789',
  userID: 'user789',
  name: 'Charlie Brown',
  isAdmin: false,
  selected: false,
};

export const Default: Story = {
  args: {
    user: sampleUser1,
    className: 'w-96', // Example width for better display
  },
};

export const Selected: Story = {
  args: {
    user: sampleUser2,
    className: 'w-96',
  },
};

export const Minimal: Story = {
  args: {
    user: sampleUser3,
    className: 'w-96',
  },
};

export const AdminUser: Story = {
  args: {
    user: { ...sampleUser1, isAdmin: true },
    className: 'w-96',
  },
};

export const RegularUser: Story = {
  args: {
    user: { ...sampleUser2, isAdmin: false },
    className: 'w-96',
  },
}; 