'use client';

import { Button, CancelButton } from '@/components/button/button';
import { Modal } from '@/components/modal/Modal';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useProfile } from '@/hooks/profile';
import { useTRPC } from '@/lib/trpc';
import { extractUUIDFromSlug, formatDate } from '@/utils';
import { skipToken, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const DEFAULT_PROFILE_PICTURE =
  'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

export default function Profile() {
  const { launchModal, closeModal } = useModalContext();
  const { profile: loggedInProfile } = useAuth();
  const params = useParams();
  const slug = params.slug as string;

  const displayProfileId = extractUUIDFromSlug(slug);

  const isOwnProfile = loggedInProfile?.id === displayProfileId;

  const {
    profile: displayProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(displayProfileId);

  const { sendFriendRequest, cancelFriendRequest, isLoading } =
    useFriendRequest();

  if (isProfileLoading) {
    return <div>Loading chat...</div>;
  }
  if (profileError) {
    return <div>Error loading chat: {profileError.message}</div>;
  }
  if (!displayProfile) {
    return <div>Profile not found</div>;
  }

  const handleSendFriendRequest = async () => {
    if (!loggedInProfile || !displayProfileId) {
      console.error('Sender or receiver of friend request missing');
      return;
    }

    try {
      await sendFriendRequest({
        senderId: loggedInProfile?.id,
        receiverId: displayProfileId,
      });
      console.log('Friend Request sent successfully!');
      // TODO: add success popup?
    } catch (error) {
      console.error(error, 'Failed sending Friend Request');
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!loggedInProfile || !displayProfileId) {
      console.error('Sender or receiver of friend request missing');
      return;
    }
    try {
      await cancelFriendRequest({
        newStatus: 'CANCELLED',
        senderId: loggedInProfile?.id,
        receiverId: displayProfileId,
      });
      closeModal();
    } catch (error) {
      console.error(error, 'Failed cancelling Friend Request');
    }
  };

  const handleOpenCancelFriendRequestModal = () => {
    launchModal(
      <Modal
        header="Cancel Request?"
        content="Click to cancel friend request."
        buttons={[
          <CancelButton key="close" />,
          <Button
            key="cancel-request"
            label="Cancel Friend Request"
            onClick={handleCancelFriendRequest}
            className="bg-red-500 text-white"
          />,
        ]}
      />
    );
  };

  const {
    id: profileId,
    firstName,
    lastName,
    avatarUrl,
    createdAt,
    numOfChats,
    numOfFriends,
    numOfMessages,
    hasOutstandingFriendRequest,
  } = displayProfile;

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
            src={avatarUrl ?? '/default.png'}
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

        <div className="flex gap-5 justify-center">
          {isOwnProfile ? (
            // TODO: implement this, maybe combine with get byId in hook
            <button className="w-40 rounded-3xl text-white bg-brand-dark">
              Update Profile
            </button>
          ) : (
            <>
              <Button
                onClick={
                  hasOutstandingFriendRequest
                    ? handleOpenCancelFriendRequestModal
                    : handleSendFriendRequest
                }
                className={
                  hasOutstandingFriendRequest ? 'bg-gray-400' : 'bg-brand-dark'
                }
                label={
                  hasOutstandingFriendRequest ? 'Request Sent' : 'Add as Friend'
                }
              />

              <Button
                onClick={() => {}}
                className="w-30 border border-brand-light text-brand-light bg-white"
                label="Message"
              />
            </>
          )}
        </div>

        <div className="my-5 px-3 pt-1 pb-2 rounded-lg bg-white">
          <div className="mb-3">
            <h3 className="text-brand-dark">Activity</h3>
          </div>
          <div className="flex items-center justify-center divide-x divide-brand-light">
            <div className="flex flex-col items-center text-center px-6">
              <strong className="text-lg leading-none text-brand">
                {numOfChats}
              </strong>
              <small className="leading-none text-gray-500">Chats</small>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <strong className="text-lg leading-none text-brand">
                {numOfMessages}
              </strong>
              <small className="leading-none text-gray-500">Messages</small>
            </div>

            <Link href={`/profile/${profileId}/friends`}>
              <div className="flex flex-col items-center text-center px-6">
                <strong className="text-lg leading-none text-brand">
                  {numOfFriends}
                </strong>
                <small className="leading-none text-gray-500">Friends</small>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <small>{formattedJoinDate}</small>
        </div>
      </div>
    </div>
  );
}
