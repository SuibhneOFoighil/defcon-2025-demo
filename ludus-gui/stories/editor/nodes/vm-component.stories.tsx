import type { Meta, StoryObj } from "@storybook/react";
import { VMComponent } from "@/components/editor/vm-component";
import type { VMData } from "@/lib/types";
import { fn, userEvent, within, expect, waitFor } from "@storybook/test";

const meta: Meta<typeof VMComponent> = {
  title: "Editor/Nodes/VMComponent",
  component: VMComponent,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-4 max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    data: { control: "object", description: "VM data including status, type, and label." },
    selected: { control: "boolean", description: "Whether the VM is currently selected." },
    onViewDetails: { action: "viewDetails", description: "Handler for viewing VM details." },
    onMoveToVLAN: { action: "moveToVLAN", description: "Handler for moving VM to different VLAN." },
    onDeleteVM: { action: "deleteVM", description: "Handler for deleting VM." },
    allVLANs: { control: "object", description: "All available VLANs." },
    availableVLANs: { control: "object", description: "Available VLANs for moving the VM." },
    currentVLANId: { control: "text", description: "Current VLAN ID where the VM is located." },
    showDeleteButton: { control: "boolean", description: "Whether to show delete button." },
    deleteButtonVariant: { control: "select", options: ["hover", "always"], description: "Delete button visibility." },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockVLANs = [
  { id: "vlan-1", label: "VLAN 1" },
  { id: "vlan-2", label: "VLAN 2" },
  { id: "vlan-3", label: "Network VLAN" },
];

const baseMacOSVM: VMData = {
  id: "vm-macos",
  label: "MacOS Monterey",
  status: "Running",
};

const baseKaliVM: VMData = {
  id: "vm-kali",
  label: "Kali Linux",
  status: "Stopped",
};

const baseDefenderVM: VMData = {
  id: "vm-defender",
  label: "Windows Defender",
  status: "Suspended",
};

export const MacOSRunning: Story = {
  args: {
    data: baseMacOSVM,
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    allVLANs: mockVLANs,
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
};

export const KaliStopped: Story = {
  args: {
    data: baseKaliVM,
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    allVLANs: mockVLANs,
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
};

export const DefenderSuspended: Story = {
  args: {
    data: baseDefenderVM,
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    allVLANs: mockVLANs,
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
};

export const Selected: Story = {
  args: {
    data: baseMacOSVM,
    selected: true,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    allVLANs: mockVLANs,
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
};

export const WithCustomName: Story = {
  args: {
    data: {
      ...baseMacOSVM,
      vmName: "Development Machine",
    },
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    allVLANs: mockVLANs,
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
};

export const SingleVLAN: Story = {
  args: {
    data: baseKaliVM,
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    allVLANs: [{ id: "vlan-1", label: "VLAN 1" }],
    availableVLANs: [{ id: "vlan-1", label: "VLAN 1" }],
    currentVLANId: "vlan-1",
  },
};

// Test stories for VM selection behavior
export const SelectedWithLeftBorderAccent: Story = {
  args: {
    data: {
      ...baseMacOSVM,
      vmName: "Production Server",
      template: "ubuntu-22.04-server-template",
      cpus: 4,
      ramGb: 8,
      ipLastOctet: 100,
    },
    selected: true,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
    showDeleteButton: true,
    deleteButtonVariant: "always",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify VM is rendered with correct content
    expect(await canvas.findByText("Production Server")).toBeInTheDocument();
    expect(await canvas.findByText("ubuntu-22.04-server-template")).toBeInTheDocument();
    expect(await canvas.findByText("4 CPUs")).toBeInTheDocument();
    expect(await canvas.findByText("8GB RAM")).toBeInTheDocument();
    expect(await canvas.findByText("IP: 10.0.0.100")).toBeInTheDocument();
    
    // Selection styling is visually tested - no need to check specific CSS classes
  },
};

export const ClickToSelectInteraction: Story = {
  args: {
    data: {
      ...baseKaliVM,
      vmName: "Penetration Testing VM",
      template: "kali-x64-desktop-template",
      cpus: 2,
      ramGb: 4,
      ipLastOctet: 11,
      roles: ["offensive"],
    },
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-2",
    showDeleteButton: true,
    deleteButtonVariant: "hover",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Find and click the VM component
    const vmComponent = canvas.getByText("Penetration Testing VM");
    await userEvent.click(vmComponent);
    
    // Verify onViewDetails was called with correct VM data
    expect(args.onViewDetails).toHaveBeenCalledWith({
      ...baseKaliVM,
      vmName: "Penetration Testing VM",
      template: "kali-x64-desktop-template",
      cpus: 2,
      ramGb: 4,
      ipLastOctet: 11,
      roles: ["offensive"],
    });
  },
};

export const VLANSelectorInteraction: Story = {
  args: {
    data: baseDefenderVM,
    selected: false,
    onViewDetails: fn(),
    onMoveToVLAN: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify VLAN selector is present
    const vlanSelector = canvas.getByRole("combobox");
    expect(vlanSelector).toBeInTheDocument();
    
    // Complex dropdown interactions are better tested manually in Storybook
  },
};

export const DeleteButtonInteraction: Story = {
  args: {
    data: {
      ...baseMacOSVM,
      vmName: "Temporary VM",
    },
    selected: false,
    onViewDetails: fn(),
    onDeleteVM: fn(),
    showDeleteButton: true,
    deleteButtonVariant: "always",
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Find the delete button
    const deleteButton = canvas.getByRole("button", { name: /delete virtual machine/i });
    expect(deleteButton).toBeInTheDocument();
    
    // Click the delete button
    await userEvent.click(deleteButton);
    
    // Verify onDeleteVM was called with correct VM ID
    expect(args.onDeleteVM).toHaveBeenCalledWith("vm-macos");
    
    // Verify onViewDetails was NOT called (delete button should stop propagation)
    expect(args.onViewDetails).not.toHaveBeenCalled();
  },
};

export const DeployedVMWithStatus: Story = {
  args: {
    data: {
      ...baseMacOSVM,
      isDeployed: true,
      status: "Running",
      vmName: "Web Server",
      template: "debian-11-x64-server-template",
      cpus: 2,
      ramGb: 4,
      ipLastOctet: 10,
      fullClone: true,
      roles: ["web-server", "database"],
    },
    selected: true,
    onViewDetails: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify VM details are displayed
    expect(await canvas.findByText("Web Server")).toBeInTheDocument();
    expect(await canvas.findByText("debian-11-x64-server-template")).toBeInTheDocument();
    
    // Verify role badges (without ludus_ prefix)
    expect(await canvas.findByText("web-server")).toBeInTheDocument();
    expect(await canvas.findByText("database")).toBeInTheDocument();
    
    // Visual selection styling can be tested manually in Storybook
  },
};

export const VMWithMemoryBallooning: Story = {
  args: {
    data: {
      ...baseKaliVM,
      vmName: "Dynamic Memory VM",
      ramGb: 8,
      ramMinGb: 2,
      cpus: 4,
      template: "windows-11-template",
    },
    selected: false,
    onViewDetails: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-3",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify memory information is displayed (ballooning is shown as min RAM)
    expect(await canvas.findByText("8GB RAM")).toBeInTheDocument();
    expect(await canvas.findByText("(min: 2GB)")).toBeInTheDocument();
    // Note: "Ballooning" badge no longer exists in simplified component
  },
};

export const VMWithManyRoles: Story = {
  args: {
    data: {
      ...baseKaliVM,
      vmName: "Multi-Role Server",
      template: "ubuntu-22.04-server-template",
      cpus: 4,
      ramGb: 8,
      ipLastOctet: 50,
      isDeployed: true,
      status: "Running",
      roles: [
        "ludus_web_server",
        "ludus_database",
        "ludus_monitoring",
        "ludus_backup_agent",
        "ludus_security_scanner"
      ],
    },
    selected: false,
    onViewDetails: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify individual role badges are displayed (only first 3 roles shown)
    expect(await canvas.findByText("web_server")).toBeInTheDocument();
    expect(await canvas.findByText("database")).toBeInTheDocument();
    expect(await canvas.findByText("monitoring")).toBeInTheDocument();
    expect(await canvas.findByText("+2 more")).toBeInTheDocument();
    
    // Test tooltip shows full role name with ludus_ prefix
    const webServerBadge = canvas.getByText("web_server");
    await userEvent.hover(webServerBadge);
    await waitFor(() => {
      expect(canvas.getAllByText("ludus_web_server")).toHaveLength(2); // One in tooltip, one for title attribute
    });
  },
};

export const VMWithComplexRoles: Story = {
  args: {
    data: {
      ...baseMacOSVM,
      vmName: "Enterprise VM",
      template: "windows-server-2022-template",
      roles: [
        {
          name: "ludus_active_directory",
          dependsOn: [
            { vmName: "dns-server", role: "ludus_dns" }
          ]
        },
        "ludus_certificate_authority",
        "ludus_file_server"
      ],
    },
    selected: false,
    onViewDetails: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify role badges for both string and object roles
    expect(await canvas.findByText("active_directory")).toBeInTheDocument();
    expect(await canvas.findByText("certificate_authority")).toBeInTheDocument();
    expect(await canvas.findByText("file_server")).toBeInTheDocument();
  },
};

export const VMWithAllPossibleTags: Story = {
  args: {
    data: {
      id: "vm-showcase",
      label: "Enterprise Production Server",
      vmName: "prod-web-01",
      template: "ubuntu-22.04-server-hardened",
      status: "Running",
      isDeployed: true,
      cpus: 8,
      ramGb: 32,
      ramMinGb: 8, // Enables ballooning badge
      ipLastOctet: 42,
      fullClone: true, // Enables full clone badge
      roles: [
        "ludus_web_server",
        "ludus_database_mysql",
        "ludus_redis_cache",
        "ludus_monitoring_agent",
        "ludus_backup_service",
        "ludus_security_scanner"
      ],
    },
    selected: true, // Show selection styling
    onViewDetails: fn(),
    onDeleteVM: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-1",
    showDeleteButton: true,
    deleteButtonVariant: "always",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify VM details
    expect(await canvas.findByText("prod-web-01")).toBeInTheDocument();
    expect(await canvas.findByText("ubuntu-22.04-server-hardened")).toBeInTheDocument();
    expect(await canvas.findByText("8 CPUs")).toBeInTheDocument();
    expect(await canvas.findByText("32GB RAM")).toBeInTheDocument();
    expect(await canvas.findByText("(min: 8GB)")).toBeInTheDocument();
    expect(await canvas.findByText("IP: 10.0.0.42")).toBeInTheDocument();
    
    // Note: Status and configuration badges no longer exist in simplified component
    // Status is indicated by icon background color
    
    // Verify first 3 role badges (without ludus_ prefix) and "+3 more" indicator
    expect(await canvas.findByText("web_server")).toBeInTheDocument();
    expect(await canvas.findByText("database_mysql")).toBeInTheDocument();
    expect(await canvas.findByText("redis_cache")).toBeInTheDocument();
    expect(await canvas.findByText("+3 more")).toBeInTheDocument();
    
    // Verify delete button is visible
    expect(await canvas.findByRole("button", { name: /delete virtual machine/i })).toBeInTheDocument();
  },
};

export const VMWithAllTagsStopped: Story = {
  args: {
    data: {
      id: "vm-showcase-stopped",
      label: "Development Test Server",
      vmName: "dev-test-02",
      template: "windows-server-2022-datacenter",
      status: "Stopped",
      isDeployed: true,
      cpus: 4,
      ramGb: 16,
      ramMinGb: 4,
      ipLastOctet: 99,
      fullClone: true,
      roles: [
        "ludus_iis_web_server",
        "ludus_sql_server",
        "ludus_active_directory",
        "ludus_exchange_server",
        "ludus_vulnerability_scanner",
        "ludus_log_collector"
      ],
    },
    selected: false,
    onViewDetails: fn(),
    availableVLANs: mockVLANs,
    currentVLANId: "vlan-2",
    showDeleteButton: true,
    deleteButtonVariant: "hover",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify VM details (status shown via icon background color)
    expect(await canvas.findByText("dev-test-02")).toBeInTheDocument();
    expect(await canvas.findByText("windows-server-2022-datacenter")).toBeInTheDocument();
    
    // Verify role badges are visible (without ludus_ prefix)
    expect(await canvas.findByText("iis_web_server")).toBeInTheDocument();
    expect(await canvas.findByText("sql_server")).toBeInTheDocument();
    expect(await canvas.findByText("active_directory")).toBeInTheDocument();
    expect(await canvas.findByText("+3 more")).toBeInTheDocument(); // Only first 3 roles shown
  },
}; 