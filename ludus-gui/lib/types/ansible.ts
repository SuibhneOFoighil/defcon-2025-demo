export interface AnsibleItem {
  name?: string
  version?: string
  type?: string
  global?: boolean
}

export interface InstallRoleRequest {
  role?: string
  version?: string
  force?: boolean
  action?: string
  global?: boolean
}

export interface InstallCollectionRequest {
  collection?: string
  version?: string
  force?: boolean
}

export interface AnsibleOperationResponse {
  result?: string
}

export interface AnsibleErrorResponse {
  error?: string
}

export type AnsibleItemType = 'role' | 'collection'

export type AnsibleAction = 'install' | 'remove'