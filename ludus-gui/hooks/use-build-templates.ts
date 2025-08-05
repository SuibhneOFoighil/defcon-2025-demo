import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dashboardQueryKeys } from './use-dashboard-data';
import { rangeAndTemplatesQueryKeys } from './use-range-and-templates';

interface BuildTemplatesRequest {
  template?: string;
  parallel?: number;
  verbose?: boolean;
}

interface BuildTemplatesResponse {
  result: string;
}

async function buildTemplates(params: BuildTemplatesRequest): Promise<BuildTemplatesResponse> {
  const response = await fetch('/api/ludus/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template: params.template || 'all',
      parallel: params.parallel || 3,
      verbose: params.verbose || false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to build templates');
  }

  return response.json();
}

export function useBuildTemplates() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: buildTemplates,
    onSuccess: (data) => {
      // Invalidate templates queries to refetch data
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.templates(),
      });
      queryClient.invalidateQueries({
        queryKey: rangeAndTemplatesQueryKeys.templates(),
      });
    },
  });

  const buildTemplatesWithToast = (params: BuildTemplatesRequest = {}) => {
    toast.promise(
      mutation.mutateAsync(params),
      {
        loading: 'Building templates with Packer...',
        success: 'Templates built successfully!',
        error: (err: Error) => `Failed to build templates: ${err.message}`,
      }
    );
  };

  return {
    buildTemplates: buildTemplatesWithToast,
    isBuilding: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
} 