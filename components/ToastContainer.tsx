import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (typeof document === 'undefined') {
    return null;
  }

  // Changed positioning to top-center (left-1/2 -translate-x-1/2) with padding (px-4)
  // This ensures the toast and its close button are always within the viewport on small screens.
  return createPortal(
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] w-full max-w-sm px-4 space-y-3 pointer-events-none flex flex-col items-center">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;