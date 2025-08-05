import type { Meta, StoryObj } from "@storybook/react";
import { FirewallRulesStep } from "@/components/wizards/create-range/firewall-rules-step";
import type { StepProps, FormData, FirewallRule } from "@/components/wizards/create-range/types";
import { fn, userEvent, within, expect } from "@storybook/test";
import { Button } from "@/components/ui/button"; // For potential custom skip handler in story

const mockFormData: FormData = {
  name: "Test Range",
  description: "A test range for firewall rules.",
  purpose: "testing",
  creationMethod: "scratch",
  firewallRules: JSON.stringify([
    {
      id: "rule-001",
      name: "Allow HTTPS out",
      sourceVLAN: "10",
      sourceIP: "any",
      destinationVLAN: "external",
      destinationIP: "any",
      protocol: "TCP",
      ports: "443",
      action: "accept",
    },
    {
      id: "rule-002",
      name: "Block Internal FTP",
      sourceVLAN: "10",
      sourceIP: "any",
      destinationVLAN: "20",
      destinationIP: "any",
      protocol: "TCP",
      ports: "21",
      action: "reject",
    },
    {
      id: "rule-003",
      name: "Drop other internal",
      sourceVLAN: "10",
      sourceIP: "any",
      destinationVLAN: "20",
      destinationIP: "any",
      protocol: "ANY",
      ports: "any",
      action: "drop", // Assuming 'drop' maps to warning/accent
    },
  ]),
};

const meta = {
  title: "Wizards/CreateRange/FirewallRulesStep",
  component: FirewallRulesStep,
  parameters: {
    layout: "padded", // Or 'fullscreen' if the step content is large
  },
  tags: ["autodocs"],
  args: {
    formData: mockFormData,
    onInputChange: fn(),
    // For WizardStepHeader's onSkip, if we want to test it specifically
    // onSkip: fn(), 
  },
  argTypes: {
    formData: { control: "object", description: "Current form data including firewall rules." },
    onInputChange: { action: "onInputChange", description: "Callback for input changes." },
  },
  decorators: [
    (Story, { args }) => (
      <div className="max-w-3xl mx-auto">
         {/* Mocking WizardStepHeader children prop for stories if needed for Add Rule button */}
        <Story args={{...args}} />
      </div>
    ),
  ],
} satisfies Meta<typeof FirewallRulesStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formData: { ...mockFormData }, // Ensure fresh copy for each story if mutable
  },
};

export const EmptyState: Story = {
  args: {
    formData: {
      ...mockFormData,
      firewallRules: JSON.stringify([]), // Empty rules array
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = await canvas.findByRole("table");
    // Get all rowgroups (thead, tbody) and select the second one (tbody)
    const rowgroups = within(table).getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // Assuming thead is [0] and tbody is [1]
    
    // There should be one row in tbody for the empty message
    const row = await within(tbody).findByRole("row");
    const cell = await within(row).findByRole("cell");

    expect(cell).toHaveTextContent("No firewall rules have been added yet..");
    // Check colspan based on the number of columns defined in FirewallRulesStep.tsx
    // Name, Source VLAN, Source IP, Dest. VLAN, Dest. IP, Protocol, Ports, Action, Actions = 9 columns
    expect(cell).toHaveAttribute("colspan", "9");
  },
};

export const AddRuleInteraction: Story = {
  args: {
    formData: { ...mockFormData, firewallRules: JSON.stringify([]) }, 
    onInputChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Click Add Rule button
    const addRuleButton = await canvas.findByRole("button", { name: /Add Rule/i });
    await userEvent.click(addRuleButton);

    // FirewallRuleDialog should open. We can't easily test dialog content here without more setup.
    // For now, we assume the dialog opens. More detailed dialog tests would be in FirewallRuleDialog.stories.tsx
    // We can check if the dialog trigger caused a state change if applicable, or if a modal root appears.
    // This story primarily tests the button click leading to the dialog opening mechanism.
    
    // Example: If FirewallRuleDialog immediately adds a rule for simplicity in this test (not realistic)
    // expect(args.onInputChange).toHaveBeenCalledWith("firewallRules", expect.any(String));
    // expect(JSON.parse(args.onInputChange.mock.calls[0][1]).length).toBe(1);
  },
};

// It's hard to fully test delete/edit without deeper interaction with the dialogs themselves
// These interactions are better suited for the stories of FirewallRuleDialog and DeleteFirewallRuleDialog
// However, we can test that the buttons exist for a rule.

export const RuleActionsVisible: Story = {
  args: {
    formData: { ...mockFormData },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Check for actions on the first rule
    const firstRuleName = JSON.parse(mockFormData.firewallRules!)[0].name;
    // Use a function for findByText to allow for partial matches due to truncation
    const row = await canvas.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div' && content.startsWith(firstRuleName.substring(0, 10)); // Match start of the name
    }).then(el => el.closest('tr'));
    if (!row) throw new Error("Row not found for the first rule");

    const ruleRowCanvas = within(row);
    expect(await ruleRowCanvas.findByRole("button", { name: `Delete ${firstRuleName}` })).toBeInTheDocument();
    expect(await ruleRowCanvas.findByRole("button", { name: `Edit ${firstRuleName}` })).toBeInTheDocument();
  },
}; 