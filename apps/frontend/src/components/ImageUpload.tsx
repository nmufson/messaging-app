'use client';

import { type ChangeEvent, useState } from 'react';
import { useTRPC } from '@/lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { UseControllerProps, useController } from 'react-hook-form';

export interface BaseImageUploadProps {
  label?: string;
  required?: boolean;
}

export type ImageUploadProps<T extends object> = BaseImageUploadProps &
  UseControllerProps<T>;

export function ImageUpload<T extends object>(props: ImageUploadProps<T>) {
  const trpc = useTRPC();

  const { label, required, ...controllerProps } = props;

  const {
    field,
    fieldState: { error },
  } = useController(controllerProps);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    field.value || null
  );

  const { mutateAsync: createUploadSignature, isPending } = useMutation(
    trpc.image.getImageUploadSignature.mutationOptions()
  );

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(e.target.files);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      // Show preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Get upload signature
      const { timestamp, signature, cloudName, apiKey } =
        await createUploadSignature();

      if (!cloudName || !apiKey) {
        console.error('Missing Cloudinary configuration');
        alert('Internal server error, please try again later.');
        return;
      }

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', apiKey);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log(data);

      // Update form with url from Cloudinary
      field.onChange(data.secure_url);
      setPreviewUrl(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl(null);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    field.onChange('');
  };

  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-4">
        {/* Preview */}
        {previewUrl && (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isPending}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              inline-block px-4 py-2 
              border border-gray-300 rounded-lg 
              cursor-pointer
              transition-colors
              ${
                isPending
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-50'
              }
            `}
          >
            {isPending
              ? 'Uploading...'
              : previewUrl
                ? 'Change Image'
                : 'Upload Image'}
          </label>
        </div>

        {/* Helper text */}
        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>

      {error && (
        <span className="block mt-1 text-sm text-red-600">{error.message}</span>
      )}
    </div>
  );
}
