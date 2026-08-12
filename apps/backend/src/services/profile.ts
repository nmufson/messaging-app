import { ObjectId } from '@repo/common';
import { Prisma, PrismaClient } from '@repo/db';
import { TRPCError } from '@trpc/server';

export function nameEmailSearch(input: string) {
  return {
    OR: [
      {
        user: {
          email: { contains: input, mode: 'insensitive' as const },
        },
      },
      {
        firstName: { contains: input, mode: 'insensitive' as const },
      },
      {
        lastName: { contains: input, mode: 'insensitive' as const },
      },
    ],
  };
}

interface GetRequiredProfileByIdParams<TSelect extends Prisma.ProfileSelect> {
  prisma: PrismaClient;
  profileId: ObjectId;
  select: TSelect;
}

export async function getProfileById<TSelect extends Prisma.ProfileSelect>(
  params: GetRequiredProfileByIdParams<TSelect>
) {
  const { prisma, profileId, select } = params;

  try {
    return await prisma.profile.findUniqueOrThrow({
      where: { id: profileId },
      select,
    });
  } catch {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
  }
}

interface GetRequiredProfileNameParams {
  prisma: PrismaClient;
  profileId: ObjectId;
}

export async function getProfileName(params: GetRequiredProfileNameParams) {
  const { prisma, profileId } = params;
  return getProfileById({
    prisma,
    profileId,
    select: { firstName: true, lastName: true },
  });
}
