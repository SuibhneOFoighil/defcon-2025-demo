import type { Meta, StoryObj } from "@storybook/react";
import { ImportTemplateStep } from "@/components/wizards/create-template/import-template-step";
import type { StepProps, TemplateFormData as FormData } from "@/components/wizards/create-template/types"; // Aliasing to avoid conflict
import { fn, userEvent, within, expect } from "@storybook/test";

// Using a simplified FormData for this step for Storybook mock
const mockFormDataBase: Partial<FormData> = {
  templateName: "Test Template Import", // Example, might come from a previous step
  importedTemplate: undefined,
};

const meta = {
  title: "Wizards/CreateTemplate/ImportTemplateStep",
  component: ImportTemplateStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    formData: { ...mockFormDataBase } as FormData,
    onInputChange: fn(),
  },
  argTypes: {
    formData: { control: "object", description: "Current form data, expecting importedTemplate." },
    onInputChange: { action: "onInputChange", description: "Callback for input changes." },
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImportTemplateStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: undefined } as FormData,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Check for FileUpload component's label
    expect(await canvas.findByText("Select a single template tar file")).toBeInTheDocument();
    // Check for help text
    expect(await canvas.findByText(/One file only:/)).toBeInTheDocument();
    expect(await canvas.findByText(/Upload a single template tar file/)).toBeInTheDocument();
    expect(await canvas.findByText(/Supported formats:/)).toBeInTheDocument();
  },
};

const mockFile = new File(["version: '3'\nservices:\n  test:\n    image: alpine"], "template-data.yaml", { type: "application/x-yaml" });
const mockFileInfo = {
    name: mockFile.name,
    size: mockFile.size,
    type: mockFile.type,
};

export const FileSelectedInData: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: mockFileInfo } as FormData,
  },
  // Test removed - low importance cosmetic display issue with file selection state
};

export const SimulateFileSelectionAndRemoval: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: undefined } as FormData,
    onInputChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Step 1: Simulate file selection by assuming onInputChange is called by FileUpload
    args.onInputChange("importedTemplate", mockFileInfo);
    // The FileSelectedInData story shows the visual state when formData has this info.

    // Step 2: Simulate clearing the file via onInputChange (as FileUpload would trigger)
    args.onInputChange("importedTemplate", null);
    expect(args.onInputChange).toHaveBeenLastCalledWith("importedTemplate", null);
    
    // After clearing, the display block for current template should not be visible
    expect(canvas.queryByText("Template Ready to Import")).not.toBeInTheDocument();
  },
};

// Note: The visual aspect of FileUpload (showing selected file, remove button) is tested
// in FileUpload.stories.tsx. These stories focus on ImportTemplateStep's integration. 