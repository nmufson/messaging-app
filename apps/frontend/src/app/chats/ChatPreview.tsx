import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { PROFILE_FALLBACK } from '@/constants';
import { formatDisplayDate, getChatDisplayName } from '@/utils/formatting';
import { getParticipant, getParticipantProfiles } from '@/utils/general';
import { BaseProfile, ChatActivityDTO, ChatDTO } from '@repo/common';
import Link from 'next/link';
import * as R from 'remeda';
import { useAuth } from '../../context/AuthContext';

interface ChatPreviewProps {
  chat: ChatDTO;
}

export function ChatPreview({ chat }: ChatPreviewProps) {
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
  const formattedDisplayMessage = getMessagePreview({
    activity: lastActivity,
    participantProfiles,
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
          <div>
            <small>{formattedDisplayMessage}</small>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface GetMessagePreviewParams {
  activity: ChatActivityDTO;
  participantProfiles: BaseProfile[];
}

export function getMessagePreview(params: GetMessagePreviewParams) {
  const { activity, participantProfiles } = params;

  const isMessage = activity?.activityType === 'message';
  const activityProfileId = isMessage ? activity?.senderId : activity?.actorId;
  const activityProfile =
    participantProfiles.find((p) => p.id === activityProfileId) ??
    PROFILE_FALLBACK;

  if (isMessage && activity.type === 'IMAGE') {
    return `${activityProfile.firstName} ${activityProfile.lastName} sent a photo.`;
  }

  const truncatedContent = R.truncate(activity.content ?? '', 40);

  return truncatedContent;
}
