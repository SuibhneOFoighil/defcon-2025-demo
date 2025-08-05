import type { Meta, StoryObj } from "@storybook/react";
import HomePage from "@/app/page";
import { handlers, emptyStateHandlers, errorStateHandlers } from "@/lib/mocks/handlers";

const meta: Meta<typeof HomePage> = {
  title: "Dashboard/HomePage",
  component: HomePage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers,
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: emptyStateHandlers,
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: errorStateHandlers,
    },
  },
}; 