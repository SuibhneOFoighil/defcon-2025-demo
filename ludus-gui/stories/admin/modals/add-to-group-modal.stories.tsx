import type { Meta, StoryObj } from "@storybook/react";
import { AddToGroupModal } from "@/components/admin/modals/add-to-group-modal";
import { Button } from "@/components/ui/button"; // For a button to open the modal in a controlled way if needed
import React from "react";
import { Toaster } from "sonner";

// Define ModalGroup type locally if not exported from component or shared types
interface ModalGroup {
  id: string;
  name: string;
}

const mockAvailableGroups: ModalGroup[] = Array.from({ length: 8 }, (_, i) => ({
  id: `g-${i + 1}`,
  name: `Awesome Group ${i + 1}`,
}));

const mockSelectedUserIds = ["user-1", "user-2"];

const meta: Meta<typeof AddToGroupModal> = {
  title: "Admin/Modals/AddToGroupModal",
  component: AddToGroupModal,
  decorators: [
    (Story) => (
      <>
        <Toaster />
        {/* This div is for portal rendering if modals use it, check your Modal implementation */}
        <div id="story-book-modals">
          <Story />
        </div>
      </>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed" },
    selectedUsers: { control: "object" },
    availableGroups: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof AddToGroupModal>;

export const Default: Story = {
  args: {
    open: true, // Modal is open by default in story
    selectedUsers: mockSelectedUserIds,
    availableGroups: mockAvailableGroups,
    onClose: () => console.log("AddToGroupModal: onClose triggered"),
    onConfirm: (selectedGroupIds) => console.log("AddToGroupModal: onConfirm triggered with", selectedGroupIds),
  },
};

export const SingleUserSelected: Story = {
  args: {
    ...Default.args,
    selectedUsers: ["user-single"],
  },
};

export const NoAvailableGroups: Story = {
  args: {
    ...Default.args,
    availableGroups: [],
  },
};

export const FewAvailableGroups: Story = {
  args: {
    ...Default.args,
    availableGroups: mockAvailableGroups.slice(0, 3),
  },
};

// Example of how to control modal open state with a button in a story
// This is more for testing the open/close mechanism via props from a parent
export const ControlledByButton: Story = {
  args: {
    // open is false by default, controlled by story's render
    selectedUsers: mockSelectedUserIds,
    availableGroups: mockAvailableGroups,
    onClose: () => console.log("AddToGroupModal: onClose triggered"),
    onConfirm: (selectedGroupIds) => console.log("AddToGroupModal: onConfirm triggered with", selectedGroupIds),
  },
  render: function Render(args) {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Add To Group Modal</Button>
        <AddToGroupModal {...args} open={isOpen} onClose={() => { args.onClose(); setIsOpen(false); }} />
      </>
    );
  },
}; 