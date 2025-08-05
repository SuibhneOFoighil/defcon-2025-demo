import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ResetPasswordModal } from "@/components/admin/modals/reset-password-modal";
import { fn } from "@storybook/test"; // For mocking actions

const meta: Meta<typeof ResetPasswordModal> = {
  title: "Admin/Modals/ResetPasswordModal", // Updated title
  component: ResetPasswordModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isOpen: { control: false }, // Controlled by story's internal state
    onClose: { action: "onClose" },
    onConfirm: { action: "onConfirm" },
    userName: { control: "text" },
  },
};
export default meta;

export const Default: StoryObj<typeof ResetPasswordModal> = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(true);
    return (
      <ResetPasswordModal
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
    userName: "Jane Doe",
    onConfirm: fn(() => {
      console.log("Password reset confirmed for Jane Doe");
      // The actual component calls onClose itself after onConfirm.
    }),
    onClose: fn(),
  },
}; 