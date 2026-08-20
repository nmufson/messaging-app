'use client';
import { Button } from '@/components/button/button';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useProfile } from '@/hooks/profile';
import { useTRPC } from '@/lib/trpc';
import { formatDisplayDate } from '@/utils';
import { ObjectId, RelationshipToViewer } from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import {
  CancelRequestModal,
  RemoveFriendModal,
  UpdateProfileModal,
} from './modals';

export function ProfileContent({ profileId }: { profileId: ObjectId }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { launchModal, closeModal } = useModalContext();
  const { profile: loggedInProfile } = useAuth();

  const isOwnProfile = loggedInProfile?.id === profileId;

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(profileId);

  const { sendFriendRequest, updateFriendRequest } = useFriendRequest();
  const { mutateAsync: removeFriend } = useMutation(
    trpc.profile.removeFriend.mutationOptions({
      onSuccess: () => {
        const profileQueryKey = trpc.profile.byId.queryKey({ profileId });
        queryClient.setQueryData(profileQueryKey, (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            relationshipToViewer: 'NONE' as const,
            numOfFriends: Math.max(0, old.numOfFriends - 1),
          };
        });
      },
    })
  );

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
      <CancelRequestModal onCancelRequest={handleCancelFriendRequest} />
    );
  };

  const handleUpdateProfileClick = () => {
    launchModal(<UpdateProfileModal profile={profile} />);
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend({ friendProfileId: profileId });
      closeModal();
    } catch (error) {
      console.error(error, 'Failed removing friend');
    }
  };

  const handleOpenRemoveFriendModal = () => {
    launchModal(
      <RemoveFriendModal onConfirmRemoveFriend={handleRemoveFriend} />
    );
  };

  const {
    firstName,
    lastName,
    avatarUrl,
    headerUrl,
    title,
    bio,
    createdAt,
    numOfChats,
    numOfFriends,
    numOfMessages,
    relationshipToViewer,
  } = profile;

  const formattedJoinDate = `Joined ${formatDisplayDate(createdAt)}`;

  const displayName = `${firstName} ${lastName}`;

  return (
    <div className="flex flex-col items-center">
      {/* header */}
      <div className="relative h-50 w-full">
        <Link
          href="/chats"
          className="no-underline text-inherit absolute top-3 left-2 z-10"
        >
          <i className="bi bi-caret-left-fill text-3xl" />
        </Link>
        <ProfileHeader headerUrl={headerUrl} />
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
            <OwnProfileButtons
              onUpdateProfileClick={handleUpdateProfileClick}
            />
          ) : (
            <OtherProfileButtons
              relationshipToViewer={relationshipToViewer}
              onSendFriendRequest={handleSendFriendRequest}
              onCancelFriendRequest={handleOpenCancelFriendRequestModal}
              onRemoveFriend={handleOpenRemoveFriendModal}
            />
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

function OwnProfileButtons({
  onUpdateProfileClick,
}: {
  onUpdateProfileClick: () => void;
}) {
  return (
    <div>
      <button
        onClick={onUpdateProfileClick}
        className="w-40 h-10 rounded-md text-white bg-brand-dark"
      >
        Update Profile
      </button>
    </div>
  );
}

interface OtherProfileButtonsProps {
  relationshipToViewer: RelationshipToViewer;
  onSendFriendRequest: () => void;
  onCancelFriendRequest: () => void;
  onRemoveFriend: () => void;
}

function OtherProfileButtons(props: OtherProfileButtonsProps) {
  const {
    relationshipToViewer,
    onSendFriendRequest,
    onCancelFriendRequest,
    onRemoveFriend,
  } = props;
  const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);

  const isFriend = relationshipToViewer === 'FRIEND';
  const hasPendingOutgoing =
    relationshipToViewer === 'PENDING_OUTGOING_REQUEST';
  const hasPendingIncoming =
    relationshipToViewer === 'PENDING_INCOMING_REQUEST';

  const actionLabel = isFriend
    ? 'Friends'
    : hasPendingOutgoing
      ? 'Request Sent'
      : hasPendingIncoming
        ? 'Request Pending'
        : 'Add as Friend';

  const shouldDisableAction = isFriend || hasPendingIncoming;

  const handleActionClick = () => {
    if (isFriend) {
      setIsFriendMenuOpen((prev) => !prev);
      return;
    }

    if (hasPendingOutgoing) {
      onCancelFriendRequest();
      return;
    }

    if (!shouldDisableAction) {
      onSendFriendRequest();
    }
  };

  const handleMessageClick = () => {};

  return (
    <div className="flex gap-5">
      <div className="relative">
        <Button
          onClick={handleActionClick}
          disabled={shouldDisableAction}
          className={`${isFriend || hasPendingOutgoing ? 'bg-gray-400' : 'bg-brand-dark'} rounded-md h-10`}
        >
          {actionLabel}
        </Button>

        {isFriend && isFriendMenuOpen && (
          <div className="absolute z-20 mt-2 min-w-[150px] rounded-md border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setIsFriendMenuOpen(false);
                onRemoveFriend();
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
            >
              Remove Friend
            </button>
          </div>
        )}
      </div>

      {isFriend && (
        <Button
          onClick={() => {}}
          className="w-30 h-10 rounded-md border border-brand-light text-brand-light bg-white"
        >
          Message
        </Button>
      )}
    </div>
  );
}

function ProfileHeader({ headerUrl }: { headerUrl: string }) {
  if (headerUrl)
    return (
      <img
        src={headerUrl}
        alt="Header"
        className="w-full h-40 md:h-56 object-cover opacity-80"
      />
    );

  // sample gradient background
  return (
    <div className="w-full h-40 md:h-56 bg-gradient-to-r from-brand to-brand-light" />
  );
}
