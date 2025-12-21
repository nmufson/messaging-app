import {
  BaseProfile,
  ChatActionWithActorDTO,
  ChatParticipantDTO,
  ObjectId,
} from '@repo/common';
import { getProfileDisplayName } from './formatting';
import { assertNever } from './validation';

interface GetProfileParams {
  id: ObjectId;
  participants?: ChatParticipantDTO[];
  profiles?: BaseProfile[];
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

// TODO: make this account for logged in user having sent message (in the case of photo ?)
export const getActionText = (actionWithActor: ChatActionWithActorDTO) => {
  const { actor, target, actionType, content } = actionWithActor;
  const actingProfileName = getProfileDisplayName(actor);
  const targetProfileName = target ? getProfileDisplayName(target) : null;

  switch (actionType) {
    case 'CHAT_CREATED': {
      return `${actingProfileName} created the chat.`;
    }
    case 'MEMBER_ADDED': {
      if (!targetProfileName) return `${actingProfileName} added a member.`;
      return `${actingProfileName} added ${targetProfileName} to the chat.`;
    }

    case 'MEMBER_REMOVED': {
      if (!targetProfileName) return `${actingProfileName} removed a member.`;
      return `${actingProfileName} removed ${targetProfileName} from the chat.`;
    }

    case 'MEMBER_LEFT': {
      return `${actingProfileName} left the chat.`;
    }

    case 'NAME_CHANGED': {
      const textEnding = content ? ` to ${content}` : '';
      return `${actingProfileName} changed the chat name${textEnding}.`;
    }

    case 'PICTURE_CHANGED': {
      return `${actingProfileName} changed the chat picture.`;
    }

    default: {
      // to ensure we're covering all cases
      return assertNever(actionType);
    }
  }
};
