import { createContext, useContext, useState, useCallback } from 'react';
import styles from '../components/Toast.module.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error' }),
    info: (message, title = 'Notice') => addToast({ title, message, type: 'info' }),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'success': return styles.toastSuccess;
      case 'error': return styles.toastError;
      default: return styles.toastInfo;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${getTypeClass(t.type)}`}>
            <span className={styles.toastIcon} style={{
              color: t.type === 'success' ? 'var(--color-green)' : t.type === 'error' ? 'var(--color-amber)' : 'var(--color-ink-muted)'
            }}>
              {getIcon(t.type)}
            </span>
            <div className={styles.toastContent}>
              {t.title && <strong className={styles.toastTitle}>{t.title}</strong>}
              <p className={styles.toastMessage}>{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className={styles.toastClose}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
