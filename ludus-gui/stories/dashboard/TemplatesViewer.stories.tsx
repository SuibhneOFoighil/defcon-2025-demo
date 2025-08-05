import type { Meta, StoryObj } from '@storybook/react';
import { TemplatesViewer } from '@/components/templates/templates-viewer';

// Mock data for different scenarios
const mockTemplateScenarios = {
  minimal: [
    {
      name: "ubuntu-22.04-minimal",
      built: true,
    },
    {
      name: "alpine-3.18-base", 
      built: false,
    }
  ],

  mixedStates: [
    {
      // id: "debian-12-server",
      name: "debian-12-x64-server-template",
      built: true,
      // sizeGB: 4.3,
      // lastBuild: "11 May 25",
    },
    {
      // id: "kali-desktop",
      name: "kali-x64-desktop-template",
      built: true,
      // sizeGB: 8.1,
      // lastBuild: "11 May 25",
    },
    {
      // id: "win11-enterprise",
      name: "win11-22h2-x64-enterprise-template",
      built: true,
      // sizeGB: 18.7,
      // lastBuild: "10 May 25",
    },
    {
      // id: "centos-building",
      name: "centos-stream-9-template",
      built: false,
      // sizeGB: null,
      // lastBuild: null,
    },
    {
      // id: "rocky-failed",
      name: "rocky-9-x64-server-template",
      built: false,
      // sizeGB: null,
      // lastBuild: "never",
    },
    {
      // id: "arch-not-built",
      name: "arch-linux-template",
      built: false,
      // sizeGB: null,
      // lastBuild: null,
    }
  ],

  enterpriseTemplates: [
    {
      // id: "windows-server-2019-datacenter-template",
      name: "windows-server-2019-datacenter-enterprise-template",
      built: true,
      // sizeGB: 25.4,
      // lastBuild: "15 Apr 25",
    },
    {
      // id: "redhat-enterprise-linux-9-template",
      name: "redhat-enterprise-linux-9-x64-server-template",
      built: true,
      // sizeGB: 6.8,
      // lastBuild: "20 Apr 25",
    },
    {
      // id: "ubuntu-server-22.04-lts-template",
      name: "ubuntu-server-22.04-lts-hardened-template",
      built: false,
      // sizeGB: null,
      // lastBuild: null,
    }
  ],

  varietyPack: Array.from({ length: 12 }, (_, i) => {
    const templateNames = [
      "debian-11-server-template",
      "ubuntu-20.04-desktop-template", 
      "fedora-38-workstation-template",
      "opensuse-leap-15-template",
      "freebsd-13-template",
      "windows-10-enterprise-template",
      "windows-server-2022-template",
      "kali-linux-rolling-template",
      "parrot-security-template",
      "metasploitable-3-template",
      "pfsense-firewall-template",
      "openwrt-router-template"
    ];
    
    const isBuilt = i % 2 === 0; // Alternate between built and not built
    
    return {
      // id: `template-${i + 1}`,
      name: templateNames[i] || `custom-template-${i + 1}`,
      built: isBuilt,
    };
  }),

  largeSizes: [
    {
      // id: "windows-server-full",
      name: "windows-server-2022-datacenter-full-template",
      built: true,
      // sizeGB: 45.2,
      // lastBuild: "1 week ago",
    },
    {
      // id: "gaming-vm",
      name: "windows-11-gaming-optimized-template",
      built: true,
      // sizeGB: 72.8,
      // lastBuild: "3 days ago",
    },
    {
      // id: "development-stack",
      name: "ubuntu-22.04-development-full-stack-template",
      built: false,
      // sizeGB: null,
      // lastBuild: null,
    }
  ],

  edgeCases: [
    {
      // id: "tiny-template",
      name: "alpine-minimal-container-template",
      built: true,
      // sizeGB: 0.1,
      // lastBuild: "just now",
    },
    {
      // id: "huge-template",
      name: "windows-server-with-all-roles-template",
      built: true,
      // sizeGB: 127.9,
      // lastBuild: "6 months ago",
    },
    {
      // id: "ancient-build",
      name: "legacy-centos-6-template",
      built: true,
      // sizeGB: 3.2,
      // lastBuild: "2 years ago",
    },
    {
      // id: "never-built",
      name: "experimental-nixos-template",
      built: false,
      // sizeGB: null,
      // lastBuild: null,
    }
  ]
};

