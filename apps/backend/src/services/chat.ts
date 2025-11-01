import {
  ChatDTO,
  ChatType,
  ListProfileDTO,
  SearchChatListDTO,
} from '@repo/common';
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

interface DirectChatProfiles {
  profileA: ObjectId;
  profileB: ObjectId;
}

interface GetChatParams {
  chatId?: ObjectId;
  profiles?: DirectChatProfiles;
}

export const getChat = async (
  prisma: PrismaClient,
  params: GetChatParams
): Promise<ChatDTO | null> => {
  const { chatId, profiles } = params;

  let whereFilters;

  if (chatId) {
    whereFilters = { id: chatId };
  }

  if (profiles) {
    const { profileA, profileB } = profiles;
    whereFilters = {
      type: ChatType.enum.DIRECT,
      participants: {
        every: {
          id: { in: [profileA, profileB] },
        },
      },
    };
  }

  if (!whereFilters) {
    return null;
  }

  const chat = await prisma.chat.findFirst({
    where: whereFilters,
    select: {
      id: true,
      type: true,
      name: true,
      groupPictureUrl: true,
      createdAt: true,
      updatedAt: true,
      creatorId: true,
      messages: {
        take: 100,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          imageUrl: true,
          senderId: true,
        },
      },
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

  return ChatDTO.parse(chat);
};
