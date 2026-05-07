'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import * as css from './Toast.css';
import { useToastStore, type ToastType } from '@/stores/toastStore';

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
}

function ToastItem({ id, type, message }: ToastItemProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [exiting, setExiting] = useState(false);
  const Icon = ICONS[type];

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => removeToast(id), 200);
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, 4000);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className={css.toast({ type, exiting })}>
      <Icon className={css.toastIcon} />
      <span className={css.toastMessage}>{message}</span>
      <button className={css.toastClose} onClick={handleClose} aria-label="关闭">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className={css.toastContainer}>
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} type={t.type} message={t.message} />
      ))}
    </div>
  );
}
