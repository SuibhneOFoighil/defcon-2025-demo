import type { TutorialStep } from '@/hooks/use-tutorial'

export const rangeEditorTutorialSteps: TutorialStep[] = [
  {
    id: 'drag-vm',
    targetSelector: '[data-template-name="kali-linux-2024-x64-template"]',
    title: 'Step 1: Drag VM Template',
    description: 'Drag this Kali Linux template onto the canvas to add it to your range. Drop it on the empty VLAN network.',
    position: 'right',
    offset: { x: 10, y: 0 },
    validation: {
      type: 'element-count',
      selector: '[data-vm-template*="kali"][data-testid="vm-component"]',
      expectedCount: 1 // At least 1 Kali VM on canvas
    },
    completionTrigger: 'auto-detect'
  },
  {
    id: 'click-vm',
    targetSelector: '[data-vm-template*="kali"], [data-testid="vm-component"]:last-child',
    title: 'Step 2: Click the VM',
    description: 'Click on the Kali VM you just added to the canvas to open its configuration sidebar.',
    position: 'top',
    offset: { x: -10, y: 0 },
    validation: {
      type: 'element-exists',
      selector: '[data-tab="advanced"]' // VM details panel is open
    },
    completionTrigger: 'auto-detect'
  },
  {
    id: 'advanced-tab',
    targetSelector: '[data-tab="advanced"]',
    title: 'Step 3: Navigate to Advanced Tab',
    description: 'Click on the "Advanced" tab in the VM configuration sidebar.',
    position: 'left',
    offset: { x: -10, y: 0 },
    validation: {
      type: 'attribute-value',
      selector: '[data-tab="advanced"]',
      attribute: 'data-state', // Radix UI sets this
      expectedValue: 'active'
    },
    completionTrigger: 'auto-detect'
  },
  {
    id: 'select-role',
    targetSelector: '[data-field="ansible-roles"]',
    title: 'Step 4: Select Ansible Role',
    description: 'Choose an Ansible role to configure this VM automatically. Roles install software and configure settings.',
    position: 'left',
    offset: { x: -10, y: 0 },
    validation: {
      type: 'attribute-value',
      selector: '[data-field="ansible-roles"]',
      attribute: 'data-has-selection',
      expectedValue: 'true'
    },
    completionTrigger: 'auto-detect'
  },
  {
    id: 'deploy-range',
    targetSelector: '[data-action="deploy-range"]',
    title: 'Step 5: Deploy Range',
    description: 'Click Deploy to create your cyber range with the configured VM and role.',
    position: 'left',
    offset: { x: -10, y: 0 },
    validation: {
      type: 'custom',
      customValidator: () => {
        // This would be completed when deploy button is clicked
        // For demo purposes, we'll allow manual completion
        return false 
      }
    },
    completionTrigger: 'manual' // User must click deploy button
  }
]