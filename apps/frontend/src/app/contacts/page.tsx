'use client';

import { BackButton } from '@/components/button/BackButton';
import { Contacts } from '@/components/Contacts';

export default function ContactsPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between">
        <BackButton href="/chats" iconClassName="text-3xl" />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Contacts
        </h1>
        <div></div>
      </div>
      <Contacts />
    </div>
  );
}
