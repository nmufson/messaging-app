'use client';
import { BackButton } from '@/components/button/BackButton';
import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { SearchInput } from '@/components/SearchInput';
import { useNavigation } from '@/utils/Navigation';
import { useInput } from '@/hooks/general';
import { useTRPC } from '@/lib/trpc';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Spinner } from 'react-bootstrap';

export default function FindFriends() {
  const trpc = useTRPC();
  const { value: searchInput, onChange: onSearchInputChange } = useInput();
  const { navigateToProfile } = useNavigation();

  const {
    data: nonFriends,
    isLoading,
    error,
  } = useQuery(
    trpc.profile.nonFriends.queryOptions(
      searchInput ? { searchInput } : skipToken
    )
  );

  return (
    <div className="min-h-screen bg-brand-accent px-3 py-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
          <BackButton href="/chats" />
          <div className="text-center">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">
              Find Friends
            </h1>
            <p className="text-xs text-slate-500">
              Search and add people quickly
            </p>
          </div>
          <div className="h-10 w-10" />
        </div>

        <div className="px-4 py-4 sm:px-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <SearchInput
              value={searchInput}
              onChange={onSearchInputChange}
              placeholder="Search by name or email..."
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-5">
          {/* TODO: clean this up, maybe extract to component  */}
          {!searchInput ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              <i className="bi bi-people mb-3 block text-4xl text-brand" />
              <p>Search for people by name or email to add them as friends</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
              <p>Something went wrong. Please try again.</p>
            </div>
          ) : nonFriends && nonFriends.length > 0 ? (
            <ul className="space-y-3">
              {nonFriends.map((profile) => (
                <li key={profile.id}>
                  <ProfilePreview
                    profile={profile}
                    showPresence
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:border-brand-light hover:bg-brand-neutral"
                    onClick={() => navigateToProfile(profile.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
              <p>No results found for "{searchInput}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
