import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { formatDisplayDate, getChatDisplayName } from '@/utils/formatting';
import { getParticipant, getParticipantProfiles } from '@/utils/general';
import { ChatDTO } from '@repo/common';
import Link from 'next/link';
import * as R from 'remeda';
import { useAuth } from '../../context/AuthContext';
import { getMessagePreview } from './chatPreviewHelpers';

export function ChatPreview({ chat }: { chat: ChatDTO }) {
  const {
    id: chatId,
    name,
    type,
    participants,
    groupPictureUrl,
    activities,
    createdAt: chatCreatedAt,
  } = chat;
  const { profile } = useAuth();
  const loggedInProfileId = profile?.id;
  const participantProfiles = getParticipantProfiles(participants);

  const isGroupChat = type === 'GROUP';
  const lastActivity = activities[0];

  const displayName = getChatDisplayName({
    name,
    participantProfiles,
    profileId: profile?.id,
  });

  const otherParticipantProfile = !isGroupChat
    ? participantProfiles.find((p) => p.id !== loggedInProfileId)
    : null;

  const loggedInParticipant = getParticipant(participants, loggedInProfileId);
  const unreadActivities = loggedInParticipant?.unreadActivities ?? 0;

  const displayPicture = isGroupChat
    ? GroupPhoto({ groupPictureUrl, participantProfiles })
    : ProfileAvatar({ profile: otherParticipantProfile });

  const timeToShow = lastActivity ? lastActivity.createdAt : chatCreatedAt;
  const displayTime = formatDisplayDate(timeToShow);

  const formattedDisplayName = R.truncate(displayName, 20);
  const activityContentDisplay = getMessagePreview({
    activity: lastActivity,
    profileId: loggedInProfileId,
  });

  const chatLink = `/chat/chat?chat=${chatId}`;

  return (
    <Link href={chatLink}>
      <div className="chat-preview-container flex items-center cursor-pointer">
        <div className="rounded-full w-10  overflow-hidden flex items-center justify-center bg-gray-200 mr-3">
          {displayPicture}
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between">
            <h6>{formattedDisplayName}</h6>
            <small>{displayTime}</small>
          </div>
          <div className="flex items-center gap-2">
            {unreadActivities > 0 && (
              <div className="flex items-center justify-center bg-blue-600 text-white rounded-full min-w-5 h-5 px-1.5">
                <span className="text-xs font-semibold">
                  {unreadActivities}
                </span>
              </div>
            )}
            <small>{activityContentDisplay}</small>
          </div>
        </div>
      </div>
    </Link>
  );
}
