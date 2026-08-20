'use client';
import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { SearchInput } from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useInput } from '@/hooks/general';
import { useTRPC } from '@/lib/trpc';
import { ObjectId } from '@repo/common';
import { skipToken, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Spinner } from 'react-bootstrap';

export default function FindFriends() {
  const trpc = useTRPC();
  const { profile } = useAuth();
  const { value: searchInput, onChange: onSearchInputChange } = useInput();
  const { sendFriendRequest, isLoading: isSendingRequest } = useFriendRequest();

  const {
    data: nonFriends,
    isLoading,
    error,
  } = useQuery(
    trpc.profile.nonFriends.queryOptions(
      searchInput ? { searchInput } : skipToken
    )
  );

  const addFriendButton = (profileId: ObjectId) => (
    <button
      onClick={() => handleAddFriend(profileId)}
      disabled={isSendingRequest}
      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
    >
      <i className="bi bi-person-plus mr-1" />
      Add
    </button>
  );

  const handleAddFriend = (receiverId: ObjectId) => {
    if (!profile) return;
    sendFriendRequest({ receiverId });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center pb-2">
        <Link href="/chats" className="no-underline text-inherit">
          <i className="bi bi-caret-left-fill text-3xl" />
        </Link>
        <h1 className="text-2xl font-semibold m-0">Find Friends</h1>
        <div></div>
      </div>
      <SearchInput
        value={searchInput}
        onChange={onSearchInputChange}
        placeholder="Search by name or email..."
        autoFocus
      />

      <div className="mt-6">
        {/* TODO: clean this up, maybe extract to component  */}
        {!searchInput ? (
          <div className="text-center text-gray-500 py-8">
            <i className="bi bi-people text-4xl mb-2 block" />
            <p>Search for people by name or email to add them as friends</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>Something went wrong. Please try again.</p>
          </div>
        ) : nonFriends && nonFriends.length > 0 ? (
          <ul className="space-y-1">
            {nonFriends.map((profile) => (
              <li key={profile.id}>
                <ProfilePreview
                  profile={profile}
                  showPresence
                  rightContent={addFriendButton(profile.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No results found for "{searchInput}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
