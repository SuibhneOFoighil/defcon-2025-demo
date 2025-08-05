import React from 'react';
import '../app/tailwind.css';
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes';
import { initialize, mswLoader } from 'msw-storybook-addon';
// import { SessionProvider } from 'next-auth/react'; // Removed - not installed
import { TooltipProvider } from '@/components/ui/tooltip';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: '', color: '#ffffff', default: true },
        { name: 'dark', class: 'dark', color: '#000000' },
      ],
      target: 'html', // Apply the class to the <html> element for Tailwind
    },
  },
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
  decorators: [
    (Story) => {
      // Create a new QueryClient for each story (best practice)
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
          },
          mutations: {
            retry: false,
          },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <NotificationProvider>
              <TooltipProvider delayDuration={100}>
                <ContextMenuProvider>
                  <Story />
                  <Toaster />
                </ContextMenuProvider>
              </TooltipProvider>
            </NotificationProvider>
          </SidebarProvider>
        </QueryClientProvider>
      );
    },
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html', // This ensures the 'dark' class is applied to <html>
    }),
  ],
};

export default preview;