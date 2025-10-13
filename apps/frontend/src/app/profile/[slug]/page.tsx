'use client';

import { useTRPC } from '@/lib/trpc';
import { extractUUIDFromSlug, formatDate } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { last } from 'remeda';

const SAMPLE_HEADER =
  'https://marketplace.canva.com/EADaosozdz0/1/0/1600w/canva-purple-sky-profile-header-XBJ23wlhl0s.jpg';

export default function Profile() {
  const trpc = useTRPC();
  const params = useParams();
  const slug = params.slug as string;

  const profileId = extractUUIDFromSlug(slug);

  if (!profileId) {
    console.log('No profileId provided');
    return null;
  }

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery(trpc.profile.byId.queryOptions({ profileId }));
  console.log(profile);
  if (isLoading) {
    return <div>Loading chat...</div>;
  }

  if (error) {
    return <div>Error loading chat: {error.message}</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }
  const { firstName, lastName, profilePictureUrl, createdAt } = profile;
  const formattedJoinDate = `Joined ${formatDate(createdAt)}`;
  let usersHeader;
  const displayName = `${firstName} ${lastName}`;

  return (
    <div className="flex flex-col items-center">
      {/* header */}
      <div className="relative h-50 w-full">
        {usersHeader ? (
          <img
            src={usersHeader}
            alt="Header"
            className="w-full h-40 md:h-56 object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-40 md:h-56 bg-gradient-to-r from-brand to-brand-light" />
        )}
        <div className="absolute left-1/2 top-60/100 -translate-x-1/2 -translate-y-1/2 z-1">
          <img
            src={profilePictureUrl ?? '/default.png'}
            alt="Profile"
            className="w-33 h-33 rounded-full border-4 border-brand-light shadow-lg object-cover"
          />
        </div>
      </div>

      {/* content */}
      <div className="px-4">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl text-brand-dark">{displayName}</h1>
          <p className="text-sm text-brand-accent">Title (add to model)</p>
        </div>

        <div className="flex justify-center text-center my-5">
          <p>This is where the bio will go. add bios after migration</p>
        </div>

        <div className="flex gap-5">
          {/* ! will need auth profile for this  */}
          <button className="w-40 rounded-3xl text-white bg-brand-dark">
            Add as Friend
          </button>
          <button className="w-30 rounded-3xl border border-brand-light text-brand-light bg-white">
            Message
          </button>
        </div>

        <div className="my-5 px-3 pt-1 pb-2 rounded-lg bg-white">
          <div className="mb-3">
            <h3 className="text-brand-dark">Activity</h3>
          </div>
          <div className="flex items-center justify-center divide-x divide-brand-light">
            <div className="flex flex-col items-center text-center px-6">
              <strong className="text-lg leading-none text-brand">123</strong>
              <small className="leading-none text-gray-500">Chats</small>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <strong className="text-lg leading-none text-brand">123</strong>
              <small className="leading-none text-gray-500">Messages</small>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <strong className="text-lg leading-none text-brand">123</strong>
              <small className="leading-none text-gray-500">Friends</small>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <small>{formattedJoinDate}</small>
        </div>
      </div>
    </div>
  );
}
