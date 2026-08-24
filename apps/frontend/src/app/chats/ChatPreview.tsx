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
    <Link
      href={chatLink}
      className="block transition-colors hover:bg-brand-light/25"
    >
      <div className="chat-preview-container flex cursor-pointer items-center px-3 py-3 sm:px-4">
        <div className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-200 ring-2 ring-white">
          {displayPicture}
        </div>
        <div className="flex w-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <h6 className="text-sm font-semibold text-slate-900">
              {formattedDisplayName}
            </h6>
            <small className="text-[11px] text-slate-500">{displayTime}</small>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {unreadActivities > 0 && (
              <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">
                <span>{unreadActivities}</span>
              </div>
            )}
            <small className="truncate text-xs text-slate-600">
              {activityContentDisplay}
            </small>
          </div>
        </div>
      </div>
    </Link>
  );
}
