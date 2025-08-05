import type { User } from '@/lib/types/admin';

// Fetch all users from our Next.js API route
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/ludus/users');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  const users = await response.json();
  
  // Add selection state and map userID to id for compatibility
  return users.map((user: User) => ({
    ...user,
    id: user.userID, // Map userID to id for selection logic compatibility
    selected: false,
  }));
}

// Create a new user
export async function createUser(userData: {
  userName: string;
  userID: string;
  role: 'admin' | 'user';
}): Promise<User> {
  const response = await fetch('/api/ludus/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create user: ${response.statusText}`);
  }

  const newUser = (await response.json()).result as User;
  
  // Map userID to id for compatibility
  return newUser;
}

// Delete a user
export async function deleteUser(userID: string): Promise<void> {
  const response = await fetch(`/api/ludus/users/${userID}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete user: ${response.statusText}`);
  }
}

// Query keys for React Query
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...userQueryKeys.lists(), { filters }] as const,
  detail: (userID: string) => [...userQueryKeys.all, 'detail', userID] as const,
}; 