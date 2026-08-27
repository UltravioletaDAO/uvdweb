import { toast } from 'react-toastify';

// Toasts con el tema oscuro del sitio (audit ruleta 2026-08-27, W-13/W-23).
// Un solo lugar para las opciones: las páginas importan showToast y montan <ToastContainer theme="dark" />.
const BASE_OPTIONS = {
  position: 'top-center',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
};

export const showToast = {
  success: (message, options = {}) => toast.success(message, { ...BASE_OPTIONS, autoClose: 3000, ...options }),
  error: (message, options = {}) => toast.error(message, { ...BASE_OPTIONS, autoClose: 5000, ...options }),
  info: (message, options = {}) => toast.info(message, { ...BASE_OPTIONS, autoClose: 3000, ...options }),
  warning: (message, options = {}) => toast.warning(message, { ...BASE_OPTIONS, autoClose: 4000, ...options }),
};

export default showToast;
