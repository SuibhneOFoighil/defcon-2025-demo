"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FirewallRuleDialog } from "./firewall-rule-dialog"
import { DeleteFirewallRuleDialog } from "./delete-firewall-rule-dialog"
import type { FirewallRule } from "./types"
import type { StepProps } from "./types"
import { WizardStepHeader } from "./wizard-step-header"
import { DataGrid, type Column } from "@/components/ui/data-grid/data-grid"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { logUserAction, logError } from "@/lib/logger"

// Import the TruncatedCell component at the top of the file
import { TruncatedCell } from "@/components/ui/truncated-cell"

// Remove the hardcoded default rules - Ludus defaults to allowing all traffic
// Users can add custom firewall rules as needed
const DEFAULT_RULES: FirewallRule[] = []

export function FirewallRulesStep({ onInputChange, formData }: StepProps) {
  const [rules, setRules] = useState<FirewallRule[]>(() => {
    if (formData && typeof formData.firewallRules === 'string') {
      try {
        const parsedRules = JSON.parse(formData.firewallRules);
        return Array.isArray(parsedRules) ? parsedRules : DEFAULT_RULES;
      } catch (e) {
        logError(e as Error, 'Firewall Rules Step', { operation: 'parse-initial-rules' });
        return DEFAULT_RULES;
      }
    }
    return DEFAULT_RULES;
  });

  useEffect(() => {
    if (formData && typeof formData.firewallRules === 'string') {
      try {
        const parsedRules = JSON.parse(formData.firewallRules);
        if (Array.isArray(parsedRules)) {
          if (JSON.stringify(rules) !== JSON.stringify(parsedRules)) {
            setRules(parsedRules);
          }
          return;
        }
      } catch (e) {
        logError(e as Error, 'Firewall Rules Step', { operation: 'parse-effect-rules' });
      }
    }
    // Only reset to empty if we don't have valid rules
    if (rules.length === 0 && JSON.stringify(rules) !== JSON.stringify(DEFAULT_RULES)) {
      setRules(DEFAULT_RULES);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.firewallRules]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentRule, setCurrentRule] = useState<FirewallRule | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Define columns for the DataGrid
  const columns: Column<FirewallRule>[] = [
    {
      id: "name",
      header: "Name",
      cell: (item) => <TruncatedCell content={item.name} className="max-w-xs xl:max-w-sm" />,
      className: "min-w-[200px] whitespace-normal", // Allow wrapping for name if needed
    },
    { id: "sourceVLAN", header: "Source VLAN", cell: (item) => item.sourceVLAN, className: "text-center" },
    { id: "sourceIP", header: "Source IP", cell: (item) => item.sourceIP, className: "text-center" },
    { id: "destinationVLAN", header: "Dest. VLAN", cell: (item) => item.destinationVLAN, className: "text-center" },
    { id: "destinationIP", header: "Dest. IP", cell: (item) => item.destinationIP, className: "text-center" },
    { id: "protocol", header: "Protocol", cell: (item) => item.protocol, className: "text-center" },
    { id: "ports", header: "Ports", cell: (item) => item.ports, className: "text-center" },
    {
      id: "action",
      header: "Action",
      cell: (item) => {
        let actionClass = "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"; // Default to warning/accent
        if (item.action === "ACCEPT") {
          actionClass = "bg-[hsl(var(--success))] text-[hsl(var(--primary-foreground))]"; // Assuming --primary-foreground for success text
        } else if (item.action === "REJECT") {
          actionClass = "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]";
        }
        return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${actionClass}`}
        >
          {item.action === "ACCEPT" ? "Accept" : item.action === "REJECT" ? "Reject" : "Drop"}
        </span>
        );
      },
      className: "text-center",
    },
    {
      id: "actions",
      header: "", // No header text for actions
      cell: (item) => (
        <div className="flex justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteRule(item)}
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRule(item)}
            aria-label={`Edit ${item.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-[80px]", // Fixed width for actions
    },
  ]

  // Handle opening the add rule dialog
  const handleAddRule = () => {
    setCurrentRule(null)
    setIsEditMode(false)
    setIsAddDialogOpen(true)
  }

  // Handle opening the edit rule dialog
  const handleEditRule = (rule: FirewallRule) => {
    setCurrentRule(rule)
    setIsEditMode(true)
    setIsAddDialogOpen(true)
  }

  // Handle opening the delete rule dialog
  const handleDeleteRule = (rule: FirewallRule) => {
    setCurrentRule(rule)
    setIsDeleteDialogOpen(true)
  }

  // Save a new rule or update an existing one
  const handleSaveRule = (rule: FirewallRule) => {
    let updatedRules: FirewallRule[]
    
    if (isEditMode && currentRule) {
      updatedRules = rules.map((r) => (r.id === currentRule.id ? rule : r))
    } else {
      // Generate a new ID for a new rule
      const newRule = {
        ...rule,
        id: `rule-${String(rules.length + 1).padStart(3, "0")}`,
      }
      updatedRules = [...rules, newRule]
    }
    
    setRules(updatedRules)
    setIsAddDialogOpen(false)

    // Update the form data with both string and parsed versions
    onInputChange("firewallRules", JSON.stringify(updatedRules))
    onInputChange("parsedFirewallRules", updatedRules)
  }

  // Confirm deletion of a rule
  const handleConfirmDelete = () => {
    if (currentRule) {
      const updatedRules = rules.filter((rule) => rule.id !== currentRule.id)
      setRules(updatedRules)
      setIsDeleteDialogOpen(false)

      // Update the form data with both string and parsed versions
      onInputChange("firewallRules", JSON.stringify(updatedRules))
      onInputChange("parsedFirewallRules", updatedRules)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <WizardStepHeader title="Set Firewall Rules" showSkip onSkip={() => logUserAction('firewall-rules-skip', 'CreateRangeWizard', {})}>
        <Button variant="elevated" onClick={handleAddRule} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </WizardStepHeader>

      {/* Rules Table replaced with DataGrid */}
      <div className="mb-6">
        <DataGrid<FirewallRule>
          data={rules}
          columns={columns}
          keyField="id"
          emptyState="No firewall rules have been added yet.."
          className="min-w-full border border-border rounded-md" // Added border and rounded-md to match previous style
        />
      </div>

      {/* Help Text */}
      <Alert variant="info" className="mt-6">
        <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <AlertTitle className="font-medium mb-1">Default Network Behavior</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            By default, Ludus allows all traffic between VLANs and to the internet. Add custom firewall rules here only if you need to restrict specific traffic. Rules use the format: Source → Destination with Protocol/Ports and Action (ACCEPT/REJECT/DROP).
          </AlertDescription>
        </div>
      </Alert>

      {/* Dialogs */}
      {isAddDialogOpen && (
        <FirewallRuleDialog
          open={isAddDialogOpen}
          onOpenChange={() => setIsAddDialogOpen(false)}
          onSave={handleSaveRule}
          rule={currentRule}
          isEdit={isEditMode}
        />
      )}

      {isDeleteDialogOpen && currentRule && (
        <DeleteFirewallRuleDialog
          open={isDeleteDialogOpen}
          onOpenChange={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          ruleName={currentRule.name}
        />
      )}
    </div>
  )
}
