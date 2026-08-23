'use client';
import { Button } from '@/components/button/button';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useProfile } from '@/hooks/profile';
import { useTRPC } from '@/lib/trpc';
import { FullscreenModal } from '@/components/modal/FullscreenModal';
import { formatDisplayDate } from '@/utils';
import {
  FriendRequestStatus,
  ObjectId,
  RelationshipToViewer,
} from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { ComposeMessageModal } from '../chats/ComposeMessageModal';
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

  const {
    sendFriendRequest,
    updateIncomingFriendRequest,
    cancelOutgoingFriendRequest,
  } = useFriendRequest();
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
      await cancelOutgoingFriendRequest({
        receiverId: profileId,
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

  const handleAcceptIncomingFriendRequest = () => {
    if (!loggedInProfile || !profileId) {
      console.error('Sender or receiver of friend request missing');
      return;
    }

    updateIncomingFriendRequest({
      senderId: profileId,
      newStatus: FriendRequestStatus.enum.ACCEPTED,
    });
  };

  const handleDeclineIncomingFriendRequest = () => {
    if (!loggedInProfile || !profileId) {
      console.error('Sender or receiver of friend request missing');
      return;
    }

    updateIncomingFriendRequest({
      senderId: profileId,
      newStatus: FriendRequestStatus.enum.DECLINED,
    });
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

  const handleOpenComposeMessageModal = () => {
    const initialSelectedProfiles = [
      {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    ];
    launchModal(
      <FullscreenModal showHeader={false}>
        <ComposeMessageModal
          initialSelectedProfiles={initialSelectedProfiles}
          shouldFocusChatInput={true}
        />
      </FullscreenModal>
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
              onAcceptIncomingRequest={handleAcceptIncomingFriendRequest}
              onDeclineIncomingRequest={handleDeclineIncomingFriendRequest}
              onRemoveFriend={handleOpenRemoveFriendModal}
              onMessage={handleOpenComposeMessageModal}
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
  onAcceptIncomingRequest: () => void;
  onDeclineIncomingRequest: () => void;
  onRemoveFriend: () => void;
  onMessage: () => void;
}

function OtherProfileButtons(props: OtherProfileButtonsProps) {
  const {
    relationshipToViewer,
    onSendFriendRequest,
    onCancelFriendRequest,
    onAcceptIncomingRequest,
    onDeclineIncomingRequest,
    onRemoveFriend,
    onMessage,
  } = props;
  const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);

  const isFriend = relationshipToViewer === 'FRIEND';
  const hasPendingOutgoing =
    relationshipToViewer === 'PENDING_OUTGOING_REQUEST';
  const hasPendingIncoming =
    relationshipToViewer === 'PENDING_INCOMING_REQUEST';

  let actionLabel = 'Add as Friend';
  if (isFriend) actionLabel = 'Friends';
  if (hasPendingOutgoing) actionLabel = 'Request Sent';

  const handleActionClick = () => {
    if (isFriend) {
      setIsFriendMenuOpen((prev) => !prev);
      return;
    }

    if (hasPendingOutgoing) {
      onCancelFriendRequest();
      return;
    }

    onSendFriendRequest();
  };

  if (hasPendingIncoming) {
    return (
      <PendingIncomingRequestActions
        onAcceptIncomingRequest={onAcceptIncomingRequest}
        onDeclineIncomingRequest={onDeclineIncomingRequest}
      />
    );
  }

  return (
    <div className="flex gap-5">
      <div className="relative">
        <Button
          onClick={handleActionClick}
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
          onClick={onMessage}
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

interface PendingIncomingRequestActionsProps {
  onAcceptIncomingRequest: () => void;
  onDeclineIncomingRequest: () => void;
}

function PendingIncomingRequestActions(
  props: PendingIncomingRequestActionsProps
) {
  const { onAcceptIncomingRequest, onDeclineIncomingRequest } = props;

  return (
    <div className="w-full max-w-sm rounded-md border border-brand-light/40 bg-white p-3 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-brand-dark">
        Friend Request Received
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={onAcceptIncomingRequest}
          className="h-10 rounded-md bg-brand-dark"
        >
          Accept
        </Button>
        <Button
          onClick={onDeclineIncomingRequest}
          className="h-10 rounded-md border border-gray-300 bg-white text-gray-700"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
