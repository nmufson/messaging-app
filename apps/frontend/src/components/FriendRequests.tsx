'use client';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { Button } from '@/components/button/button';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useToggle } from '@/hooks/general';
import { useTRPC } from '@/lib/trpc';
import { FriendRequestDTO, FriendRequestStatus } from '@repo/common';
import { Spinner } from 'react-bootstrap';

export function FriendRequests() {
  const trpc = useTRPC();
  const { status: isExpanded, toggleStatus: toggleExpanded } = useToggle();

  const { requests, numRequests, isLoading } = useFriendRequest(['PENDING']);

  return (
    <div>
      {/* Expandable Header */}
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full p-3 hover:bg-gray-100 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="bi bi-person-plus text-xl" />
            {numRequests > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {numRequests}
              </span>
            )}
          </div>
          <span>Friend Requests</span>
        </div>
        <i
          className={`bi bi-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-60 overflow-y-auto mt-1">
          {isLoading ? (
            <Spinner />
          ) : numRequests === 0 ? (
            <div className="p-3 text-center text-gray-500">
              No pending requests
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {requests?.map((request) => (
                <FriendRequestItem key={request.id} request={request} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FriendRequestItem({ request }: { request: FriendRequestDTO }) {
  const { sender } = request;
  const { cancelFriendRequest, isLoading } = useFriendRequest();

  const handleAccept = () => {
    cancelFriendRequest({
      senderId: sender.id,
      newStatus: FriendRequestStatus.enum.ACCEPTED,
    });
  };

  const handleDecline = () => {
    cancelFriendRequest({
      senderId: sender.id,
      newStatus: FriendRequestStatus.enum.DECLINED,
    });
  };

  return (
    <li className="p-3">
      <div className="flex items-center gap-3">
        <getProfileAvatar
          firstName={sender.firstName}
          lastName={sender.lastName}
          avatarUrl={sender.avatarUrl}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {sender.firstName} {sender.lastName}
          </p>
          <p className="text-xs text-gray-500">wants to be your friend</p>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1 bg-blue-500 text-white text-sm hover:bg-blue-600"
        >
          Accept
        </Button>
        <Button
          onClick={handleDecline}
          disabled={isLoading}
          className="flex-1 bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
        >
          Decline
        </Button>
      </div>
    </li>
  );
}
