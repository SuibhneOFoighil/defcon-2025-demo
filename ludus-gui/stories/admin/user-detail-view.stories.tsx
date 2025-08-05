import type { Meta, StoryObj } from '@storybook/react';
import { UserDetailView, type UserDetail, type UserGroup, type UserRange, type UserTemplate } from '@/components/admin/user-detail-view';
import { Toaster } from 'sonner';
import { fn } from '@storybook/test';
import { NotificationProvider } from "@/contexts/notification-context";

const mockUserGroups: UserGroup[] = [
  { id: 'group-dev', name: 'Developers', description: 'Core software development team.', memberCount: 8 },
  { id: 'group-qa', name: 'QA Testers', description: 'Quality assurance and testing specialists.', memberCount: 4 },
  { id: 'group-ops', name: 'Operations', description: 'Infrastructure and operations management.', memberCount: 3 },
];

const mockUserRanges: UserRange[] = [
  { 
    id: 'range-001', 
    title: 'Production Web Cluster', 
    status: 'running', 
    resources: { cpus: 8, ram: 32, disk: 500 }, 
    lastUsed: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1583484963886-76B5C034a1a7?q=80&w=200&auto=format&fit=crop'
  },
  { 
    id: 'range-002', 
    title: 'Staging Database Server', 
    status: 'deployed', 
    resources: { cpus: 4, ram: 16, disk: 200 }, 
    lastUsed: '1 day ago',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop'
  },
];

const mockUserTemplates: UserTemplate[] = [
  { 
    id: 'tpl-ubuntu-docker', 
    title: 'Ubuntu 22.04 with Docker', 
    status: 'published', 
    lastEdited: '3 days ago',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'
  },
  { 
    id: 'tpl-win-iis', 
    title: 'Windows Server with IIS', 
    status: 'draft', 
    lastEdited: '1 week ago',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=200&auto=format&fit=crop'
  },
];

const mockUserDetail: UserDetail = {
  id: 'user-detail-john-doe',
  name: 'Johnathan Doe',
  userId: 'john.doe_001',
  email: 'john.doe@example.com',
  role: 'manager',
  resources: {
    cpus: 16,
    ram: 64,
    disk: 1024,
  },
  groups: mockUserGroups,
  ranges: mockUserRanges,
  templates: mockUserTemplates,
};

const meta: Meta<typeof UserDetailView> = {
  title: 'Admin/Pages/UserDetailView',
  component: UserDetailView,
  parameters: {
    layout: 'fullscreen', // UserDetailView is a full page component
  },
  tags: ['autodocs'],
  argTypes: {
    user: { control: 'object' },
    onBack: { action: 'onBackClicked' },
  },
  decorators: [
    (Story) => (
      <NotificationProvider>
        <div className="h-screen bg-background">
          <Story />
          <Toaster richColors position="top-right" />
          {/* Placeholder for modals if they portal outside the component */}
          <div id="storybook-external-modals"></div>
        </div>
      </NotificationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: mockUserDetail,
    onBack: fn(),
  },
};

export const TeamMemberUser: Story = {
  args: {
    user: {
      ...mockUserDetail,
      name: 'Alice Wonderland',
      userId: 'alice.w_002',
      email: 'alice.wonderland@example.com',
      role: 'team-member',
      groups: [mockUserGroups[0]],
      ranges: [],
      templates: [mockUserTemplates[1]],
    },
    onBack: fn(),
  },
};

export const UserWithNoItems: Story = {
  args: {
    user: {
      ...mockUserDetail,
      name: 'Bob The Builder',
      userId: 'bob.b_003',
      email: 'bob.builder@example.com',
      role: 'team-member',
      groups: [],
      ranges: [],
      templates: [],
      resources: { cpus: 0, ram: 0, disk: 0 },
    },
    onBack: fn(),
  },
}; 