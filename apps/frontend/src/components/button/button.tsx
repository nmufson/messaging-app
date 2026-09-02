import { useModalContext } from '@/context/ModalContext';
import React, { MouseEvent, ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button(props: ButtonProps) {
  const {
    children,
    onClick,
    className = '',
    disabled = false,
    type = 'button',
  } = props;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-3xl shadow-md font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-light ${className} ${disabled ? 'bg-gray-400 cursor-not-allowed text-white' : ''}`}
    >
      {children}
    </button>
  );
}

export function CancelButton() {
  const { closeModal } = useModalContext();
  return (
    <Button
      onClick={closeModal}
      className="bg-white text-brand-dark border border-gray-300 hover:bg-gray-100"
    >
      Cancel
    </Button>
  );
}
