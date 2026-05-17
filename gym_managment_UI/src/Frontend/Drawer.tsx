import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'small' | 'medium' | 'large';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  title,
  onClose,
  children,
  width = 'medium'
}) => {
  const widthClasses = {
    small: 'w-96',
    medium: 'w-[600px]',
    large: 'w-[800px]'
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-screen ${widthClasses[width]} bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
};

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  children
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
