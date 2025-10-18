import { Button, ButtonProps } from '@/components/button/button';
import { useModalContext } from '@/context/ModalContext';
import { Fragment, ReactNode } from 'react';

interface ModalProps {
  header?: ReactNode;
  content?: ReactNode;
  buttons?: ReactNode[];
}

export function Modal(props: ModalProps) {
  const { header, content, buttons = [] } = props;
  const { showModal, closeModal } = useModalContext();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative min-w-[300px] max-w-lg">
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
            <p>{content}</p>
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
