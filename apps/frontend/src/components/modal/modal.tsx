import { Button, ButtonProps } from '@/components/button/button';
import { useModalContext } from '@/context/ModalContext';
import { Fragment, ReactNode } from 'react';

interface ModalProps {
  header?: ReactNode;
  content?: ReactNode;
  buttons?: ReactNode[];
  className?: string;
}

export function Modal(props: ModalProps) {
  const { header, content, buttons = [], className } = props;
  const { showModal, closeModal } = useModalContext();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeModal}
      />
      <div
        className={`relative bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-lg z-10 ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={closeModal}
          aria-label="Close modal"
        >
          <i className="bi bi-x" />
        </button>
        {header && (
          <div className="mb-4">
            <h2>{header}</h2>
          </div>
        )}
        {content && (
          <div className="mb-4">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
        )}
        {buttons.length > 0 && (
          <div className="flex gap-2 mt-4 justify-end">
            {buttons.map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
