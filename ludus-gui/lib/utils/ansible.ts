/**
 * Utility functions for working with Ansible roles and collections
 */

/**
 * Parse an Ansible role/collection name into namespace and name parts
 * @param fullName - The full name (e.g., "geerlingguy.java")
 * @returns Object with namespace and name parts
 */
export function parseAnsibleName(fullName: string | undefined): {
  namespace: string
  name: string
  fullName: string
} {
  if (!fullName) {
    return { namespace: '', name: '', fullName: '' }
  }

  const parts = fullName.split('.')
  if (parts.length > 1) {
    return {
      namespace: parts[0],
      name: parts.slice(1).join('.'),
      fullName
    }
  }

  return {
    namespace: '',
    name: fullName,
    fullName
  }
}

/**
 * Get the Galaxy URL for an Ansible role
 * @param fullName - The full role name (e.g., "geerlingguy.java")
 * @param type - The type of item (role or collection)
 * @returns The Ansible Galaxy URL
 */
export function getAnsibleGalaxyUrl(fullName: string | undefined, type: 'role' | 'collection' = 'role'): string {
  const baseUrl = 'https://galaxy.ansible.com/ui/standalone'
  const { namespace, name } = parseAnsibleName(fullName)
  
  if (!namespace || !name) {
    return baseUrl
  }

  if (type === 'collection') {
    return `${baseUrl}/collections/${namespace}/${name}`
  }
  
  return `${baseUrl}/roles/${namespace}/${name}`
}