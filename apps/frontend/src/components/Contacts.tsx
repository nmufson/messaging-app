import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { SearchInput } from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';
import { useInput } from '@/hooks/general';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { useFriends } from '@/hooks/profile';
import { ListProfileDTO, ObjectId } from '@repo/common';
import * as R from 'remeda';

// TODO: add optional param for filtering out specific contacts (ones already in the chat)
export function Contacts({
  onSelectProfile,
}: {
  onSelectProfile?: (profile: ListProfileDTO) => void;
}) {
  const { profile } = useAuth();
  const { value: searchInput, onChange: onSearchInputChange } = useInput();

  const { activeProfiles: activeFriends } = useOnlinePresence();

  const presenceIds = activeFriends?.map((friend) => friend.id);

  const { friends, isLoading, error } = useFriends(profile?.id ?? null);

  // TODO update this to send searchInput to backend along with pagination
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
    <>
      <div>
        <div className="border border-black flex">
          <i className="bi bi-search" />
          <SearchInput
            value={searchInput}
            onChange={onSearchInputChange}
            placeholder="Search by name or email..."
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredActiveFriends && filteredActiveFriends.length > 0 && (
          <div className="bg-white mb-4 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 px-6 py-3 border-b border-gray-200">
              Recently Active
            </h4>
            <div className="divide-y divide-gray-100">
              <ProfileList
                profiles={filteredActiveFriends}
                showPresence={true}
                onSelectProfile={onSelectProfile}
              />
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
                  <ProfileList
                    profiles={contacts}
                    onSelectProfile={onSelectProfile}
                  />
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
    </>
  );
}

interface ProfileListProps {
  profiles: ListProfileDTO[];
  showPresence?: boolean;
  onSelectProfile?: (profile: ListProfileDTO) => void;
}
function ProfileList(props: ProfileListProps) {
  const { profiles, showPresence = false, onSelectProfile } = props;
  console.log(onSelectProfile);
  return profiles.map((profile) => (
    <ProfilePreview
      key={profile.id}
      profile={profile}
      showPresence={showPresence}
      asLink={!onSelectProfile ? `/profile?profile=${profile.id}` : undefined}
      onClick={
        onSelectProfile
          ? () => {
              console.log('Profile clicked:', profile);
              onSelectProfile(profile);
            }
          : undefined
      }
    />
  ));
}
