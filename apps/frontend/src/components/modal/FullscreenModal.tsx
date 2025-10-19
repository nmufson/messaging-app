import { useModalContext } from '@/context/ModalContext';
import { ReactNode } from 'react';

interface FullscreenModalProps {
  children: ReactNode;
  className?: string;
}

export function FullscreenModal({ children, className }: FullscreenModalProps) {
  const { showModal, closeModal } = useModalContext();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col w-full h-98/100">
      <div className={`flex-1 h-full w-full ${className ?? ''}`}>
        {children}
      </div>
    </div>
  );
}
