import type { Meta, StoryObj } from "@storybook/react";
import { Home, Settings, Users } from "lucide-react";
import { SidebarItem } from "@/components/sidebar/sidebar-item";
import { SidebarProvider } from "@/contexts/sidebar-context";
import Link from "next/link";
import type { ComponentProps, ComponentType } from "react";

// MockLink serves as a reference or a simple stub for next/link functionality
// in Storybook environments where full Next.js routing context might not be available or needed.
// SidebarItem internally uses the actual next/link component.
const MockLink = ({ href, children, ...props }: ComponentProps<typeof Link>) => (
  // Cast href to string for the <a> tag, as Storybook args will provide strings
  <a href={String(href)} {...props} onClick={(e) => { e.preventDefault(); alert(`Mock navigation to: ${href}`); }}>
    {children}
  </a>
);

// Storybook decorator to provide SidebarContext
 const WithSidebarContext = (Story: React.ComponentType, { globals }: { globals: { sidebarExpanded?: boolean }}) => {
  const expanded = globals.sidebarExpanded ?? true; // Default to true if not set by global
  return (
 <SidebarProvider defaultExpanded={expanded}>
      <div style={{ width: expanded ? 240 : 80, padding: '1rem', backgroundColor: 'hsl(var(--sidebar-bg))' }}>
        <Story />
      </div>
    </SidebarProvider>
  );
};

const meta: Meta<typeof SidebarItem> = {
  title: "Sidebar/SidebarItem",
  component: SidebarItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    // Mock Next.js Link behavior for stories if necessary globally
    // The commented out section below for nextjs appDirectory router was removed
    // as it was unused and its purpose is covered by comments near line 70.
  },
  argTypes: {
    name: { control: "text", description: "The name/label of the sidebar item" },
    href: { control: "text", description: "The navigation link for the item" },
    icon: { control: false, description: "Lucide icon component to display" },
    isActive: { control: "boolean", description: "Whether the item is currently active" },
  },
  decorators: [WithSidebarContext],
};

export default meta;
type Story = StoryObj<typeof meta>;

// IMPORTANT: To make <Link> work correctly in Storybook without full router mock,
// we might need storybook-nextjs addon or similar.
// For now, we assume the visual rendering is the primary goal.
// The MockLink isn't directly injected into SidebarItem; SidebarItem uses <Link> internally.
// Storybook might provide a basic stub or we'd need deeper mocking for actual navigation tests.

export const Default: Story = {
  args: {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    isActive: true,
  },
};

export const UsersItem: Story = {
  args: {
    name: "Users Management",
    href: "/admin/users",
    icon: Users,
    isActive: false,
  },
  name: "Users (Inactive)",
};

export const CollapsedActive: Story = {
  args: {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    isActive: true,
  },
  // To set the global for this specific story via parameters:
  parameters: {
    globals: { sidebarExpanded: false },
  },
  name: "Collapsed & Active (Set via Story Parameter)"
};

export const CollapsedInactive: Story = {
  args: {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    isActive: false,
  },
  parameters: {
    globals: { sidebarExpanded: false },
  },
  name: "Collapsed & Inactive (Set via Story Parameter)"
}; 