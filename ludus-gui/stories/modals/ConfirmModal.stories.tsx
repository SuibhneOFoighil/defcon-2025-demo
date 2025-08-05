import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DeleteGroupModal } from "@/components/admin/modals/delete-group-modal";
import { DeleteUserModal } from "@/components/admin/modals/delete-user-modal";
import { LogoutModal } from "@/components/auth/logout-modal";
import { DeleteFirewallRuleDialog } from "@/components/wizards/create-range/delete-firewall-rule-dialog";

const meta: Meta = {
  title: "UI/Modal/ConfirmModal",
};
export default meta;

export const DeleteGroup: StoryObj = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    const mockGroup = {
      id: "group-1",
      name: "Admins",
      description: "Administrator group",
      dateCreated: new Date().toISOString()
    };
    return (
      <DeleteGroupModal
        isOpen={open}
        onClose={() => setOpen(false)}
        group={mockGroup}
        onSuccess={() => {
          alert("Group deleted!");
          setOpen(false);
        }}
        {...args}
      />
    );
  },
};

export const DeleteUser: StoryObj = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <DeleteUserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          alert("User deleted!");
          setOpen(false);
        }}
        userName="John Doe"
        {...args}
      />
    );
  },
};

export const Logout: StoryObj = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <LogoutModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          alert("Logged out!");
          setOpen(false);
        }}
        {...args}
      />
    );
  },
};

export const DeleteFirewallRule: StoryObj = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <DeleteFirewallRuleDialog
        open={open}
        onOpenChange={() => setOpen(false)}
        onConfirm={() => {
          alert("Rule deleted!");
          setOpen(false);
        }}
        ruleName="Allow SSH"
        {...args}
      />
    );
  },
}; 