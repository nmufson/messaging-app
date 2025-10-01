'use client';
import { useState } from 'react';
import { useTRPC } from '../../lib/trpc';
import { useQuery } from '@tanstack/react-query';

export default function Messages() {
  const trpc = useTRPC();
  const queryOptions = trpc.chat.getAll.queryOptions();

  const { data, isLoading, error } = useQuery(queryOptions);

  return <div className="bg-blue-500 flex">messages page</div>;
}
