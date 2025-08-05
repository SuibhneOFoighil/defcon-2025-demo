"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card-components"
import { Badge } from "@/components/ui/badge"
import { Layers, Server, Globe, ListChecks } from 'lucide-react';
import type { components } from '@/lib/api/ludus/schema';

export type RangeObject = components['schemas']['RangeObject'];

// System summary data based on actual Ludus API structure
export interface SystemSummaryData {
  totalRanges: number;
  totalVMs: number;
  poweredOnVMs: number;
  testingEnabledRanges: number;
  uniqueAllowedIPs: number;
  uniqueAllowedDomains: number;
  rangeStates: Record<string, number>;
}

interface SystemSummaryStatsProps {
  summary: SystemSummaryData;
  isLoading?: boolean;
}

export function SystemSummaryStats({ summary, isLoading }: SystemSummaryStatsProps) {
  if (isLoading) {
    return (
      <section aria-labelledby="system-summary-title-loading" className="mb-10">
        <h2 id="system-summary-title-loading" className="text-xl font-semibold tracking-tight mb-6 text-foreground">
          System Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="h-4 w-3/4 bg-muted-foreground rounded animate-pulse"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-1/2 bg-muted-foreground rounded animate-pulse mb-2"></div>
                <div className="h-3 w-3/4 bg-muted-foreground rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="system-summary-title" className="mb-10">
      <h2 id="system-summary-title" className="text-xl font-semibold tracking-tight mb-6 text-foreground">
        System Overview
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ranges</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalRanges}</div>
            <p className="text-xs text-muted-foreground">
              {summary.testingEnabledRanges} with testing enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VMs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalVMs}</div>
            <p className="text-xs text-muted-foreground">
              {summary.poweredOnVMs} powered on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Access</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.uniqueAllowedIPs} Unique IPs</div>
            <div className="text-2xl font-semibold mt-1">{summary.uniqueAllowedDomains} Unique Domains</div>
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Range States</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(summary.rangeStates).map(([state, count]) => {
                if (count === 0) return null;
                return (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-muted-foreground">
                      {state.toLowerCase()}
                    </span>
                    <Badge
                      variant={
                        state === "SUCCESS" ? "default" :
                        state === "FAILURE" ? "danger" :
                        state === "PENDING" ? "outline" :
                        "secondary"
                      }
                      className="text-xs"
                    >
                      {count}
                    </Badge>
                  </div>
                );
              })}
              {Object.keys(summary.rangeStates).length === 0 && (
                <p className="text-sm text-muted-foreground">No ranges found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

// Calculate system summary from raw Ludus API data
export function calculateSummaryStats(ranges: RangeObject[]): SystemSummaryData {
  const totalRanges = ranges.length;
  const totalVMs = ranges.reduce((sum, range) => sum + (range.numberOfVMs || 0), 0);
  const poweredOnVMs = ranges.reduce((sum, range) => {
    return sum + (range.VMs?.filter(vm => vm.poweredOn).length || 0);
  }, 0);
  const testingEnabledRanges = ranges.filter(range => range.testingEnabled).length;

  // Count range states as they come from the API
  const rangeStates = ranges.reduce((acc, range) => {
    const state = range.rangeState || 'UNKNOWN';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allIPs = ranges.flatMap(range => range.allowedIPs || []);
  const uniqueAllowedIPs = new Set(allIPs).size;

  const allDomains = ranges.flatMap(range => range.allowedDomains || []);
  const uniqueAllowedDomains = new Set(allDomains).size;

  return {
    totalRanges,
    totalVMs,
    poweredOnVMs,
    testingEnabledRanges,
    uniqueAllowedIPs,
    uniqueAllowedDomains,
    rangeStates,
  };
}

// Mock data for backward compatibility with existing stories
export const mockApiRanges: RangeObject[] = [
  {
    userID: "JD",
    rangeNumber: 3,
    lastDeployment: "2022-08-29T09:12:33.001Z",
    numberOfVMs: 3,
    testingEnabled: true,
    allowedIPs: ["1.2.3.4", "192.168.1.10"],
    allowedDomains: ["example.com", "test.internal"],
    rangeState: "SUCCESS",
    VMs: [
      { ID: 53, proxmoxID: 146, rangeNumber: 3, name: "JD-ad-dc-win2019-server-x64", poweredOn: true, ip: "203.0.113.4" },
      { ID: 54, proxmoxID: 147, rangeNumber: 3, name: "JD-web-ubuntu-server-x64", poweredOn: true, ip: "203.0.113.5" },
      { ID: 55, proxmoxID: 148, rangeNumber: 3, name: "JD-db-centos-server-x64", poweredOn: false, ip: "203.0.113.6" },
    ],
  },
  {
    userID: "AB",
    rangeNumber: 1,
    lastDeployment: "2023-01-15T14:30:00.000Z",
    numberOfVMs: 2,
    testingEnabled: false,
    allowedIPs: ["1.2.3.4", "10.0.0.5"],
    allowedDomains: ["example.com", "corp.local"],
    rangeState: "FAILURE",
    VMs: [
        { ID: 1, proxmoxID: 101, rangeNumber: 1, name: "AB-vm1", poweredOn: true, ip: "10.0.0.6" },
        { ID: 2, proxmoxID: 102, rangeNumber: 1, name: "AB-vm2", poweredOn: false, ip: "10.0.0.7" },
    ],
  },
  {
    userID: "CC",
    rangeNumber: 2,
    lastDeployment: "2023-03-10T10:00:00.000Z",
    numberOfVMs: 1,
    testingEnabled: true,
    allowedIPs: ["172.16.0.100"],
    allowedDomains: ["another.example.com"],
    rangeState: "ACTIVE",
    VMs: [
        { ID: 10, proxmoxID: 201, rangeNumber: 2, name: "CC-kube-master", poweredOn: true, ip: "172.16.0.101" },
    ],
  },
  {
    userID: "DE",
    rangeNumber: 4,
    lastDeployment: "2023-04-01T18:45:12.000Z",
    numberOfVMs: 0,
    testingEnabled: true,
    allowedIPs: [],
    allowedDomains: [],
    rangeState: "PENDING",
    VMs: [],
  },
   {
    userID: "EF",
    rangeNumber: 5,
    lastDeployment: "2023-05-01T12:00:00.000Z",
    numberOfVMs: 2,
    testingEnabled: false,
    allowedIPs: ["192.168.2.20"],
    allowedDomains: ["dev.local"],
    rangeState: "SUCCESS",
    VMs: [
        { ID: 60, proxmoxID: 301, rangeNumber: 5, name: "EF-devbox1", poweredOn: true, ip: "192.168.2.21" },
        { ID: 61, proxmoxID: 302, rangeNumber: 5, name: "EF-devbox2", poweredOn: true, ip: "192.168.2.22" },
    ],
  },
]; 