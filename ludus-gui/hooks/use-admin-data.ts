import { useQueries, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, userQueryKeys } from '@/lib/api/ludus/users';
import { fetchGroups, groupQueryKeys } from '@/lib/api/ludus/groups';

export function useAdminData() {
  const queryClient = useQueryClient();
  
  // Use useQueries to fetch users (and groups when API is available)
  const queries = useQueries({
    queries: [
      {
        queryKey: userQueryKeys.lists(),
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 5, // 5 minutes for users
        refetchInterval: 1000 * 60 * 10, // Auto-refetch every 10 minutes
      },
      {
        queryKey: groupQueryKeys.lists(),
        queryFn: fetchGroups,
        staleTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60 * 10,
      },
    ],
  });

  const [usersQuery, groupsQuery] = queries;

  // Extract data with fallbacks
  const users = usersQuery.data || [];
  const groups = groupsQuery.data || [];

  // Determine overall loading state
  const loading = usersQuery.isLoading;

  // Determine if we're fetching in background (for subtle loading indicators)
  const isFetching = usersQuery.isFetching;

  // Handle errors
  const error = usersQuery.error;
  const errorMessage = error instanceof Error ? error.message : null;

  // Manual refetch function
  const refetch = () => {
    usersQuery.refetch();
  };

  // Invalidate and refetch users specifically
  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({
      queryKey: userQueryKeys.all,
    });
  };

  // Invalidate and refetch groups specifically
  const invalidateGroups = async () => {
    await queryClient.invalidateQueries({
      queryKey: groupQueryKeys.all,
    });
  };

  // Invalidate all admin data
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['users', 'groups'],
    });
  };

  return {
    users,
    groups,
    loading,
    isFetching,
    error: errorMessage,
    refetch,
    invalidateUsers,
    invalidateAll,
    invalidateGroups,
  };
} 