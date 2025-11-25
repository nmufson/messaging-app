'use client';
import { z } from '@repo/common';
import { useState } from 'react';
import * as R from 'remeda';
import { ImageUpload } from '@/components/ImageUpload';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';

const ProfileFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  headerUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(200, 'Bio must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});
export type ProfileForm = z.infer<typeof ProfileFormSchema>;

const ProfileFormKey = z.enum([
  'firstName',
  'lastName',
  'avatarUrl',
  'headerUrl',
  'bio',
]);
type ProfileFormKey = z.infer<typeof ProfileFormKey>;

const INITIAL_FORM: ProfileForm = {
  firstName: '',
  lastName: '',
  avatarUrl: '',
  headerUrl: '',
  bio: '',
};

type FieldConfig = {
  name: keyof ProfileForm;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'date'
    | 'image';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

const FIELD_CONFIG: FieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
  },
  {
    name: 'avatarUrl',
    label: 'Profile Picture',
    type: 'image',
  },
  {
    name: 'headerUrl',
    label: 'Header Image',
    type: 'image',
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'text',
    placeholder: 'Tell us about yourself...',
    maxLength: 200,
  },
];

export default function CreateProfile() {
  const trpc = useTRPC();
  const [profileForm, setProfileForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileForm, string>>
  >({});

  // Returns a change handler for a specific field
  const handleFieldChange = (field: keyof ProfileForm, value: string) => {
    // Update form state
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // validation
    const fieldSchema = ProfileFormSchema.shape[field];
    const result = fieldSchema.safeParse(value);

    if (result.success) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0]?.message || 'Invalid value',
      }));
    }
  };

  const { mutateAsync: createProfile, isPending } = useMutation(
    trpc.profile.create.mutationOptions({
      onSuccess: () => {},
    })
  );

  const handleSubmitProfileForm = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      createProfile(profileForm);
    } catch (error) {
      console.error(error, 'Failed to create profile.');
    }
  };

  return (
    <form onSubmit={handleSubmitProfileForm}>
      <h1>Create your profile here!</h1>

      <div>
        {FIELD_CONFIG.map((field) =>
          field.type === 'image' ? (
            <ImageUpload
              key={field.name}
              fieldName={field.name}
              label={field.label}
              value={profileForm[field.name] || ''}
              onChange={(url) => handleFieldChange(field.name, url)}
              error={errors[field.name]}
              setErrors={setErrors}
              required={field.required}
            />
          ) : (
            <InputGroup<ProfileForm>
              key={field.name}
              type={field.type}
              label={field.label}
              name={field.name}
              value={profileForm[field.name] || ''}
              onChange={handleFieldChange}
              error={errors[field.name]}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.maxLength}
            />
          )
        )}
      </div>
      <button>Done</button>
    </form>
  );
}

interface InputGroupProps<T extends Record<string, unknown>> {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  label?: string;
  name: keyof T & string;
  value: string;
  onChange: (field: keyof T & string, value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  minLength?: number;
}

export function InputGroup<T extends Record<string, unknown>>(
  props: InputGroupProps<T>
) {
  const {
    type,
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    helperText,
    maxLength,
    minLength,
  } = props;

  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        className={`
          w-full px-4 py-2 
          border rounded-lg 
          focus:outline-none focus:ring-2 
          transition-colors
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        aria-invalid={R.isTruthy(error)}
        aria-describedby={
          error ? `${name}-error` : helperText ? `${name}-helper` : undefined
        }
      />
      {error && (
        <span id={`${name}-error`} className="block mt-1 text-sm text-red-600">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span
          id={`${name}-helper`}
          className="block mt-1 text-sm text-gray-500"
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
