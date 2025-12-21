import { GroupPhoto } from '@/components/GroupPhoto';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { PROFILE_FALLBACK } from '@/constants';
import { formatDisplayDate, getChatDisplayName } from '@/utils/formatting';
import {
  getActionText,
  getParticipant,
  getParticipantProfiles,
} from '@/utils/general';
import { BaseProfile, ChatDTO } from '@repo/common';
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

  const isMessageActivity = lastActivity.activityType === 'message';
  const activityProfile = participantProfiles.find(
    (p) =>
      p.id ===
      (isMessageActivity ? lastActivity.senderId : lastActivity.actorId)
  );
  const targetProfile = !isMessageActivity
    ? participantProfiles.find((p) => p.id === lastActivity.targetId)
    : null;

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
    isSelf: loggedInProfileId === activityProfile?.id,
    activity: lastActivity,
    activityProfile: activityProfile ?? PROFILE_FALLBACK,
    targetProfile,
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
            <small>{activityContentDisplay}</small>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface GetMessagePreviewParams {
  isSelf: boolean;
  activity: ChatActivityDTO;
  activityProfile: BaseProfile;
  targetProfile?: BaseProfile | null;
  truncate?: number;
}

export function getMessagePreview(params: GetMessagePreviewParams) {
  const {
    isSelf,
    activity,
    activityProfile,
    targetProfile,
    truncate = 40,
  } = params;

  const isMessage = activity?.activityType === 'message';

  let content = '';

  if (isMessage) {
    content = getMessageActivityContent({
      isSelf,
      messageActivity: activity,
      senderProfile: activityProfile,
    });
  } else {
    content = getActionText({
      ...activity,
      actor: activityProfile,
      target: targetProfile,
    });
  }

  return R.truncate(content, truncate);
}

interface FormatMessageActivityParams {
  isSelf: boolean;
  messageActivity: MessageActivityDTO;
  senderProfile: BaseProfile;
}

function getMessageActivityContent(params: FormatMessageActivityParams) {
  const { isSelf, messageActivity, senderProfile } = params;

  if (messageActivity.type === 'IMAGE') {
    const photoTextPrefix = getNameDisplay({ isSelf, profile: senderProfile });

    return `${photoTextPrefix} sent a photo.`;
  } else {
    return messageActivity.content ?? '';
  }
}

interface NameDisplay {
  isSelf: boolean;
  profile: BaseProfile;
}

export function getNameDisplay({ isSelf, profile }: NameDisplay) {
  return isSelf ? 'You' : `${profile.firstName} ${profile.lastName}`;
}
