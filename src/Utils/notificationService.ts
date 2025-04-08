import toast from 'react-hot-toast';

export const notificationService = {
  showSuccess: (message: string) => {
    toast.success(message, {
      icon: '✅',
      style: {
        background: '#059669',
        color: '#fff',
      },
      duration: 3000,
    });
  },
  
  showError: (message: string) => {
    toast.error(message, {
      icon: '❌',
      style: {
        background: '#DC2626',
        color: '#fff',
      },
      duration: 4000,
    });
  },
  
  showLoading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#2563EB',
        color: '#fff',
      },
    });
  },
  
  dismissLoading: (toastId: string) => {
    toast.dismiss(toastId);
  }
};
