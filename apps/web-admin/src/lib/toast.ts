import { toast, type ToastT } from 'sonner';

const defaultOptions: Partial<ToastT> = {
  duration: 4000,
};

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (type === 'success') {
    return toast.success(message, defaultOptions);
  }
  if (type === 'error') {
    return toast.error(message, defaultOptions);
  }
  return toast.info(message, defaultOptions);
}

export { toast };
