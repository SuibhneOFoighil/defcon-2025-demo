import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CreateGroupModal } from "@/components/admin/modals/create-group-modal";

const meta: Meta<typeof CreateGroupModal> = {
  title: "Admin/Modals/CreateGroupModal",
  component: CreateGroupModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    open: { control: false },
    onOpenChange: { action: "onOpenChange" },
  },
};
export default meta;

export const Default: StoryObj<typeof CreateGroupModal> = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <CreateGroupModal
        {...args}
        open={open}
        onOpenChange={() => {
          setOpen(prev => !prev);
          args.onOpenChange?.();
        }}
      />
    );
  },
  args: {
  }
}; 