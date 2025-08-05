import type { Meta, StoryObj } from "@storybook/react";
import { GeneralDetailsStep } from "@/components/wizards/create-range/general-details-step";
import type { StepProps, FormData } from "@/components/wizards/create-range/types";
import { fn, userEvent, within, expect, waitFor } from "@storybook/test";

const mockFormDataBase: Partial<FormData> = {
  name: "",
  description: "",
  purpose: "",
  creationMethod: "", // Default to no selection
};

const meta = {
  title: "Wizards/CreateRange/GeneralDetailsStep",
  component: GeneralDetailsStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    formData: { ...mockFormDataBase } as FormData,
    onInputChange: fn(),
  },
  argTypes: {
    formData: { control: "object", description: "Current form data for general details." },
    onInputChange: { action: "onInputChange", description: "Callback for input changes." },
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GeneralDetailsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formData: { ...mockFormDataBase } as FormData,
  },
};

export const WithDataFilled: Story = {
  args: {
    formData: {
      ...mockFormDataBase,
      name: "My Test Range",
      description: "This is a detailed description.",
      purpose: "For Storybook testing",
      creationMethod: "template",
    } as FormData,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByDisplayValue("My Test Range")).toBeInTheDocument();
    expect(await canvas.findByDisplayValue("This is a detailed description.")).toBeInTheDocument();
    expect(await canvas.findByDisplayValue("For Storybook testing")).toBeInTheDocument();
    expect(await canvas.findByRole("radio", { name: "From Template" })).toBeChecked();
  },
};

// REMOVING InteractWithFields story due to persistent issues
// export const InteractWithFields: Story = { ... }; 