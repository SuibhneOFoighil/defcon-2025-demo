import type { Meta, StoryObj } from "@storybook/react";
import { SecuritySettingsForm } from "@/components/settings/security-settings-form";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";

const meta: Meta<typeof SecuritySettingsForm> = {
  title: "Settings/SecuritySettingsForm",
  component: SecuritySettingsForm,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-md mx-auto p-4">
          <Story />
        </div>
        <Toaster />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen", // or padded
  },
  tags: ["autodocs"],
  // No specific args for this component, it manages its own state
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 