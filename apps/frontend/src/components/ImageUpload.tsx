'use client';

import { type ChangeEvent, ReactNode, useState } from 'react';
import { useTRPC } from '@/lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { UseControllerProps, useController } from 'react-hook-form';
import { useSelectedValue } from '@/hooks/general';
import { Button } from './button/button';

export interface BaseImageUploadProps {
  label?: string;
  required?: boolean;
  imageClassName?: string;
  imageSize?: number;
  fallback?: ReactNode;
}

export type ImageUploadProps<T extends object> = BaseImageUploadProps &
  UseControllerProps<T>;

export function ImageUpload<T extends object>(props: ImageUploadProps<T>) {
  const trpc = useTRPC();

  const {
    label,
    required,
    imageClassName = '',
    imageSize,
    ...controllerProps
  } = props;
  let { fallback } = props;

  fallback = fallback ?? (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-500 ${imageClassName}`}
      style={imageSize ? { width: imageSize, height: imageSize } : {}}
    >
      <i className="bi bi-plus-lg text-2xl" />
    </div>
  );

  const {
    field,
    fieldState: { error },
  } = useController(controllerProps);

  const inputId = `image-upload-${controllerProps.name}`;

  const { value: previewUrl, onChange: onPreviewUrlChange } = useSelectedValue<
    string | null
  >(field.value || null);

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
      onPreviewUrlChange(localPreview);

      // Get upload signature
      const { timestamp, signature, cloudName, apiKey } =
        await createUploadSignature();

      if (!cloudName || !apiKey) {
        console.error('Missing Cloudinary configuration');
        alert('Internal server error, please try again later.');
        return;
      }

      // form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', apiKey);

      // upload
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

      // ppdate form with url from Cloudinary
      field.onChange(data.secure_url);
      onPreviewUrlChange(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      onPreviewUrlChange(null);
    }
  };

  const handleRemove = () => {
    onPreviewUrlChange(null);
    field.onChange('');
  };

  return (
    <div className="relative inline-block">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isPending}
        className="hidden"
        id={inputId}
      />

      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <label
        htmlFor={inputId}
        className={`cursor-pointer block ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'} transition-opacity`}
        style={imageSize ? { width: imageSize, height: imageSize } : {}}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Upload preview"
              className={imageClassName}
              style={imageSize ? { width: imageSize, height: imageSize } : {}}
            />
            <div className="absolute -top-2 -right-2 bg-brand-dark text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-brand-light transition-colors z-10 pointer-events-none">
              <i className="bi bi-pencil text-sm" />
            </div>
          </>
        ) : (
          fallback
        )}
      </label>

      {error && (
        <span className="block mt-1 text-sm text-red-600">{error.message}</span>
      )}
    </div>
  );
}
