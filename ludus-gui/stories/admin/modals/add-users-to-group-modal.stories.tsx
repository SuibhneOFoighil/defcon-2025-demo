import type { Meta, StoryObj } from "@storybook/react";
import { AddUsersToGroupModal } from "@/components/admin/modals/add-users-to-group-modal";
import { Button } from "@/components/ui/button";
import React from "react";
import type { User, Group } from "@/lib/types/admin";
import { Toaster } from "sonner";

const mockUsers: User[] = Array.from({ length: 15 }, (_, i) => ({
  id: `user${i + 1}`,
  userID: `user${i + 1}`,
  name: `User FullName ${i + 1}`,
  isAdmin: i % 5 === 0, // Make every 5th user an admin
  dateCreated: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  dateLastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  selected: false,
}));

const mockTargetGroups: Pick<Group, 'id' | 'name'>[] = [
  { id: "grp1", name: "Red Team" },
  { id: "grp2", name: "Blue Team" },
];

const meta: Meta<typeof AddUsersToGroupModal> = {
  title: "Admin/Modals/AddUsersToGroupModal",
  component: AddUsersToGroupModal,
  decorators: [
    (Story) => (
      <div>
        <Toaster />
        <div id="story-book-modals">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed" },
    targetGroups: { control: "object" },
    availableUsers: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof AddUsersToGroupModal>;

export const Default: Story = {
  args: {
    open: true,
    targetGroups: [mockTargetGroups[0]],
    availableUsers: mockUsers,
    onClose: () => console.log("Modal closed"),
    onConfirm: (selectedUserIds: string[]) => console.log("Confirmed with users:", selectedUserIds),
  },
};

export const MultipleTargetGroups: Story = {
  args: {
    open: true,
    targetGroups: mockTargetGroups,
    availableUsers: mockUsers,
    onClose: () => console.log("Modal closed"),
    onConfirm: (selectedUserIds: string[]) => console.log("Confirmed with users:", selectedUserIds),
  },
};

export const NoTargetGroups: Story = {
  args: {
    open: true,
    targetGroups: [],
    availableUsers: mockUsers,
    onClose: () => console.log("Modal closed"),
    onConfirm: (selectedUserIds: string[]) => console.log("Confirmed with users:", selectedUserIds),
  },
};

export const NoAvailableUsers: Story = {
  args: {
    open: true,
    targetGroups: [mockTargetGroups[0]],
    availableUsers: [],
    onClose: () => console.log("Modal closed"),
    onConfirm: (selectedUserIds: string[]) => console.log("Confirmed with users:", selectedUserIds),
  },
};