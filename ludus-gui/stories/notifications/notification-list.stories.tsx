import type { Meta, StoryObj } from "@storybook/react";
import { NotificationList } from "@/components/notifications/notification-list";
import type { Notification } from "@/lib/types";

const meta: Meta<typeof NotificationList> = {
  title: "Notifications/NotificationList",
  component: NotificationList,
  tags: ["autodocs"],
  argTypes: {
    notifications: { control: "object", description: "Array of notification objects." },
    onMarkAsRead: { action: "markedAsRead", description: "Callback when a notification is marked as read." },
  },
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "System Update Available",
    message: "A new system update is available for download.",
    createdAt: Date.now(),
    read: false,
    userId: "1",
  },
  {
    id: "2",
    title: "Security Alert",
    message: "Unusual login activity detected on your account.",
    createdAt: Date.now() - 1000 * 60 * 60,
    read: true,
    userId: "1",
  },
  {
    id: "3",
    title: "Deployment Successful",
    message: "Your new range 'Alpha-7' has been deployed successfully.",
    createdAt: Date.now() - 1000 * 60 * 120,
    read: false,
    userId: "1",
  },
];

const mockNotificationsWithLongMessages: Notification[] = [
  {
    id: "4",
    title: "Range Deployment Failed",
    message: "Range deployment failed with status: ERROR. The following error occurred during the deployment process: Failed to provision VM 'web-server-01' due to insufficient resources on the host. The hypervisor reported that there is not enough memory available to allocate the requested 8GB RAM for this virtual machine. Please check your resource allocation and try again. Additional details: Host memory usage is currently at 95%, with only 2GB available. You may need to power off other VMs or upgrade your hardware configuration.",
    createdAt: Date.now() - 1000 * 60 * 5,
    read: false,
    userId: "1",
  },
  {
    id: "5",
    title: "Testing Mode Start Failed",
    message: "Testing mode could not be started for range 'Beta-3'.\n\nError details:\n- Network interface configuration failed\n- Firewall rules could not be applied\n- DNS settings are conflicting with existing configuration\n\nPlease review your network configuration and ensure there are no conflicts with other active ranges. You may need to modify your VLAN settings or resolve IP address conflicts before attempting to start testing mode again.",
    createdAt: Date.now() - 1000 * 60 * 10,
    read: false,
    userId: "1",
  },
  {
    id: "6",
    title: "System Maintenance Notice",
    message: "This is a regular notification with normal length content.",
    createdAt: Date.now() - 1000 * 60 * 15,
    read: true,
    userId: "1",
  },
];

export const Default: Story = {
  args: {
    notifications: mockNotifications,
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
  },
};

export const WithLongMessages: Story = {
  args: {
    notifications: mockNotificationsWithLongMessages,
  },
}; 