const meta: Meta<typeof TemplatesViewer> = {
  title: 'Dashboard/TemplatesViewer',
  component: TemplatesViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A viewer component for displaying template data with advanced selection and interaction capabilities:

## Selection Modes:
- **Single click**: Selects a single row (clears other selections)
- **Double click**: Navigates to the template editor for that template
- **Shift + click**: Selects a range of items between the last selected item and the clicked item
- **Cmd/Ctrl + click**: Toggles individual items in/out of the selection (multi-select)

## Additional Features:
- **Kebab menu**: Click the three-dot menu for additional actions (Build, Delete, View Logs)
- **Selection counter**: Shows how many items are currently selected
- **Visual feedback**: Selected rows are highlighted with orange left border
- **Build status**: Visual indicators for built (green checkmark) vs not built (red X)

## Keyboard Shortcuts:
- **Shift + Click**: Range selection
- **⌘ + Click** (Mac) / **Ctrl + Click** (Windows/Linux): Multi-select toggle

Note: The kebab menu interactions are isolated from row selection/navigation to prevent conflicts.
        `
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TemplatesViewer>;

// Default story with the original sample data
export const Default: Story = {
  name: "Default Sample Data",
  args: {},
};

// Minimal data - just a couple templates
export const MinimalData: Story = {
  name: "Minimal (2 templates)",
  args: {
    data: mockTemplateScenarios.minimal
  },
  parameters: {
    docs: {
      description: {
        story: 'A minimal table with just 2 template items showing basic layout.'
      }
    }
  }
};

// Mixed states showing all status variants
export const MixedStates: Story = {
  name: "Mixed Build States",
  args: {
    data: mockTemplateScenarios.mixedStates
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcases all build status types: Built (✅), Building (⏳), Failed (❌), and Not Built.'
      }
    }
  }
};

// Enterprise templates with longer names
export const EnterpriseTemplates: Story = {
  name: "Enterprise Templates",
  args: {
    data: mockTemplateScenarios.enterpriseTemplates
  },
  parameters: {
    docs: {
      description: {
        story: 'Enterprise-grade templates with longer, more descriptive names and larger sizes.'
      }
    }
  }
};

// Variety pack with many different templates
export const VarietyPack: Story = {
  name: "Variety Pack (12 templates)",
  args: {
    data: mockTemplateScenarios.varietyPack
  },
  parameters: {
    docs: {
      description: {
        story: 'A diverse collection of 12 different templates across various operating systems and states.'
      }
    }
  }
};

// Large template sizes
export const LargeSizes: Story = {
  name: "Large Template Sizes",
  args: {
    data: mockTemplateScenarios.largeSizes
  },
  parameters: {
    docs: {
      description: {
        story: 'Templates with large file sizes (40GB+) to test size display formatting.'
      }
    }
  }
};

// Edge cases with unusual data
export const EdgeCases: Story = {
  name: "Edge Cases",
  args: {
    data: mockTemplateScenarios.edgeCases
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge cases: tiny templates (0.1GB), huge templates (127GB), ancient builds, and never-built templates.'
      }
    }
  }
};

// Empty state
export const EmptyState: Story = {
  name: "Empty State",
  args: {
    data: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the table appears when there are no templates to display.'
      }
    }
  }
};

// Loading state
export const LoadingState: Story = {
  name: "Loading State",
  args: {
    isLoading: true,
    data: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the loading state while template data is being fetched.'
      }
    }
  }
}; 