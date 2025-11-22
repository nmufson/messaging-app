import { useModalContext } from '@/context/ModalContext';
import { ReactNode } from 'react';

interface FullscreenModalProps {
  children: ReactNode;
  className?: string;
  title?: string;
  showHeader?: boolean;
}

export function FullscreenModal(props: FullscreenModalProps) {
  const { children, className, title, showHeader = true } = props;
  const { showModal, closeModal } = useModalContext();

  if (!showModal) return null;

  return (
    <div className="fixed bottom-0 z-50 bg-white overflow-y-auto flex flex-col w-full h-98/100">
      {showHeader && (
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={closeModal}
            className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
          >
            <i className="bi bi-caret-left-fill text-xl" />
          </button>
          {title && <p className="font-semibold text-lg">{title}</p>}
        </div>
      )}
      <div
        className={`flex-1 h-full w-full overflow-y-auto ${className ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}
