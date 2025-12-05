import { FriendRequestStatus, PrismaClient } from '@repo/db';
import { ObjectId } from 'node_modules/@repo/common/src/schemas/primitives';

export async function getFriendRequests(
  prisma: PrismaClient,
  profileId: ObjectId,
  statuses: FriendRequestStatus[]
) {
  const requests = await prisma.friendRequest.findMany({
    where: {
      receiverId: profileId,
      status: {
        in: statuses,
      },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
}
