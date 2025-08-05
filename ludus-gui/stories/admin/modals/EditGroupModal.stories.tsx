import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { EditGroupModal } from "@/components/admin/modals/edit-group-modal";
import { fn } from "@storybook/test"; // For mocking actions

const meta: Meta<typeof EditGroupModal> = {
  title: "Admin/Modals/EditGroupModal", // Updated title
  component: EditGroupModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isOpen: { control: false }, // Controlled by story's internal state
    onClose: { action: "onClose" },
    onConfirm: { action: "onConfirm" },
    groupName: { control: "text" },
    groupDescription: { control: "text" },
  },
};
export default meta;

export const Default: StoryObj<typeof EditGroupModal> = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(true);
    return (
      <EditGroupModal
        {...args}
        isOpen={open} // Prop name is isOpen in the component
        onClose={() => {
          setOpen(false);
          args.onClose?.(); // Call Storybook action
        }}
      />
    );
  },
  args: {
    // Default args for the modal
    groupName: "Developers",
    groupDescription: "Software development team responsible for core product features.",
    onConfirm: fn((name, description) => {
      console.log("Confirmed Edit:", name, description);
      // Simulate closing the modal on confirm for story purposes if needed
      // Note: The actual component calls onClose itself after onConfirm.
    }),
    onClose: fn(),
  },
}; 