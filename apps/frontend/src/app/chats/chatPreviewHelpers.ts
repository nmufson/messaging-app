import { getNameDisplay } from '@/utils/formatting';
import {
  getActionDisplayText,
  ChatActivityDTO,
  MessageActivityDTO,
  ObjectId,
} from '@repo/common';
import * as R from 'remeda';

interface GetMessagePreviewParams {
  activity: ChatActivityDTO;
  profileId?: ObjectId | null;
  truncate?: number;
}

export function getMessagePreview(params: GetMessagePreviewParams) {
  const { activity, profileId, truncate = 40 } = params;

  const isMessage = activity?.activityType === 'message';

  let content = '';

  if (isMessage) {
    content = getMessageActivityContent({
      messageActivity: activity,
      profileId,
    });
  } else {
    content = getActionDisplayText({ action: activity, profileId });
  }

  return R.truncate(content, truncate);
}

interface FormatMessageActivityParams {
  messageActivity: MessageActivityDTO;
  profileId?: ObjectId | null;
}

function getMessageActivityContent(params: FormatMessageActivityParams) {
  const { messageActivity, profileId } = params;

  if (messageActivity.type === 'IMAGE') {
    const photoTextPrefix = getNameDisplay({
      isSelf: profileId === messageActivity.sender.id,
      profile: messageActivity.sender,
    });

    return `${photoTextPrefix} sent a photo.`;
  } else {
    return messageActivity.content ?? '';
  }
}
