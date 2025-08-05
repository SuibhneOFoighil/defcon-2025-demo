import type { Meta, StoryObj } from "@storybook/react";
import { VlanNode } from "@/components/editor/nodes/vlan-node";
import { ReactFlowProvider } from "@xyflow/react";
import { RangeEditorProvider } from "@/contexts/range-editor-context";
import type { VMData, Template } from "@/lib/types";
import { fn } from "@storybook/test";
import { expect, userEvent, within } from "@storybook/test";

const meta: Meta<typeof VlanNode> = {
  title: "Editor/Nodes/VlanNode",
  component: VlanNode,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <RangeEditorProvider
          initialNodes={[]}
          initialEdges={[]}
          templates={mockTemplates}
          projectMetadata={mockProjectMetadata}
          rangeStats={mockRangeStats}
        >
          <div className="p-4 bg-[hsl(var(--topology-background))]">
            <Story />
          </div>
        </RangeEditorProvider>
      </ReactFlowProvider>
    ),
  ],
  argTypes: {
    id: { control: "text", description: "Unique identifier for the VLAN node." },
    data: { control: "object", description: "Node data containing VMs and handlers." },
    isConnectable: { control: "boolean", description: "Whether the node can be connected to other nodes." },
    selected: { control: "boolean", description: "Whether the node is currently selected." },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockVMs: VMData[] = [
  {
    id: "vm-1",
    label: "MacOS Monterey",
    status: "Running",
    macOS: true,
  },
  {
    id: "vm-2", 
    label: "Kali Linux",
    status: "Stopped",
    linux: true,
  },
  {
    id: "vm-3",
    label: "Windows Defender",
    status: "Suspended",
    windows: true,
  },
];

const mockTemplates: Template[] = [
  {
    name: "MacOS Monterey",
    built: true,
  },
];

const mockProjectMetadata = {
  id: "project-1",
  name: "Test Project",
  status: "Running",
};

const mockRangeStats = {
  cpus: 8,
  ram: 16,
  disk: 500,
  vlans: [
    { name: "VLAN 1", description: "Main VLAN" },
    { name: "Network VLAN", description: "Network services" },
  ],
};

export const Default: Story = {
  args: {
    id: "vlan-1",
    data: {
      label: "VLAN 1",
      vms: mockVMs,
      onEdit: fn(),
      onToggleAllVMs: fn(),
      onUpdateVMStatus: fn(),
      onViewVMDetails: fn(),
      onMoveVMToVLAN: fn(),
      onUpdateVMName: fn(),
    },
    isConnectable: true,
    selected: false,
  },
};

export const Selected: Story = {
  args: {
    ...Default.args,
    selected: true,
  },
};

export const DropTarget: Story = {
  args: {
    ...Default.args,
    data: {
      ...Default.args!.data,
      isDropTarget: true,
    },
  },
};

export const EmptyVLAN: Story = {
  args: {
    id: "vlan-empty",
    data: {
      label: "Empty VLAN",
      vms: [],
      onEdit: fn(),
      onToggleAllVMs: fn(),
      onUpdateVMStatus: fn(),
      onViewVMDetails: fn(),
      onMoveVMToVLAN: fn(),
      onUpdateVMName: fn(),
    },
    isConnectable: true,
    selected: false,
  },
};

export const EmptyVLANDropTarget: Story = {
  args: {
    id: "vlan-drop-target",
    data: {
      label: "Drop Target VLAN",
      vms: [],
      isDropTarget: true,
      onEdit: fn(),
      onToggleAllVMs: fn(),
      onUpdateVMStatus: fn(),
      onViewVMDetails: fn(),
      onMoveVMToVLAN: fn(),
      onUpdateVMName: fn(),
    },
    isConnectable: true,
    selected: false,
  },
};

export const NetworkVLAN: Story = {
  args: {
    id: "vlan-network",
    data: {
      label: "Network VLAN",
      vms: mockVMs.slice(0, 2),
      onEdit: fn(),
      onToggleAllVMs: fn(),
      onUpdateVMStatus: fn(),
      onViewVMDetails: fn(),
      onMoveVMToVLAN: fn(),
      onUpdateVMName: fn(),
    },
    isConnectable: true,
    selected: false,
  },
};

export const VMClickBehavior: Story = {
  args: {
    id: "vlan-test-click",
    data: {
      label: "Test VLAN - Click VM",
      vms: mockVMs,
      onEdit: fn(),
      onToggleAllVMs: fn(),
      onUpdateVMStatus: fn(),
      onViewVMDetails: fn(),
      onMoveVMToVLAN: fn(),
      onUpdateVMName: fn(),
    },
    isConnectable: true,
    selected: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Find the first VM in the VLAN (MacOS Monterey)
    const vmElement = canvas.getByText("MacOS Monterey");
    
    // Click on the VM
    await userEvent.click(vmElement);
    
    // Verify that onViewVMDetails was called with the correct VM data
    await expect(args.data.onViewVMDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "vm-1",
        label: "MacOS Monterey",
        status: "Running",
        macOS: true,
      }),
      "vlan-test-click",
      "Test VLAN - Click VM"
    );
    
    // Verify it was called exactly once (single-click behavior)
    await expect(args.data.onViewVMDetails).toHaveBeenCalledTimes(1);
  },
}; 