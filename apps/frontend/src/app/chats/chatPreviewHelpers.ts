import { getNameDisplay } from '@/utils/formatting';
import { getActionText } from '@/utils/general';
import { BaseProfile, ChatActivityDTO, MessageActivityDTO } from '@repo/common';
import * as R from 'remeda';

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
    content = getActionText(
      {
        ...activity,
        actor: activityProfile,
        target: targetProfile,
      },
      isSelf
    );
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
