'use client';
import { Button, CancelButton } from '@/components/button/button';
import { Modal, ModalActions } from '@/components/modal/Modal';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useProfile } from '@/hooks/profile';
import { formatDisplayDate } from '@/utils';
import { ObjectId } from '@repo/common';
import Link from 'next/link';
import { UpdateProfileModal } from './updateProfileModal';

export function ProfileContent({ profileId }: { profileId: ObjectId }) {
  const { launchModal, closeModal } = useModalContext();
  const { profile: loggedInProfile } = useAuth();

  const isOwnProfile = loggedInProfile?.id === profileId;

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(profileId);

  const { sendFriendRequest, updateFriendRequest, isLoading } =
    useFriendRequest();

  if (isProfileLoading) {
    return <div>Loading chat...</div>;
  }
  if (profileError) {
    return <div>Error loading chat: {profileError.message}</div>;
  }
  if (!profile) {
    return <div>Profile not found</div>;
  }

  const handleSendFriendRequest = async () => {
    if (!loggedInProfile || !profileId) {
      console.error('Sender or receiver of friend request missing');
      return;
    }

    try {
      await sendFriendRequest({
        senderId: loggedInProfile?.id,
        receiverId: profileId,
      });
      console.log('Friend Request sent successfully!');
      // TODO: add success popup?
    } catch (error) {
      console.error(error, 'Failed sending Friend Request');
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!loggedInProfile || !profileId) {
      console.error('Sender or receiver of friend request missing');
      return;
    }
    try {
      await updateFriendRequest({
        newStatus: 'CANCELLED',
        senderId: loggedInProfile?.id,
      });
      closeModal();
    } catch (error) {
      console.error(error, 'Failed cancelling Friend Request');
    }
  };

  const handleOpenCancelFriendRequestModal = () => {
    launchModal(
      <CancelFriendRequestModal onCancelRequest={handleCancelFriendRequest} />
    );
  };

  const handleUpdateProfileClick = () => {
    launchModal(<UpdateProfileModal profile={profile} />);
  };

  const {
    firstName,
    lastName,
    avatarUrl,
    title,
    bio,
    createdAt,
    numOfChats,
    numOfFriends,
    numOfMessages,
    hasPendingFriendRequestFromMe,
    hasPendingFriendRequestForMe,
  } = profile;

  const formattedJoinDate = `Joined ${formatDisplayDate(createdAt)}`;
  let usersHeader;
  const displayName = `${firstName} ${lastName}`;

  return (
    <div className="flex flex-col items-center">
      {/* header */}
      <div className="relative h-50 w-full">
        <Link
          href="/chats"
          className="no-underline text-inherit absolute top-3 left-2"
        >
          <i className="bi bi-caret-left-fill text-3xl" />
        </Link>
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
          <p className="text-sm text-brand-accent">{title}</p>
        </div>

        <div className="flex justify-center text-center my-5">
          <p>{bio}</p>
        </div>

        <div className="flex gap-5 justify-center">
          {isOwnProfile ? (
            <button
              onClick={handleUpdateProfileClick}
              className="w-40 rounded-3xl text-white bg-brand-dark"
            >
              Update Profile
            </button>
          ) : (
            <>
              <Button
                onClick={
                  hasPendingFriendRequestFromMe
                    ? handleOpenCancelFriendRequestModal
                    : handleSendFriendRequest
                }
                className={
                  hasPendingFriendRequestFromMe
                    ? 'bg-gray-400'
                    : 'bg-brand-dark'
                }
              >
                {hasPendingFriendRequestFromMe
                  ? 'Request Sent'
                  : 'Add as Friend'}
              </Button>

              <Button
                onClick={() => {}}
                className="w-30 border border-brand-light text-brand-light bg-white"
              >
                Message
              </Button>
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

            {/* TODO: make this a large modal instead */}
            <div className="flex flex-col items-center text-center px-6">
              <strong className="text-lg leading-none text-brand">
                {numOfFriends}
              </strong>
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

function CancelFriendRequestModal({
  onCancelRequest,
}: {
  onCancelRequest: () => void;
}) {
  return (
    <Modal header="Cancel Request?">
      <p>Click to cancel friend request.</p>
      <ModalActions>
        <CancelButton key="close" />,
        <Button
          key="cancel-request"
          onClick={onCancelRequest}
          className="bg-red-500 text-white"
        >
          Cancel Friend Request
        </Button>
      </ModalActions>
    </Modal>
  );
}
