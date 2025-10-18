import React from 'react';
import { Button, ButtonProps } from '@/components/button/button';

interface ModalProps {
  header?: React.ReactNode;
  content?: React.ReactNode;
  buttons?: ButtonProps[];
}

export function Modal(props: ModalProps) {
  const { header, content, buttons = [] } = props;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative min-w-[300px] max-w-lg">
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
            {buttons.map((btn, i) => (
              <Button key={i} {...btn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
