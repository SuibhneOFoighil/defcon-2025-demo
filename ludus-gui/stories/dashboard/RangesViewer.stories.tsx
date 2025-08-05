import type { Meta, StoryObj } from '@storybook/react';
import { RangesViewer } from '@/components/ranges/ranges-viewer';
import { mockApiRanges, RangeObject } from '@/components/ranges/system-summary-stats';

// Helper function to generate unique test data
const generateUniqueRangeData = (count: number): RangeObject[] => {
  const result: RangeObject[] = [];
  for (let i = 0; i < count; i++) {
    const originalRange = mockApiRanges[i % mockApiRanges.length];
    const suffix = Math.floor(i / mockApiRanges.length);
    result.push({
      ...originalRange,
      userID: `${originalRange.userID}${suffix > 0 ? `_${suffix}` : ''}`,
      rangeNumber: originalRange.rangeNumber + (suffix * 100),
    });
  }
  return result;
};


const meta: Meta<typeof RangesViewer> = {
  title: 'Dashboard/RangesViewer',
  component: RangesViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A viewer component for displaying range data with advanced selection and interaction capabilities:

## Selection Modes:
- **Single click**: Selects a single row (clears other selections)
- **Double click**: Navigates to the network editor for that range
- **Shift + click**: Selects a range of items between the last selected item and the clicked item
- **Cmd/Ctrl + click**: Toggles individual items in/out of the selection (multi-select)

## Additional Features:
- **Kebab menu**: Click the three-dot menu for additional actions (Edit, Copy, Favorite, Delete)
- **Selection counter**: Shows how many items are currently selected
- **Visual feedback**: Selected rows are highlighted with orange left border
- **State badges**: Different colors for Success (green), Failure (red), Active (blue), Pending (gray)

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

type Story = StoryObj<typeof RangesViewer>;

// Default story with the original sample data
export const Default: Story = {
  name: "Default Sample Data",
  args: {
    data: mockApiRanges.slice(0, 3)
  },
};

// Minimal data - just a couple items
export const MinimalData: Story = {
  name: "Minimal (2 items)",
  args: {
    data: mockApiRanges.slice(0, 2)
  },
  parameters: {
    docs: {
      description: {
        story: 'A minimal table with just 2 range items to show the basic layout and styling.'
      }
    }
  }
};

// Mixed states showing all badge variants
export const MixedStates: Story = {
  name: "Mixed States & Statuses", 
  args: {
    data: mockApiRanges
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcases all different state badges (Success, Failure, Active, Pending) and testing statuses.'
      }
    }
  }
};

// Long names to test text truncation
export const LongNames: Story = {
  name: "Long Names & Text Overflow",
  args: {
    data: mockApiRanges.slice(0, 3)
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests how the table handles very long range names and lab template names with proper text truncation.'
      }
    }
  }
};

// Many items to test scrolling and performance
export const ManyItems: Story = {
  name: "Many Items (15+ rows)",
  args: {
    data: generateUniqueRangeData(15)
  },
  parameters: {
    docs: {
      description: {
        story: 'A larger dataset with 15+ items to test table performance, scrolling, and multi-selection behavior.'
      }
    }
  }
};

// Pagination examples
export const WithPagination: Story = {
  name: "With Pagination (5 per page)",
  args: {
    data: generateUniqueRangeData(15),
    pageSize: 5,
    enablePagination: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates pagination with 5 items per page using a larger dataset.'
      }
    }
  }
};

export const PaginationDisabled: Story = {
  name: "Pagination Disabled",
  args: {
    data: generateUniqueRangeData(15),
    enablePagination: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the table with pagination disabled, displaying all items at once.'
      }
    }
  }
};

// Edge cases with unusual data
export const EdgeCases: Story = {
  name: "Edge Cases & Unusual Data",
  args: {
    data: mockApiRanges.slice(0, 2)
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge cases including zero VMs, maximum capacity, critical failures, and unusual time stamps.'
      }
    }
  }
};

// Empty state (would need component modification to support)
export const EmptyState: Story = {
  name: "Empty State",
  args: {
    data: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the table appears when there are no range items to display.'
      }
    }
  }
};

// Loading state (would need component modification to support)
export const LoadingState: Story = {
  name: "Loading State",
  args: {
    isLoading: true,
    data: []
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the loading state with skeleton content or loading indicators.'
      }
    }
  }
}; 