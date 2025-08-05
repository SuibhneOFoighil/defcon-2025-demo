import type { Meta, StoryObj } from '@storybook/react';
import { TemplatesCard } from '@/components/templates/templates-card';
import * as React from 'react';

// Sample template items for different states
const sampleTemplates = {
  built: {
    id: "debian-12-x64-server-template",
    name: "debian-12-x64-server-template",
    built: "built" as const,
  },
  building: {
    id: "debian-10-x64-server-template",
    name: "debian-10-x64-server-template",
    built: "building" as const,
  },
  failed: {
    id: "rocky-9-x64-server-template",
    name: "rocky-9-x64-server-template",
    built: "failed" as const,
  },
  notBuilt: {
    id: "ubuntu-22-x64-server-template",
    name: "ubuntu-22-x64-server-template",
    built: "not-built" as const,
  },
  largeTemplate: {
    id: "win11-22h2-x64-enterprise-template",
    name: "win11-22h2-x64-enterprise-template",
    built: "built" as const,
  },
  longName: {
    id: "very-long-template-name-that-should-truncate-properly",
    name: "very-long-template-name-that-should-truncate-properly-in-the-card-display",
    built: "built" as const,
  }
};

const meta: Meta<typeof TemplatesCard> = {
  title: 'Dashboard/TemplatesCard',
  component: TemplatesCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A card component for displaying individual template information with context menu and selection capabilities:

## Features:
- **Template type visualization**: Shows appropriate icon (Monitor for desktop/Windows, Server for servers, HardDrive for others)
- **Build status badge**: Color-coded badge showing current build status in the description area
- **Click to select**: Single click selects the card
- **Double click to navigate**: Opens the template editor
- **Context menu**: Three-dot menu with actions (Edit, Clone, Rebuild, Delete)
- **Simple selection state**: Primary color border when selected
- **Template information**: Name, size, build status, and last build date

## Template Icons:
- **Desktop/Windows templates**: Monitor icon (for templates containing 'desktop' or 'win')
- **Server templates**: Server icon (for templates containing 'server')
- **Other templates**: HardDrive icon (default fallback)

## Build Status Badges:
- **Built**: Green success badge - template is ready to use
- **Building**: Yellow badge - template is currently being built
- **Failed**: Red danger badge - last build attempt failed
- **Not Built**: Gray outline badge - template has never been built

## Card Information:
- Template name with truncation for long names
- File size in GB (or "—" if not available)
- Build status badge with appropriate color coding
- Last build date (or "—" if never built)

## Interaction:
- Click anywhere on the card (except the menu button) to select
- Double-click to navigate to the template editor
- Click the three-dot menu for additional actions
- Context menu is isolated from selection to prevent conflicts
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onNavigate: {
      action: 'navigated',
      description: 'Callback when card is clicked for navigation'
    }
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TemplatesCard>;

// Built template
export const Built: Story = {
  name: "Built Template",
  args: {
    item: sampleTemplates.built,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
};

// Template with different state
export const LargeTemplate: Story = {
  name: "Large Template",
  args: {
    item: sampleTemplates.largeTemplate,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the simple selection styling with primary color border highlighting.'
      }
    }
  }
};

// Building state
export const Building: Story = {
  name: "Building State",
  args: {
    item: sampleTemplates.building,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a template currently being built with yellow "Building" badge and server icon.'
      }
    }
  }
};

// Failed state
export const Failed: Story = {
  name: "Failed State",
  args: {
    item: sampleTemplates.failed,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a template with a failed build attempt with red "Failed" badge.'
      }
    }
  }
};

// Not built state
export const NotBuilt: Story = {
  name: "Not Built State",
  args: {
    item: sampleTemplates.notBuilt,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a template that has never been built with gray "Not Built" outline badge.'
      }
    }
  }
};

// Large template (Windows desktop)
export const WindowsDesktop: Story = {
  name: "Windows Desktop Template",
  args: {
    item: sampleTemplates.largeTemplate,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a Windows desktop template with Monitor icon and larger file size (18.7 GB).'
      }
    }
  }
};

// Long name to test truncation
export const LongName: Story = {
  name: "Long Name (Truncation)",
  args: {
    item: sampleTemplates.longName,
    onNavigate: (id: string) => console.log('Navigate to:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests template name truncation with a very long template name.'
      }
    }
  }
};

// Multiple cards to show selection behavior and different icons
export const MultipleCards: Story = {
  name: "Multiple Cards (Selection Demo)",
  render: () => {
    const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set(['debian-12-x64-server-template']));
    
    const handleSelect = (id: string, event: React.MouseEvent) => {
      if (event.metaKey || event.ctrlKey) {
        // Multi-select toggle
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        setSelectedItems(newSelection);
      } else {
        // Single selection
        setSelectedItems(new Set([id]));
      }
    };

    const handleNavigate = (id: string) => {
      console.log('Navigate to:', id);
    };

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
        <TemplatesCard
          item={sampleTemplates.built}
          onNavigate={handleNavigate}
        />
        <TemplatesCard
          item={sampleTemplates.building}
          onNavigate={handleNavigate}
        />
        <TemplatesCard
          item={sampleTemplates.failed}
          onNavigate={handleNavigate}
        />
        <TemplatesCard
          item={sampleTemplates.largeTemplate}
          onNavigate={handleNavigate}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing multiple cards with different build states, template types, and selection behavior. Notice the different icons: Server icons for server templates and Monitor icon for the Windows desktop template. Try clicking cards to select them, or Cmd/Ctrl+click for multi-select.'
      }
    }
  }
}; 