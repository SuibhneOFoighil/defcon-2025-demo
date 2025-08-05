import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SharePasswordModal } from "@/components/admin/modals/share-password-modal";
import { fn } from "@storybook/test";

const meta: Meta<typeof SharePasswordModal> = {
  title: "Admin/Modals/SharePasswordModal", // New Title
  component: SharePasswordModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isOpen: { control: false },
    onClose: { action: "onClose" },
    onConfirm: { action: "onConfirm" },
    userName: { control: "text" },
  },
};
export default meta;

export const Default: StoryObj<typeof SharePasswordModal> = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(true);
    return (
      <SharePasswordModal
        {...args}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          args.onClose?.();
        }}
        // onConfirm will be passed from args
      />
    );
  },
  args: {
    userName: "John Doe",
    onConfirm: fn(() => {
      console.log("Share password confirmed for John Doe");
      // Actual component calls onClose after onConfirm
    }),
    onClose: fn(),
  },
}; 