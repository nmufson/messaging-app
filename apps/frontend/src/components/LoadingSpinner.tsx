import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  spinnerClassName?: string;
}

export default function LoadingSpinner({
  message,
  className = '',
  spinnerClassName = 'w-4 h-4',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      <Spinner
        animation="border"
        className={`border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 ${spinnerClassName}`}
      />
      {message}
    </div>
  );
}
