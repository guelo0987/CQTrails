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
  },

  // Funciones específicas para autenticación
  auth: {
    loginSuccess: () => {
      toast.success('Inicio de sesión exitoso', {
        icon: '✅',
        style: {
          background: '#059669',
          color: '#fff',
        },
        duration: 3000,
      });
    },
    
    registerSuccess: () => {
      toast.success('Cuenta creada exitosamente', {
        icon: '✅',
        style: {
          background: '#059669',
          color: '#fff',
        },
        duration: 3000,
      });
    },
    
    logoutSuccess: () => {
      toast.success('Sesión cerrada exitosamente', {
        icon: '✅',
        style: {
          background: '#059669',
          color: '#fff',
        },
        duration: 3000,
      });
    },
    
    passwordResetSent: () => {
      toast.success('Se ha enviado un enlace de recuperación a tu correo', {
        icon: '✉️',
        style: {
          background: '#2563EB',
          color: '#fff',
        },
        duration: 4000,
      });
    }
  }
};
