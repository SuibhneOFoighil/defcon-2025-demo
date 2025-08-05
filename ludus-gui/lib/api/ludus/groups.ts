import { Group } from "@/lib/types/admin";

export async function fetchGroups(): Promise<Group[]> {
  const response = await fetch('/api/ludus/groups');

  if (!response.ok) {
    throw new Error(`Failed to fetch groups: ${response.statusText}`);
  }

  const data = await response.json();

  return data.result
}

export async function createGroup(groupData: { name: string; description?: string }): Promise<{ result: string }> {
  const response = await fetch('/api/ludus/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to create group: ${errorMessage}`);
  }

  const data = await response.json();

  return data;
}

export async function deleteGroup(groupID: string): Promise<void> {
  const response = await fetch(`/api/ludus/groups/${groupID}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to delete group: ${errorMessage}`);
  }
}

export async function fetchGroupMembers(groupID: string): Promise<Array<{ userID: string; name: string }>> {
  const response = await fetch(`/api/ludus/groups/${groupID}/users`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to fetch group members: ${errorMessage}`);
  }

  const data = await response.json();
  console.log('fetchGroupMembers response:', data);
  
  // Handle both wrapped and unwrapped responses
  return Array.isArray(data) ? data : (data?.result || []);
}

export async function fetchGroupRanges(groupID: string): Promise<Array<{ rangeNumber: number; userID: string; rangeState: string }>> {
  const response = await fetch(`/api/ludus/groups/${groupID}/ranges`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to fetch group ranges: ${errorMessage}`);
  }

  const data = await response.json();
  console.log('fetchGroupRanges response:', data);
  
  // Handle both wrapped and unwrapped responses
  return Array.isArray(data) ? data : (data?.result || []);
}

export async function addUserToGroup(groupID: string, userID: string): Promise<void> {
  const response = await fetch(`/api/ludus/groups/${groupID}/users/${userID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to add user to group: ${errorMessage}`);
  }
}

export async function removeUserFromGroup(groupID: string, userID: string): Promise<void> {
  const response = await fetch(`/api/ludus/groups/${groupID}/users/${userID}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to remove user from group: ${errorMessage}`);
  }
}

export async function fetchAccessibleRanges(): Promise<Array<{ rangeNumber: number; userID: string; rangeState: string }>> {
  const response = await fetch('/api/ludus/ranges/accessible');

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to fetch accessible ranges: ${errorMessage}`);
  }

  const data = await response.json();
  console.log('fetchAccessibleRanges response:', data);
  
  // Handle both wrapped and unwrapped responses
  return Array.isArray(data) ? data : (data?.result || []);
}

export async function addRangeToGroup(groupID: string, rangeNumber: number): Promise<void> {
  const response = await fetch(`/api/ludus/groups/${groupID}/ranges/${rangeNumber}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to add range to group: ${errorMessage}`);
  }
}

export async function removeRangeFromGroup(groupID: string, rangeNumber: number): Promise<void> {
  const response = await fetch(`/api/ludus/groups/${groupID}/ranges/${rangeNumber}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText;
    throw new Error(`Failed to remove range from group: ${errorMessage}`);
  }
}

// Query keys for React Query
export const groupQueryKeys = {
    all: ['groups'] as const,
    lists: () => [...groupQueryKeys.all, 'list'] as const,
    list: (filters: string) => [...groupQueryKeys.lists(), { filters }] as const,
    detail: (groupID: string) => [...groupQueryKeys.all, 'detail', groupID] as const,
}; 