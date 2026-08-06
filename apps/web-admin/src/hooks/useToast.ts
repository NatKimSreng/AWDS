import { toast } from 'sonner';

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') return toast.success(message, { duration: 4000 });
    if (type === 'error') return toast.error(message, { duration: 4000 });
    return toast.info(message, { duration: 4000 });
  };

  return { showToast };
}
