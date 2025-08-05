/**
 * Utility functions for generating consistent VM IDs across client and server
 */

/**
 * Generate a consistent VM ID based on the VM name
 * This ensures the same VM gets the same ID everywhere in the application
 */
export function generateVMId(vmName: string): string {
  return `vm-${vmName}`
}

/**
 * Generate a predicted VM name based on template and range context
 * This matches the server-side naming pattern: {{ range_id }}-${templateName}-${index}
 */
export function generatePredictedVMName(
  rangeId: string,
  templateName: string,
  index: number
): string {
  return `${rangeId}-${templateName}-${index}`
}

/**
 * Generate a VM ID for a new VM being created on the client
 * Uses the predicted VM name pattern to ensure consistency with server
 */
export function generateClientVMId(
  rangeId: string,
  templateName: string,
  existingVMCount: number
): string {
  const vmName = generatePredictedVMName(rangeId, templateName, existingVMCount + 1)
  return generateVMId(vmName)
}