'use client';

import { usePotentialChats } from '@/hooks/chat';
import { ObjectId } from '@repo/common';
import { useState } from 'react';

// TODO make friends list content, with both page and modal view

export function SearchModal() {
  const [searchNameInput, setSearchNameInput] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<ObjectId[]>([]);

  function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchNameInput(e.target.value);
  }

  const { potentialChats } = usePotentialChats({
    searchString: searchNameInput,
    selectedProfiles,
  });

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">New Message</h2>
        <button className="text-gray-500">Cancel</button>
      </header>
      <form className="flex items-center gap-2">
        <label htmlFor="chat-for" className="font-medium">
          For:
        </label>
        <div>// TODO: people we added (map over that)</div>
        <input
          id="chat-for"
          onChange={handleChangeSearch}
          className="flex-1 px-2 py-1 border rounded"
        />
        // TODO: click this for Friends List modal
        <button type="button" className="text-brand">
          <i className="bi bi-plus-circle" />
        </button>
      </form>
    </div>
  );
}

// TODO: figure out how this works with phone
export function WriteChat() {
  return (
    <form className="flex items-center gap-2 p-4">
      <button type="button" className="text-brand">
        <i className="bi bi-plus" />
      </button>
      <input className="flex-1 px-2 py-1 border rounded" />
    </form>
  );
}
