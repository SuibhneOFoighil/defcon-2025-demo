import type { Meta, StoryObj } from "@storybook/react";
import { NetworkDetailsStep } from "@/components/wizards/create-range/network-details-step";
import type { StepProps, FormData } from "@/components/wizards/create-range/types";
import { fn, userEvent, within, expect } from "@storybook/test";

const mockFormDataBase: Partial<FormData> = {
  name: "Test Range Network",
  creationMethod: "scratch",
  numberOfVLANs: 0,
  sameVMsPerVLAN: true,
  vmsPerVLAN: 0,
  vlanVMs: {},
};

const meta = {
  title: "Wizards/CreateRange/NetworkDetailsStep",
  component: NetworkDetailsStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    formData: { ...mockFormDataBase } as FormData, // Cast as full FormData for the story
    onInputChange: fn(),
  },
  argTypes: {
    formData: { control: "object", description: "Current form data for network details." },
    onInputChange: { action: "onInputChange", description: "Callback for input changes." },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NetworkDetailsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formData: { ...mockFormDataBase, numberOfVLANs: 0 } as FormData,
  },
};

export const WithVLANsNoIndividualConfig: Story = {
  args: {
    formData: {
      ...mockFormDataBase,
      numberOfVLANs: 3,
      sameVMsPerVLAN: true,
      vmsPerVLAN: 2,
    } as FormData,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByLabelText("Number of VLANs")).toHaveValue("3");
    expect(await canvas.findByLabelText("Same number of VMs in each VLAN")).toBeChecked();
    expect(await canvas.findByLabelText("Number of VMs under each VLAN")).toHaveValue("2");
  },
};

export const WithVLANsIndividualConfig: Story = {
  args: {
    formData: {
      ...mockFormDataBase,
      numberOfVLANs: 2,
      sameVMsPerVLAN: false, // Important for this story
      vlanVMs: { 1: 3, 2: 1 },
    } as FormData,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByLabelText("Number of VLANs")).toHaveValue("2");
    const sameVmsCheckbox = await canvas.findByLabelText("Same number of VMs in each VLAN");
    expect(sameVmsCheckbox).not.toBeChecked();

    expect(await canvas.findByLabelText("Number of VMs in VLAN 1")).toHaveValue("3");
    expect(await canvas.findByLabelText("Number of VMs in VLAN 2")).toHaveValue("1");

    // Interact with a VLAN VM count
    const vlan1Input = await canvas.findByLabelText("Number of VMs in VLAN 1");
    await userEvent.selectOptions(vlan1Input, "4");
    expect(args.onInputChange).toHaveBeenCalledWith("vlanVMs", { 1: 4, 2: 1 });
  },
};

export const ChangeVLANCount: Story = {
  args: {
    formData: { ...mockFormDataBase, numberOfVLANs: 0 } as FormData,
    onInputChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const vlanCountSelect = await canvas.findByLabelText("Number of VLANs");
    await userEvent.selectOptions(vlanCountSelect, "2");
    expect(args.onInputChange).toHaveBeenCalledWith("numberOfVLANs", 2);
    // Check if new elements appear for VM configuration
    expect(await canvas.findByLabelText("Same number of VMs in each VLAN")).toBeInTheDocument();
  },
}; 