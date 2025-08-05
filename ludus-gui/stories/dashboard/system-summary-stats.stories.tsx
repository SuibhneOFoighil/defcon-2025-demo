import type { Meta, StoryObj } from "@storybook/react";
import {
  SystemSummaryStats,
  mockApiRanges,
  calculateSummaryStats,
  SystemSummaryData,
  RangeObject
} from "@/components/ranges/system-summary-stats";

const meta: Meta<typeof SystemSummaryStats> = {
  title: "Dashboard/SystemSummaryStats",
  component: SystemSummaryStats,
  tags: ["autodocs"],
  argTypes: {
    summary: { 
      control: 'object', 
      description: 'The summary data object for system statistics.'
    },
    isLoading: { 
      control: 'boolean', 
      description: 'Flag to display loading skeletons.'
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSummary = calculateSummaryStats(mockApiRanges);

export const Default: Story = {
  name: "Default View",
  args: {
    summary: defaultSummary,
    isLoading: false,
  },
  parameters: {
    docs: {
      storyDescription: 'Displays the system summary statistics with data derived from mock ranges. This is the typical view when data is present and loaded.'
    }
  }
};

export const Loading: Story = {
  name: "Loading State",
  args: {
    // For loading state, summary data might be undefined or an empty shell depending on implementation
    // Using emptySummaryData for visual consistency of placeholders if they rely on some structure
    summary: {} as SystemSummaryData, 
    isLoading: true,
  },
  parameters: {
    docs: {
      storyDescription: 'Displays the loading state of the system summary statistics. Skeletons or placeholders should be visible.'
    }
  }
};

const emptyRanges: RangeObject[] = [];
const emptySummary = calculateSummaryStats(emptyRanges);

export const EmptyData: Story = {
  name: "Empty Data State",
  args: {
    summary: emptySummary,
    isLoading: false,
  },
  parameters: {
    docs: {
      storyDescription: 'Displays the system summary statistics when there is no data to show (e.g., all counts are zero).'
    }
  }
};

const singleSuccessRange: RangeObject[] = [
  {
    userID: "SINGLE",
    rangeNumber: 1,
    lastDeployment: "2023-05-01T12:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true,
    allowedIPs: ["192.168.0.1"],
    allowedDomains: ["single.example.com"],
    rangeState: "SUCCESS",
    VMs: [
      { ID: 1, proxmoxID: 100, rangeNumber: 1, name: "SINGLE-vm", poweredOn: true, ip: "192.168.0.2" },
    ],
  },
];
const singleSuccessSummary = calculateSummaryStats(singleSuccessRange);

export const SingleRangeSuccess: Story = {
  args: {
    summary: singleSuccessSummary,
    isLoading: false,
  },
};

const multipleStatesRanges: RangeObject[] = [
  {
    userID: "MULTI_S",
    rangeNumber: 10,
    lastDeployment: "2023-01-01T00:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true, 
    allowedIPs: ["10.0.0.1"], 
    allowedDomains: ["success.multi.com"], 
    rangeState: "SUCCESS", 
    VMs: [{ ID: 101, proxmoxID: 1001, rangeNumber: 10, name: "multi-s-vm", poweredOn: true, ip: "10.0.0.2"}]
  },
  {
    userID: "MULTI_A",
    rangeNumber: 11,
    lastDeployment: "2023-02-01T00:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true, 
    allowedIPs: ["10.0.1.1"], 
    allowedDomains: ["active.multi.com"], 
    rangeState: "ACTIVE", 
    VMs: [{ ID: 111, proxmoxID: 1002, rangeNumber: 11, name: "multi-a-vm", poweredOn: true, ip: "10.0.1.2"}]
  },
  {
    userID: "MULTI_P",
    rangeNumber: 12,
    lastDeployment: "2023-03-01T00:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true, 
    allowedIPs: ["10.0.2.1"], 
    allowedDomains: ["pending.multi.com"], 
    rangeState: "PENDING", 
    VMs: [{ ID: 121, proxmoxID: 1003, rangeNumber: 12, name: "multi-p-vm", poweredOn: false, ip: "10.0.2.2"}]
  },
    {
    userID: "MULTI_F",
    rangeNumber: 13,
    lastDeployment: "2023-04-01T00:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true, 
    allowedIPs: ["10.0.3.1"], 
    allowedDomains: ["failure.multi.com"], 
    rangeState: "FAILURE", 
    VMs: [{ ID: 131, proxmoxID: 1004, rangeNumber: 13, name: "multi-f-vm", poweredOn: false, ip: "10.0.3.2"}]
  },
  {
    userID: "MULTI_U",
    rangeNumber: 14,
    lastDeployment: "2023-05-01T00:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true, 
    allowedIPs: ["10.0.4.1"], 
    allowedDomains: ["unknown.multi.com"], 
    rangeState: "UNKNOWN", 
    VMs: [{ ID: 141, proxmoxID: 1005, rangeNumber: 14, name: "multi-u-vm", poweredOn: false, ip: "10.0.4.2"}]
  },
];
const multipleStatesSummary = calculateSummaryStats(multipleStatesRanges);

export const MultipleStates: Story = {
  args: {
    summary: multipleStatesSummary,
    isLoading: false,
  }
};

export const PartialData: Story = {
  name: "Partial Data Example",
  args: {
    summary: {
      ...emptySummary, // Start with empty and override
      totalRanges: 5,
      totalVMs: 10,
      poweredOnVMs: 3,
      rangesByState: { 'ACTIVE': 2, 'PENDING': 1, 'SUCCESS': 2 }, // Example states
      uniqueAllowedIPs: 15,
      uniqueAllowedDomains: 7,
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      storyDescription: 'Displays the system summary statistics with a partial or specific set of data points for testing various scenarios.'
    }
  }
}; 