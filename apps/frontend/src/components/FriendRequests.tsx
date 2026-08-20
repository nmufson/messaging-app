'use client';
import styles from './FriendRequests.module.css';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { Button } from '@/components/button/button';
import { useFriendRequest } from '@/hooks/friendRequest';
import { useToggle } from '@/hooks/general';
import { useNavigation } from '@/utils/Navigation';
import { FriendRequestDTO, FriendRequestStatus } from '@repo/common';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';

export function FriendRequests() {
  const { status: isExpanded, toggleStatus: toggleExpanded } = useToggle();

  const { requests, numRequests, isLoading } = useFriendRequest({
    requestStatuses: ['PENDING'],
  });

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
  const { updateFriendRequest, isLoading } = useFriendRequest({
    listQueryEnabled: false,
  });
  const { navigateToProfile } = useNavigation();

  const handleAccept = () => {
    updateFriendRequest({
      senderId: sender.id,
      newStatus: FriendRequestStatus.enum.ACCEPTED,
    });
  };

  const handleDecline = () => {
    updateFriendRequest({
      senderId: sender.id,
      newStatus: FriendRequestStatus.enum.DECLINED,
    });
  };

  const handleNavigateToProfile = () => {
    navigateToProfile(sender.id);
  };

  return (
    <li className="p-3">
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
