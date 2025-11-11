'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const styles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-2">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-full ${
              type === 'danger' ? 'bg-red-100' :
              type === 'warning' ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${
                type === 'danger' ? 'text-red-600' :
                type === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-2 py-1 text-xs text-white rounded-lg transition-colors ${styles[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

