import { ReactNode } from 'react';
import * as R from 'remeda';

interface DataStatusProps<T> {
  data: T;
  isLoading?: boolean;
  error?: Error | null;
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

  const isEmpty = data == null || (R.isArray(data) && data.length === 0);

  const wrapper = (content: ReactNode) => (
    <div className={className}>{content}</div>
  );

  if (isLoading) {
    return wrapper(loadingMessage ?? `Loading ${resourceName}...`);
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
