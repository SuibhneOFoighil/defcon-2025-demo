import type { Meta, StoryObj } from "@storybook/react";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import type { User } from "@/lib/types";

const meta: Meta<typeof ProfileSettingsForm> = {
  title: "Settings/ProfileSettingsForm",
  component: ProfileSettingsForm,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-2xl mx-auto p-4">
          <Story />
        </div>
        <Toaster />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen", // or padded, depending on how it should look
  },
  tags: ["autodocs"],
  argTypes: {
    user: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUser: User = {
  id: "user_storybook_123",
  name: "Storybook User",
  email: "storybook.user@example.com",
  role: "admin",
};

export const Default: Story = {
  args: {
    user: sampleUser,
  },
};

export const WithNullUser: Story = {
  args: {
    user: null, // To test default values in the form
  },
}; 