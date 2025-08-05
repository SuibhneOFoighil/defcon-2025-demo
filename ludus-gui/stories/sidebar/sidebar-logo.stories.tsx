import type { Meta, StoryObj } from "@storybook/react";
import { SidebarLogo } from "@/components/sidebar/sidebar-logo";
import { SidebarProvider } from "@/contexts/sidebar-context";

// Storybook decorator to provide SidebarContext
const WithSidebarContext = (Story: any, { globals }: { globals: { sidebarExpanded?: boolean }}) => {
  const expanded = globals.sidebarExpanded ?? true; // Default to true if not set by global
  return (
    <SidebarProvider defaultExpanded={expanded}>
      <div style={{ padding: '1rem', backgroundColor: 'hsl(var(--sidebar-bg))' }}>
        <Story />
      </div>
    </SidebarProvider>
  );
};

const meta: Meta<typeof SidebarLogo> = {
  title: "Sidebar/SidebarLogo",
  component: SidebarLogo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered", // Center the logo, it's a small component
  },
  argTypes: {
    className: { control: "text", description: "Optional additional class names" },
  },
  decorators: [WithSidebarContext],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // No specific args needed for default view, relies on context from decorator
  },
  name: "Logo (Context Driven)"
};

export const ExpandedState: Story = {
  args: {},
  parameters: {
    globals: { sidebarExpanded: true },
  },
  name: "Expanded Logo (via Global)",
};

export const CollapsedState: Story = {
  args: {},
  parameters: {
    globals: { sidebarExpanded: false },
  },
  name: "Collapsed Logo (via Global)",
};

export const WithCustomClass: Story = {
  args: {
    className: "border-2 border-dashed border-[hsl(var(--primary))] p-2",
  },
  name: "Logo with Custom Class (Bordered)",
}; 