import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteTemplateRequest {
  name: string;
}

async function deleteTemplate({ name }: DeleteTemplateRequest) {
  const response = await fetch(`/api/ludus/templates?name=${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(errorData);
    throw new Error(errorData.error || 'Failed to delete template');
  }

  return response.json();
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: (data, variables) => {
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      
      // Show success toast
      toast.success(`Template "${variables.name}" deleted successfully`);
    },
    onError: (error: Error, variables) => {
      // Show error toast
      toast.error(`Failed to delete template "${variables.name}": ${error.message}`);
    },
  });
}