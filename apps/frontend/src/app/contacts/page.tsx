'use client';

import * as R from 'remeda';
import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { useFriends } from '@/hooks/profile';
import { useInput } from '@/hooks/general';

export default function Contacts() {
  const { profile } = useAuth();
  const { value: searchInput, onChange: onSearchInputChange } = useInput();

  const { activeProfiles: activeFriends } = useOnlinePresence();

  const presenceIds = activeFriends?.map((friend) => friend.id);

  const { friends, isLoading, error } = useFriends(profile?.id ?? null);

  const matchesSearch = (profile: { firstName: string; lastName: string }) => {
    if (!searchInput.trim()) return true;
    const search = searchInput.toLowerCase();
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    return fullName.includes(search);
  };

  const filteredActiveFriends = activeFriends?.filter(matchesSearch);

  const friendsNotInPresenceList = friends?.filter(
    (friend) => !R.isIncludedIn(friend.id, presenceIds || [])
  );

  const groupedContacts = R.pipe(
    friendsNotInPresenceList || [],
    R.filter(matchesSearch),
    R.sortBy((friend) => friend.lastName.toLowerCase()), // sort the by last name
    R.groupBy((friend) => friend.lastName.charAt(0).toUpperCase()),
    R.entries(),
    R.map(([letter, contacts]) => ({
      letter,
      contacts,
    }))
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between">
        <Link href="/chats" className="no-underline text-inherit">
          <i className="bi bi-caret-left-fill text-3xl" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Contacts
        </h1>
        <div></div>
      </div>
      <div>
        <div className="border border-black">
          <i className="bi bi-search" />
          <input
            type="text"
            value={searchInput}
            onChange={onSearchInputChange}
          ></input>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredActiveFriends && filteredActiveFriends.length > 0 && (
          <div className="bg-white mb-4 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 px-6 py-3 border-b border-gray-200">
              Recently Active
            </h4>
            <div className="divide-y divide-gray-100">
              {filteredActiveFriends.map((profile) => {
                return (
                  <ProfilePreview
                    key={profile.id}
                    profile={profile}
                    showPresence={true}
                    asLink={`/profile?profile=${profile.id}`}
                  />
                );
              })}
            </div>
          </div>
        )}
        {groupedContacts.length > 0 && (
          <div className="bg-white shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 px-6 py-3 border-b border-gray-200">
              All Contacts
            </h4>

            {groupedContacts.map(({ letter, contacts }) => (
              <div key={letter}>
                <div className="sticky top-0 bg-blue-50 px-6 py-2 font-bold text-sm text-blue-900 border-b border-blue-100 z-10">
                  {letter}
                </div>
                <div className="divide-y divide-gray-100">
                  {contacts.map((profile) => (
                    <ProfilePreview
                      key={profile.id}
                      profile={profile}
                      asLink={`/profile?profile=${profile.id}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!groupedContacts.length && !filteredActiveFriends?.length && (
          <div className="px-6 py-4 text-gray-500 text-center">
            {searchInput.trim()
              ? 'No contacts match your search'
              : 'No contacts'}
          </div>
        )}
      </div>
    </div>
  );
}
