'use client';

import { ToastProvider } from './ToastProvider';

export default function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

