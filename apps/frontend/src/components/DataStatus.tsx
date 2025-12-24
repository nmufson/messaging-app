import { ReactNode } from 'react';
import { TRPCClientErrorLike } from '@trpc/client';
import * as R from 'remeda';
import { AppRouter } from '@/lib/trpc';
import LoadingSpinner from './LoadingSpinner';

interface DataStatusProps<T> {
  data: T;
  isLoading?: boolean;
  error?: TRPCClientErrorLike<AppRouter> | null;
  resourceName?: string;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  className?: string;
  children?: ReactNode;
}

function DataStatus<T>(props: DataStatusProps<T>) {
  const {
    data,
    isLoading,
    error,
    resourceName = 'data',
    loadingMessage,
    errorMessage,
    emptyMessage,
    className,
    children,
  } = props;

  const isEmpty = !data || (R.isArray(data) && data.length === 0);

  const wrapper = (content: ReactNode) => (
    <div className={className}>{content}</div>
  );

  if (isLoading) {
    return (
      <LoadingSpinner
        message={loadingMessage ?? `Loading ${resourceName}...`}
      />
    );
  }

  if (error) {
    const message =
      errorMessage ?? `There was a problem loading ${resourceName}.`;
    return wrapper(error?.message ? `${message} (${error.message})` : message);
  }

  if (isEmpty) {
    return wrapper(emptyMessage ?? `No ${resourceName} to show.`);
  }

  return <>{children}</>;
}

export default DataStatus;
