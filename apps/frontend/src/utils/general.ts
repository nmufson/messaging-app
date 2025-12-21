import { BaseProfile, ChatParticipantDTO, ObjectId } from '@repo/common';

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
