import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { SearchInput } from '@/components/SearchInput';
import { useAuth } from '@/context/AuthContext';
import { useInput } from '@/hooks/general';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { useFriends } from '@/hooks/profile';
import { BaseProfileDTO, ObjectId } from '@repo/common';
import * as R from 'remeda';

interface ContactsProps {
  onSelectProfile?: (profile: BaseProfileDTO) => void;
  profilesToExclude?: ObjectId[];
}

// TODO: add optional param for filtering out specific contacts (ones already in the chat)
export function Contacts(props: ContactsProps) {
  const { onSelectProfile, profilesToExclude = [] } = props;
  const { profile } = useAuth();
  const { value: searchInput, onChange: onSearchInputChange } = useInput();

  const { activeProfiles: activeFriends } = useOnlinePresence({
    friendsOnly: true,
  });

  const presenceIds = activeFriends?.map((friend) => friend.id);

  const { friends, isLoading, error } = useFriends(profile?.id ?? null);

  // TODO update this to send searchInput to backend along with pagination
  const matchesSearch = (profile: { firstName: string; lastName: string }) => {
    if (!searchInput.trim()) return true;
    const search = searchInput.toLowerCase();
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    return fullName.includes(search);
  };

  const filteredActiveFriends = activeFriends
    ?.filter(matchesSearch)
    .filter((friend) => !R.isIncludedIn(friend.id, profilesToExclude));

  const friendsNotInPresenceList = friends?.filter(
    (friend) => !R.isIncludedIn(friend.id, presenceIds || [])
  );

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
        Loading contacts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600 shadow-sm">
        Something went wrong while loading contacts.
      </div>
    );
  }

  const groupedContacts = R.pipe(
    friendsNotInPresenceList || [],
    R.filter(matchesSearch),
    R.filter((friend) => !R.isIncludedIn(friend.id, profilesToExclude)),
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
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <i className="bi bi-search text-slate-400" />
          <SearchInput
            value={searchInput}
            onChange={onSearchInputChange}
            placeholder="Search by name or email..."
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-2">
        {filteredActiveFriends && filteredActiveFriends.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <h4 className="border-b border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recently Active
            </h4>
            <div className="divide-y divide-slate-100">
              <ProfileList
                profiles={filteredActiveFriends}
                showPresence={true}
                onSelectProfile={onSelectProfile}
              />
            </div>
          </div>
        )}
        {groupedContacts.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <h4 className="border-b border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              All Contacts
            </h4>

            {groupedContacts.map(({ letter, contacts }) => (
              <div key={letter}>
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-brand-neutral px-6 py-2 text-sm font-bold text-brand-dark">
                  {letter}
                </div>
                <div className="divide-y divide-slate-100">
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
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
  profiles: BaseProfileDTO[];
  showPresence?: boolean;
  onSelectProfile?: (profile: BaseProfileDTO) => void;
}
function ProfileList(props: ProfileListProps) {
  const { profiles, showPresence = false, onSelectProfile } = props;

  return profiles.map((profile) => (
    <ProfilePreview
      key={profile.id}
      profile={profile}
      showPresence={showPresence}
      asLink={!onSelectProfile ? `/profile?profile=${profile.id}` : undefined}
      onClick={
        onSelectProfile
          ? () => {
              onSelectProfile(profile);
            }
          : undefined
      }
    />
  ));
}
