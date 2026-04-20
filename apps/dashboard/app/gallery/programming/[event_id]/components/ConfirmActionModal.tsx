import React from "react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // If true, the confirm button is red
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 space-y-4">
          <h2 className="text-xl font-normal text-dark">{title}</h2>
          <p className="text-sm text-neutral-500 tracking-wide leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-8 py-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-4 rounded-b-sm">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium tracking-widest uppercase text-neutral-500 hover:text-dark transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-6 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors duration-300 rounded-sm shadow-sm text-white ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-dark hover:bg-neutral-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
