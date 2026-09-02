import { ChangeEvent, useCallback, useState } from 'react';
import * as R from 'remeda';

export function useToggle(initialStatus: boolean = false) {
  const [status, setStatus] = useState(initialStatus);

  const toggleStatus = () => setStatus((prev) => !prev);

  return { status, setStatus, toggleStatus };
}

export function useInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return { value, setValue, onChange };
}

export function useSelectedValue<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  const handleChange = (newValue: T) => {
    setValue(newValue);
  };

  return { value, setValue, handleChange };
}

export function useSelectedValues<T>(initialValues: T[] = []) {
  const [values, setValues] = useState<T[]>(initialValues);

  const add = (item: T) => {
    setValues((prev) => (prev.includes(item) ? prev : [...prev, item]));
  };

  const remove = (item: T) => {
    setValues((prev) => prev.filter((v) => v !== item));
  };

  const removeBy = (predicate: (item: T) => boolean) => {
    setValues((prev) => prev.filter((v) => !predicate(v)));
  };

  const toggle = (item: T) => {
    setValues((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const clear = useCallback(() => {
    setValues([]);
  }, []);

  const has = (item: T) => R.isIncludedIn(item, values);

  const hasAny = values.length > 0;

  return {
    values,
    setValues,
    add,
    remove,
    removeBy,
    toggle,
    clear,
    has,
    hasAny,
  };
}
