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
  label: string;
  floatingLabel?: boolean;
  noLabel?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  as?: 'input' | 'textarea' | 'select';
}

export type InputGroupProps<T extends object> = BaseInputGroupProps &
  UseControllerProps<T>;

export function InputGroup<T extends object>(props: InputGroupProps<T>) {
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
    <Form.Group className="mb-3">
      <Form.Label className={disabled ? 'text-muted' : ''}>{label}</Form.Label>
      <Form.Control
        {...field}
        as={as}
        type={as ? undefined : type}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={!!error}
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
