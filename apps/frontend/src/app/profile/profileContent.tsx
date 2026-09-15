'use client';
import { BackButton } from '@/components/button/BackButton';
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
import { useState } from 'react';
import { ComposeMessageModal } from '../chats/ComposeMessageModal';
import {
  CancelRequestModal,
  RemoveFriendModal,
  UpdateProfileModal,
} from './modals';
import { ProfileAvatar } from '@/components/ProfileAvatar';

interface ProfileContentProps {
  profileId: ObjectId;
  showBackButton?: boolean;
}

export function ProfileContent(props: ProfileContentProps) {
  const { profileId, showBackButton = true } = props;
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
    <div className="min-h-screen bg-brand-accent px-3 py-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        {/* header */}
        <div className="relative h-52 w-full sm:h-60">
          {showBackButton && (
            <div className="absolute left-4 top-4 z-10">
              <BackButton
                href="/chats"
                className="border-white/50 bg-white/90 text-slate-800 shadow-sm hover:bg-white"
              />
            </div>
          )}
          <ProfileHeader headerUrl={headerUrl} />
          <div className="absolute left-1/2 top-[78%] z-10 -translate-x-1/2 -translate-y-1/2">
            <ProfileAvatar profile={profile} size={128} />
          </div>
        </div>

        {/* content */}
        <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl text-brand-dark sm:text-4xl">
              {displayName}
            </h1>
            <p className="mt-1 text-sm font-medium text-brand">{title}</p>
          </div>

          {bio && (
            <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-slate-200 bg-brand-neutral px-4 py-4 text-center text-slate-700 shadow-sm sm:px-6">
              <p>{bio}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

          <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <h3 className="text-brand-dark">Activity</h3>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-200">
              <div className="flex flex-col items-center text-center px-3 py-2 sm:px-6">
                <strong className="text-lg leading-none text-brand">
                  {numOfChats}
                </strong>
                <small className="leading-none text-slate-500">Chats</small>
              </div>

              <div className="flex flex-col items-center text-center px-3 py-2 sm:px-6">
                <strong className="text-lg leading-none text-brand">
                  {numOfMessages}
                </strong>
                <small className="leading-none text-slate-500">Messages</small>
              </div>

              {/* TODO: allow opening friends list in large modal */}
              <div className="flex flex-col items-center text-center px-3 py-2 sm:px-6">
                <strong className="text-lg leading-none text-brand">
                  {numOfFriends}
                </strong>
                <small className="leading-none text-slate-500">Friends</small>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <small className="text-slate-500">{formattedJoinDate}</small>
          </div>
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
    <div className="own-profile-buttons w-full max-w-xs sm:w-auto">
      <button
        onClick={onUpdateProfileClick}
        className="h-11 w-full rounded-xl bg-brand px-6 font-semibold text-white shadow-sm shadow-brand/25 transition hover:bg-blue-600 sm:w-44"
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
    <div className="other-profile-buttons relative flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-center">
      <div className="relative w-full max-w-sm sm:w-[220px]">
        <Button
          onClick={handleActionClick}
          className={`${
            isFriend || hasPendingOutgoing ? 'bg-slate-400' : 'bg-brand'
          } h-11 w-full rounded-xl px-5 font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-blue-600`}
        >
          {actionLabel}
        </Button>

        {isFriend && isFriendMenuOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <button
              type="button"
              onClick={() => {
                setIsFriendMenuOpen(false);
                onRemoveFriend();
              }}
              className="block w-full border-0 bg-white px-4 py-3 text-center text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Remove Friend
            </button>
          </div>
        )}
      </div>

      {isFriend && (
        <Button
          onClick={onMessage}
          className="h-11 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-5 font-semibold text-brand shadow-sm transition hover:border-brand hover:bg-brand-neutral sm:w-[220px]"
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
        className="h-full w-full object-cover opacity-90"
      />
    );

  // sample gradient background
  return (
    <div className="h-full w-full bg-gradient-to-br from-brand via-blue-500 to-sky-300" />
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
    <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-center text-sm font-semibold text-slate-900">
        Friend Request Received
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={onAcceptIncomingRequest}
          className="h-11 rounded-xl bg-brand px-5 font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-blue-600"
        >
          Accept
        </Button>
        <Button
          onClick={onDeclineIncomingRequest}
          className="h-11 rounded-xl border border-slate-200 bg-white px-5 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
