import { vestResolver } from '@hookform/resolvers/vest';
import { Form } from 'react-bootstrap';
import { UseControllerProps, useController } from 'react-hook-form';
import * as R from 'remeda';

export type InputType =
  | 'text'
  | 'textArea'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date';

export interface BaseInputGroupProps {
  type: InputType;
  label?: string;
  floatingLabel?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  as?: 'input' | 'textarea' | 'select';
}

export type TextFieldGroupProps<T extends object> = BaseInputGroupProps &
  UseControllerProps<T>;

export function TextFieldGroup<T extends object>(
  props: TextFieldGroupProps<T>
) {
  const {
    type,
    label,
    placeholder,
    disabled = false,
    helperText,
    as,
    ...controllerProps
  } = props;

  const {
    field,
    fieldState: { error },
  } = useController(controllerProps);

  return (
    <Form.Group className="mb-4 flex flex-col gap-1.5">
      {label && (
        <Form.Label className={disabled ? 'text-muted' : ''}>
          {label}
        </Form.Label>
      )}
      <Form.Control
        {...field}
        as={as}
        type={as ? undefined : type}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={!!error}
        className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error.message}
        </Form.Control.Feedback>
      )}
      {!error && helperText && (
        <Form.Text className="text-muted">{helperText}</Form.Text>
      )}
    </Form.Group>
  );
}

export type FieldConfig<T> = {
  name: keyof T;
  label: string;
  type: InputType | 'image';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};
