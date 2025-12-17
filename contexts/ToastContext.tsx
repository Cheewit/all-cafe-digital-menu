import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { ToastMessage } from '../types';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Ref to keep track of active messages for deduplication without causing re-renders
  const activeMessagesRef = useRef<Set<string>>(new Set());

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => {
      const toastToRemove = prevToasts.find(t => t.id === id);
      if (toastToRemove) {
        activeMessagesRef.current.delete(toastToRemove.message);
      }
      return prevToasts.filter(toast => toast.id !== id);
    });
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    // Deduplication: If this message is already showing, don't add another one.
    if (activeMessagesRef.current.has(message)) {
      return;
    }

    activeMessagesRef.current.add(message);
    
    // Use random to ensure uniqueness even if called multiple times in same ms
    const id = Date.now() + Math.random(); 
    
    const newToast: ToastMessage = {
      id,
      message,
      type,
    };

    setToasts(prevToasts => [...prevToasts, newToast]);

    // Auto-dismiss after 3 seconds (reduced from 5s for better UX on rate limits)
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};