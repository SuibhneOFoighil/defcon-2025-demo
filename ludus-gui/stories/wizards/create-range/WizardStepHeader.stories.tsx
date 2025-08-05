import type { Meta, StoryObj } from "@storybook/react";
import { WizardStepHeader } from "@/components/wizards/create-range/wizard-step-header";
import { fn, userEvent, within, expect } from "@storybook/test";
import { Button as UiButton } from "@/components/ui/button"; // Alias to avoid conflict if story name is Button
import { Plus } from "lucide-react";

const meta = {
  title: "Wizards/CreateRange/WizardStepHeader",
  component: WizardStepHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    title: "Step Title",
    showSkip: false,
    onSkip: fn(),
    children: null,
  },
  argTypes: {
    title: { control: "text", description: "The title of the wizard step." },
    showSkip: { control: "boolean", description: "Whether to show the skip button." },
    onSkip: { action: "onSkipClicked", description: "Callback when skip button is clicked." },
    children: { control: "object", description: "Optional action elements, like an Add button." },
    className: { control: false, description: "Optional CSS class for custom styling." },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-4 bg-background border border-border rounded">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WizardStepHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Network Configuration",
  },
};

export const WithSkipButton: Story = {
  args: {
    title: "Firewall Rules",
    showSkip: true,
    onSkip: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const skipButton = await canvas.findByRole("button", { name: "Skip" });
    expect(skipButton).toBeInTheDocument();
    await userEvent.click(skipButton);
    expect(args.onSkip).toHaveBeenCalledTimes(1);
  },
};

export const WithActionChildren: Story = {
  args: {
    title: "Add Items to List",
    showSkip: true,
    onSkip: fn(),
    children: (
      <UiButton variant="default" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </UiButton>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByRole("button", { name: "Skip" })).toBeInTheDocument();
    expect(await canvas.findByRole("button", { name: /Add Item/i })).toBeInTheDocument();
  },
};

export const LongTitle: Story = {
  args: {
    title: "This is a Very Long Wizard Step Title to Check How It Wraps or Truncates within the Layout",
    showSkip: true,
    children: (
      <UiButton variant="outline" size="sm">
        Action
      </UiButton>
    ),
  },
}; 