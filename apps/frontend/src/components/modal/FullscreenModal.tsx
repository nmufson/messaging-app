import { BackButton } from '@/components/button/BackButton';
import { useModalContext } from '@/context/ModalContext';
import { ReactNode } from 'react';

interface FullscreenModalProps {
  children: ReactNode;
  className?: string;
  header?: string;
  showHeader?: boolean;
}

export function FullscreenModal(props: FullscreenModalProps) {
  const { children, className, header, showHeader = true } = props;
  const { showModal, closeModal } = useModalContext();

  if (!showModal) return null;

  return (
    <div className="full-screen-modal fixed bottom-0 z-50 bg-white overflow-y-auto flex flex-col w-full h-100/100">
      {showHeader && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 flex-shrink-0">
          <BackButton
            onClick={closeModal}
            className="h-10 w-10 border-gray-200 bg-white text-slate-700 shadow-none hover:bg-gray-100"
            iconClassName="text-xl"
          />
          {header && <p className="font-bold text-2xl">{header}</p>}
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
