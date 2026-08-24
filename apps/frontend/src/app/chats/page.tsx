'use client';
import { useChatList } from '@/hooks/chat';
import { ChatPreview } from './ChatPreview';
import { MessageSearchBar } from './SearchBar';
import MainHeader from '@/components/mainHeader/mainHeader';

export default function ChatList() {
  const { chats, isLoading, error } = useChatList();

  if (isLoading)
    return (
      <div className="min-h-screen bg-brand-accent p-6 text-slate-700">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-brand-accent p-6 text-slate-700">
        Error: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-accent px-3 py-3 sm:px-4 md:px-6">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <MainHeader />
        <div className="px-3 pb-3 sm:px-4">
          <MessageSearchBar />
        </div>

        <main className="flex-1 bg-slate-50/80">
          {!chats || chats.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-600">
              <div>No chats yet</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {chats.map((chat) => (
                <ChatPreview key={chat.id} chat={chat} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
