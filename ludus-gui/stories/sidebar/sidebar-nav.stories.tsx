import type { Meta, StoryObj } from "@storybook/react";
import { SidebarNav } from "@/components/sidebar/sidebar-nav";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ThemeProvider } from "@/lib/theme/theme-context"; // Corrected path
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

// Minimal stubs for Next.js and NextAuth hooks/functions used by SidebarNav
// More robust mocking can be done in .storybook/preview.js or with addons
const mockUsePathname = () => '/';
const mockUseRouter = () => ({
  push: (path: string) => alert(`Mocked router push to: ${path}`),
  replace: (path: string) => alert(`Mocked router replace with: ${path}`),
  back: () => alert('Mocked router back'),
  forward: () => alert('Mocked router forward'),
  prefetch: async (path: string) => alert(`Mocked router prefetch: ${path}`),
  refresh: () => alert('Mocked router refresh'),
});
const mockSignOut = async () => alert('Mocked signOut()');

const meta: Meta<typeof SidebarNav> = {
  title: "Sidebar/SidebarNav",
  component: SidebarNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { // Provide stubs for next/navigation if storybook-nextjs addon is used
      router: {
        pathname: '/',
        push: (path: string) => alert(`Storybook Router push to: ${path}`),
      },
      pathname: '/', // For usePathname mock
    },
    // Provide mocks for functions used by the component
    moduleMocks: {
      'next/navigation': {
        usePathname: mockUsePathname,
        useRouter: mockUseRouter,
      },
      'next-auth/react': {
        signOut: mockSignOut,
        useSession: () => ({ data: { user: { name: 'Storybook User' } }, status: 'authenticated' }),
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      // Use a unique name for global to avoid conflicts if a story defines its own sidebarExpanded
      const isGloballyExpanded = globals.sidebarNavExpandedGlobal ?? true;
      return (
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider defaultExpanded={isGloballyExpanded}>
              <div style={{ height: '100vh', display: 'flex' }}>
                <Story />
                <main style={{ flexGrow: 1, padding: '20px', backgroundColor: 'hsl(var(--background))' }}>
                  <p className="text-[hsl(var(--foreground))]">Page Content Area</p>
                  <p className="text-[hsl(var(--muted-foreground))]">Click items in the sidebar. Logout will show an alert.</p>
                </main>
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultExpanded: Story = {
  name: "Default (Expanded)",
  // This story will use the global sidebarNavExpandedGlobal=true by default from globalTypes
};

export const DefaultCollapsed: Story = {
  name: "Default (Collapsed)",
  parameters: {
    globals: { sidebarNavExpandedGlobal: false } // Override global for this specific story
  },
}; 