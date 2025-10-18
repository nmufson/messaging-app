import React from 'react';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  const { label, onClick, className = '', disabled = false } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-3xl shadow-md px-6 py-2 font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-light ${className} ${disabled ? 'bg-gray-400 cursor-not-allowed text-white' : ''}`}
    >
      {label}
    </button>
  );
}
