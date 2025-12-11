import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex justify-center items-center py-8">
      <Spinner />
      {message}
    </div>
  );
}
