import { useQuery } from '@tanstack/react-query';

interface TemplateStatus {
  template: string;
  user: string;
}

async function fetchTemplatesStatus(): Promise<TemplateStatus[]> {
  const response = await fetch('/api/ludus/templates/status');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch templates status: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data || [];
}

export const templatesStatusQueryKeys = {
  all: ['templatesStatus'] as const,
  status: () => [...templatesStatusQueryKeys.all, 'status'] as const,
};

export function useTemplatesStatus() {
  const query = useQuery({
    queryKey: templatesStatusQueryKeys.status(),
    queryFn: fetchTemplatesStatus,
    staleTime: 1000 * 30, // 30 seconds - building status changes more frequently
    refetchInterval: 1000 * 10, // Poll every 10 seconds while building
    refetchIntervalInBackground: true,
  });

  const buildingTemplates = query.data || [];
  const isAnyTemplateBuilding = buildingTemplates.length > 0;

  return {
    buildingTemplates,
    isAnyTemplateBuilding,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
} 