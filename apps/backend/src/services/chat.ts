import { ChatType, ListProfileDTO, SearchChatListDTO } from '@repo/common';
import { Chat, Profile } from '@repo/db';
import { PrismaClient } from '@repo/db';
import { ObjectId } from '@repo/common';

// TODO make endpoint for finding direct chat and use this there

interface GetPotentialChatsParams {
  profileId: ObjectId;
  names: string[];
  selectedProfiles?: ObjectId[];
}

// Returns profiles and existing group chats for user to begin chat
// Doesn't include profiles that are already included in the user's potential chat list
export const getPotentialChats = async (
  prisma: PrismaClient,
  params: GetPotentialChatsParams
): Promise<{ profiles: ListProfileDTO[]; groupChats: SearchChatListDTO[] }> => {
  const { names, selectedProfiles, profileId } = params;

  if (names.length === 0) return { profiles: [], groupChats: [] };

  const profiles = await prisma.profile.findMany({
    where: {
      friends: {
        some: { id: profileId },
      },
      OR: names.flatMap((name) => [
        { firstName: { contains: name, mode: 'insensitive' as const } },
        { lastName: { contains: name, mode: 'insensitive' as const } },
      ]),
      // Exclude already selected profiles
      ...(selectedProfiles &&
        selectedProfiles.length > 0 && {
          id: { notIn: selectedProfiles },
        }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });

  let groupChats: SearchChatListDTO[] = [];
  if (!selectedProfiles || selectedProfiles.length === 0) {
    groupChats = await prisma.chat.findMany({
      where: {
        type: ChatType.enum.GROUP,
        AND: [
          {
            participants: {
              some: { id: profileId },
            },
          },
          {
            participants: {
              some: {
                OR: names.flatMap((name) => [
                  {
                    firstName: { contains: name, mode: 'insensitive' as const },
                  },
                  {
                    lastName: { contains: name, mode: 'insensitive' as const },
                  },
                ]),
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  return { profiles, groupChats };
};
