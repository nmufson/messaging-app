import {
  IBaseProfile,
  ChatActionWithActorDTO,
  ChatParticipantDTO,
  ObjectId,
} from '@repo/common';
import { getProfileDisplayName } from './formatting';
import { assertNever } from './validation';

interface GetProfileParams {
  id: ObjectId;
  participants?: ChatParticipantDTO[];
  profiles?: IBaseProfile[];
}

export const getProfile = (params: GetProfileParams) => {
  const { id, participants, profiles } = params;

  if (participants) {
    const participant = participants.find((p) => p.profile.id === id);
    if (!participant) {
      console.error(`Profile with id ${id} not found in chat participants`);
      return;
    }
    return participant.profile;
  }

  if (profiles) {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) {
      console.error(`Profile with id ${id} not found in profiles`);
      return;
    }
    return profile;
  }
};

export const getParticipant = (
  participants: ChatParticipantDTO[],
  profileId?: ObjectId
) => {
  return participants.find((p) => p.profile.id === profileId);
};

export const getParticipantProfiles = (participants: ChatParticipantDTO[]) => {
  return participants.map((p) => p.profile);
};

export const getActionText = (
  actionWithActor: ChatActionWithActorDTO,
  isSelf: boolean
) => {
  const { actor, target, actionType, content } = actionWithActor;
  const actingProfileName = getProfileDisplayName(actor);
  const actorLabel = isSelf ? 'You' : actingProfileName;
  const targetProfileName = target ? getProfileDisplayName(target) : null;

  switch (actionType) {
    case 'CHAT_CREATED': {
      return `${actorLabel} created the chat.`;
    }
    case 'MEMBER_ADDED': {
      return `${actorLabel} added ${targetProfileName} to the chat.`;
    }

    case 'MEMBER_REMOVED': {
      return `${actorLabel} removed ${targetProfileName} from the chat.`;
    }

    case 'MEMBER_LEFT': {
      return `${actorLabel} left the chat.`;
    }

    case 'NAME_CHANGED': {
      const textEnding = content ? ` to ${content}` : '';
      return `${actorLabel} changed the chat name to${textEnding}.`;
    }

    case 'PICTURE_CHANGED': {
      return `${actorLabel} changed the chat picture.`;
    }

    default: {
      // to ensure we're covering all cases
      return assertNever(actionType);
    }
  }
};
