import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
