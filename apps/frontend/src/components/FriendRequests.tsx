'use client';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { Button } from '@/components/button/button';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useToggle } from '@/hooks/general';
import { useNavigation } from '@/utils/Navigation';
import { FriendRequestDTO, FriendRequestStatus } from '@repo/common';
import { Spinner } from 'react-bootstrap';
import styles from './FriendRequests.module.css';
import { formatDisplayDate } from '@/utils';

interface RespondedRequestItemProps {
  request: FriendRequestDTO;
}

export function FriendRequests() {
  const { status: isExpanded, toggleStatus: toggleExpanded } = useToggle();

  const { requests, isLoading, updateFriendRequest } = useFriendRequest({
    requestStatuses: ['PENDING', 'ACCEPTED', 'DECLINED'],
  });

  const pendingRequests = requests.filter(
    (request) => request.status === FriendRequestStatus.enum.PENDING
  );
  const respondedRequests = requests.filter(
    (request) =>
      request.status === FriendRequestStatus.enum.ACCEPTED ||
      request.status === FriendRequestStatus.enum.DECLINED
  );
  const numPendingRequests = pendingRequests.length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Expandable Header */}
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full rounded-xl p-3 hover:bg-gray-50 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <i className="bi bi-person-plus text-lg" />
            {numPendingRequests > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {numPendingRequests}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Friend Requests
            </p>
            <p className="text-xs text-gray-500">
              View pending requests and notifications
            </p>
          </div>
        </div>
        <i
          className={`bi bi-chevron-down text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-72 overflow-y-auto border-t border-gray-100 bg-gray-50/40">
          {isLoading ? (
            <div className="p-4 text-center">
              <Spinner />
            </div>
          ) : (
            <>
              <section className="px-2 pt-2">
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Pending ({pendingRequests.length})
                </div>
                {pendingRequests.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {pendingRequests.map((request) => (
                      <FriendRequestItem
                        key={request.id}
                        request={request}
                        onRespond={updateFriendRequest}
                        isResponding={isLoading}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <section className="mt-3 border-t border-gray-200 px-2 pt-2 pb-2">
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Notifications ({respondedRequests.length})
                </div>
                {respondedRequests.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                    No recent updates
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {respondedRequests.map((request) => (
                      <RespondedRequestItem
                        key={request.id}
                        request={request}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface FriendRequestItemProps {
  request: FriendRequestDTO;
  onRespond: (params: {
    senderId: string;
    newStatus: FriendRequestDTO['status'];
  }) => void;
  isResponding: boolean;
}

function FriendRequestItem(props: FriendRequestItemProps) {
  const { request, onRespond, isResponding } = props;
  const { sender } = request;
  const { navigateToProfile } = useNavigation();

  const handleAccept = () => {
    onRespond({
      senderId: sender.id,
      newStatus: FriendRequestStatus.enum.ACCEPTED,
    });
  };

  const handleDecline = () => {
    onRespond({
      senderId: sender.id,
      newStatus: FriendRequestStatus.enum.DECLINED,
    });
  };

  const handleNavigateToProfile = () => {
    navigateToProfile(sender.id);
  };

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div
        onClick={handleNavigateToProfile}
        className="profile-container group flex items-center gap-3 cursor-pointer rounded-md p-1 -m-1 hover:bg-gray-50 transition-colors"
      >
        <ProfileAvatar profile={sender} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:underline">
            {sender.firstName} {sender.lastName}
          </p>
          <p className="text-xs text-gray-500 group-hover:underline">
            wants to be your friend
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            Requested{' '}
            {formatDisplayDate(request.createdAt, { includeTime: true })}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          onClick={handleAccept}
          disabled={isResponding}
          className="flex-1 bg-blue-500 text-white text-sm hover:bg-blue-600"
        >
          Accept
        </Button>
        <Button
          onClick={handleDecline}
          disabled={isResponding}
          className="flex-1 bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
        >
          Decline
        </Button>
      </div>
    </li>
  );
}

function RespondedRequestItem(props: RespondedRequestItemProps) {
  const { request } = props;
  const { sender, status } = request;
  const { navigateToProfile } = useNavigation();

  const statusClassName =
    status === FriendRequestStatus.enum.ACCEPTED
      ? styles.feedbackAccept
      : styles.feedbackDecline;
  const statusText =
    status === FriendRequestStatus.enum.ACCEPTED ? 'Accepted' : 'Declined';

  const handleNavigateToProfile = () => {
    navigateToProfile(sender.id);
  };

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div
        onClick={handleNavigateToProfile}
        className="profile-container group flex items-center gap-3 cursor-pointer rounded-md p-1 -m-1 hover:bg-gray-50 transition-colors"
      >
        <ProfileAvatar profile={sender} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate group-hover:underline">
              {sender.firstName} {sender.lastName}
            </p>
            <span className={`${styles.feedbackBadge} ${statusClassName}`}>
              {statusText}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 group-hover:underline">
            You {statusText.toLowerCase()} this friend request
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            Updated{' '}
            {formatDisplayDate(request.updatedAt ?? request.createdAt, {
              includeTime: true,
            })}
          </p>
        </div>
      </div>
    </li>
  );
}
