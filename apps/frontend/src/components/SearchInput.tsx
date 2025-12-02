import { ChangeEvent } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput(props: SearchInputProps) {
  const {
    value,
    onChange,
    placeholder = 'Search...',
    autoFocus = false,
  } = props;

  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
      <i className="bi bi-search text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 outline-none bg-transparent"
      />
    </div>
  );
}
