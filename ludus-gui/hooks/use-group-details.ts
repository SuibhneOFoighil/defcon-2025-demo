import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGroups, fetchGroupMembers, fetchGroupRanges, groupQueryKeys } from '@/lib/api/ludus/groups';
import { fetchUsers } from '@/lib/api/ludus/users';
import type { User, Group } from '@/lib/types/admin';

export function useGroupDetails(groupID: string) {
  const queryClient = useQueryClient();

  // Try to get the group from the cache first
  const cachedGroups = queryClient.getQueryData<Group[]>(groupQueryKeys.lists());
  const group = cachedGroups?.find(g => parseInt(g.id) === parseInt(groupID)) || null;

  // Only fetch groups if not in cache
  const groupsQuery = useQuery({
    queryKey: groupQueryKeys.lists(),
    queryFn: fetchGroups,
    enabled: !!groupID && !group, // Only fetch if we don't have the group in cache
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch group members
  const membersQuery = useQuery({
    queryKey: [...groupQueryKeys.detail(groupID), 'members'],
    queryFn: () => fetchGroupMembers(groupID),
    enabled: !!groupID,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch group ranges
  const rangesQuery = useQuery({
    queryKey: [...groupQueryKeys.detail(groupID), 'ranges'],
    queryFn: () => fetchGroupRanges(groupID),
    enabled: !!groupID,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all users to get full user details
  const usersQuery = useQuery({
    queryKey: ['users', 'list'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get the group from cache or fresh data
  const groupData = group || (groupsQuery.data ? groupsQuery.data.find(g => g.id === groupID) : null);

  // Combine the data - ensure we have arrays
  const groupMembers = Array.isArray(membersQuery.data) ? membersQuery.data : [];
  const groupRanges = Array.isArray(rangesQuery.data) ? rangesQuery.data : [];
  const allUsers = Array.isArray(usersQuery.data) ? usersQuery.data : [];

  // Debug logging
  console.log('Hook Debug:', {
    groupID,
    membersQuery: { 
      isLoading: membersQuery.isLoading, 
      error: membersQuery.error, 
      data: membersQuery.data 
    },
    usersQuery: {
      isLoading: usersQuery.isLoading,
      error: usersQuery.error,
      data: usersQuery.data?.length
    },
    groupMembers: groupMembers.length,
    allUsers: allUsers.length
  });

  // Map group members to full user objects
  const membersWithDetails = groupMembers.length > 0 ? groupMembers.map(member => {
    const userDetails = allUsers.find(user => user.userID === member.userID);
    return userDetails ? {
      ...userDetails,
      id: userDetails.userID, // Ensure id field exists
    } : {
      id: member.userID,
      userID: member.userID,
      name: member.name,
      isAdmin: false, // Default value
    } as User;
  }) : [];

  // Separate admins and regular members
  const admins = membersWithDetails.filter(user => user.isAdmin);
  const members = membersWithDetails.filter(user => !user.isAdmin);

  // Loading state
  const loading = (!group && groupsQuery.isLoading) || membersQuery.isLoading || rangesQuery.isLoading || usersQuery.isLoading;
  const isFetching = groupsQuery.isFetching || membersQuery.isFetching || rangesQuery.isFetching || usersQuery.isFetching;

  // Error handling
  const error = groupsQuery.error || membersQuery.error || rangesQuery.error || usersQuery.error;
  const errorMessage = error instanceof Error ? error.message : null;

  // Invalidate functions
  const invalidateGroupMembers = async () => {
    await queryClient.invalidateQueries({
      queryKey: [...groupQueryKeys.detail(groupID), 'members'],
    });
  };

  const invalidateGroupRanges = async () => {
    await queryClient.invalidateQueries({
      queryKey: [...groupQueryKeys.detail(groupID), 'ranges'],
    });
  };

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: groupQueryKeys.detail(groupID),
    });
  };

  return {
    group: groupData,
    admins,
    members,
    ranges: groupRanges,
    loading,
    isFetching,
    error: errorMessage,
    invalidateGroupMembers,
    invalidateGroupRanges,
    invalidateAll,
  };
}