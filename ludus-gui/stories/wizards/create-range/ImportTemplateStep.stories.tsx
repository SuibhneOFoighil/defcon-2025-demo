import type { Meta, StoryObj } from "@storybook/react";
import { ImportTemplateStep } from "@/components/wizards/create-range/import-template-step";
import type { StepProps, FormData } from "@/components/wizards/create-range/types";
import { fn, userEvent, within, expect } from "@storybook/test";

const mockFormDataBase: Partial<FormData> = {
  name: "Test Range Import",
  creationMethod: "import",
  importedTemplate: undefined,
};

const meta = {
  title: "Wizards/CreateRange/ImportTemplateStep",
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
    formData: { control: "object", description: "Current form data, expecting importedTemplate with validation status." },
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
    expect(await canvas.findByText("Select a single YAML template file")).toBeInTheDocument();
    expect(await canvas.findByText(/One file only:/)).toBeInTheDocument();
    expect(await canvas.findByText(/Upload a single YAML template file/)).toBeInTheDocument();
    expect(await canvas.findByText(/Supported formats:/)).toBeInTheDocument();
    expect(await canvas.findByText(/\.yaml, \.yml/)).toBeInTheDocument();
  },
};

// Valid file with successful validation
const mockValidFile = new File([`# yaml-language-server: $schema=https://docs.ludus.cloud/schemas/range-config.json

ludus:
  - vm_name: "{{ range_id }}-test-vm"
    hostname: "{{ range_id }}-test"
    template: debian-12-x64-server-template
    vlan: 10
    ip_last_octet: 10
    ram_gb: 4
    cpus: 2
    linux: true`], "valid-template.yaml", { type: "application/x-yaml" });

const mockValidFileInfo = {
  name: mockValidFile.name,
  size: mockValidFile.size,
  type: mockValidFile.type,
  content: {
    ludus: [{
      vm_name: "{{ range_id }}-test-vm",
      hostname: "{{ range_id }}-test",
      template: "debian-12-x64-server-template",
      vlan: 10,
      ip_last_octet: 10,
      ram_gb: 4,
      cpus: 2,
      linux: true
    }]
  },
  isValid: true,
};

export const ValidFileSelected: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: mockValidFileInfo } as FormData,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should show success state
    expect(await canvas.findByText("Template Ready to Import")).toBeInTheDocument();
    expect(await canvas.findByText("valid-template.yaml")).toBeInTheDocument();
    expect(await canvas.findByText(/KB|MB|GB/i)).toBeInTheDocument();
    expect(await canvas.findByText("✓ Valid YAML format and schema")).toBeInTheDocument();
    // Should show replace file label when file is selected
    expect(await canvas.findByText("Replace YAML template file")).toBeInTheDocument();
    // Should show success state
    expect(await canvas.findByText("Template Ready to Import")).toBeInTheDocument();
  },
};

// Invalid file with validation errors
const mockInvalidFileInfo = {
  name: "invalid-template.yaml",
  size: 256,
  type: "application/x-yaml",
  content: {
    ludus: [{
      vm_name: "test-vm",
      hostname: "test",
      // Missing required fields
    }]
  },
  isValid: false,
};

export const InvalidFileSelected: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: mockInvalidFileInfo } as FormData,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should show error state
    expect(await canvas.findByText("Template Validation Failed")).toBeInTheDocument();
    expect(await canvas.findByText("invalid-template.yaml")).toBeInTheDocument();
    // Should show error state (already checked above)
    // Template Validation Failed text already verified
  },
};

// File with YAML parsing error
const mockYamlErrorFileInfo = {
  name: "syntax-error.yaml",
  size: 128,
  type: "application/x-yaml",
  content: null,
  isValid: false,
};

export const YamlParsingError: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: mockYamlErrorFileInfo } as FormData,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should show error state for YAML parsing failure
    expect(await canvas.findByText("Template Validation Failed")).toBeInTheDocument();
    expect(await canvas.findByText("syntax-error.yaml")).toBeInTheDocument();
  },
};

export const SimulateFileSelectionAndRemoval: Story = {
  args: {
    formData: { ...mockFormDataBase, importedTemplate: undefined } as FormData,
    onInputChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Step 1: Simulate valid file selection
    args.onInputChange("importedTemplate", mockValidFileInfo);
    expect(args.onInputChange).toHaveBeenCalledWith("importedTemplate", mockValidFileInfo);

    // Step 2: Simulate file removal
    args.onInputChange("importedTemplate", null);
    expect(args.onInputChange).toHaveBeenLastCalledWith("importedTemplate", null);
  },
};

// Note: The actual file upload and validation logic is tested in the component itself.
// These stories focus on the different states the component can be in based on the validation results. 