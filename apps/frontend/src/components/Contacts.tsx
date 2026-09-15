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

  const activeFriendIds = activeFriends?.map((friend) => friend.id);

  const { friends, isLoading, error } = useFriends(profile?.id ?? null);

  // TODO update this to send searchInput to backend along with pagination
  const matchesSearch = (profile: { firstName: string; lastName: string }) => {
    if (!searchInput.trim()) return true;
    const search = searchInput.toLowerCase();
    const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    return fullName.includes(search);
  };

  const filteredActiveFriends = R.pipe(
    activeFriends ?? [],
    R.filter(matchesSearch),
    R.filter((friend) => !R.isIncludedIn(friend.id, profilesToExclude)),
    R.sort((a, b) => {
      const aOnline = a.isOnline ?? false;
      const bOnline = b.isOnline ?? false;

      if (aOnline !== bOnline) {
        return aOnline ? -1 : 1;
      }

      // Preserve existing order of online friends
      if (aOnline) {
        return 0;
      }

      const aLastOnline = a.lastOnline?.toMillis() ?? 0;
      const bLastOnline = b.lastOnline?.toMillis() ?? 0;

      return bLastOnline - aLastOnline;
    })
  );

  const friendsNotInPresenceList = friends?.filter(
    (friend) => !R.isIncludedIn(friend.id, activeFriendIds || [])
  );

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <i className="bi bi-arrow-repeat animate-spin text-base text-brand" />
          Loading contacts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm font-medium text-red-600 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <i className="bi bi-exclamation-circle text-base" />
          Something went wrong while loading contacts.
        </div>
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
    <div className="flex h-full flex-col gap-4 mt-2 px-1">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-brand-neutral px-4 py-3 shadow-inner shadow-slate-100 transition focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]">
        <i className="bi bi-search text-base text-slate-400" />
        <SearchInput
          value={searchInput}
          onChange={onSearchInputChange}
          placeholder="Search by name or email..."
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-2">
        {filteredActiveFriends && filteredActiveFriends.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-brand-light/70 to-white px-5 py-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                Recently Active
              </h4>
              <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand">
                {filteredActiveFriends.length}
              </span>
            </div>
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
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                All Contacts
              </h4>
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {friends?.length ?? 0}
              </span>
            </div>

            {groupedContacts.map(({ letter, contacts }) => (
              <div key={letter}>
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-6 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 backdrop-blur-sm">
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            {searchInput.trim()
              ? 'No contacts match your search'
              : 'No contacts'}
          </div>
        )}
      </div>
    </div>
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
      className="w-full border-b border-slate-100 px-4 py-3 transition hover:bg-brand-neutral/80"
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
