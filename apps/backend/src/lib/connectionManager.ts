import { WebSocket } from 'ws';
import { prisma } from '@repo/db';
import { eventEmitter } from './eventBus';
import { logger } from './pino';
import { DateTime } from 'luxon';
import { DateTimeSchema, ObjectId } from '@repo/common';
import { last } from 'remeda';

interface ConnectionInfo {
  ws: WebSocket;
  profileId: string;
  connectedAt: DateTimeSchema;
}

class ConnectionManager {
  // connectionId -> ConnectionInfo
  private connections = new Map<ObjectId, ConnectionInfo>();
  // profileId -> Set of connectionIds (for multiple tabs/devices)
  private profileConnections = new Map<ObjectId, Set<ObjectId>>();

  addConnection(connectionId: ObjectId, ws: WebSocket, profileId: ObjectId) {
    const connectionInfo: ConnectionInfo = {
      ws,
      profileId,
      connectedAt: DateTime.now(),
    };

    this.connections.set(connectionId, connectionInfo);

    // Track profile connections
    if (!this.profileConnections.has(profileId)) {
      this.profileConnections.set(profileId, new Set());
    }

    this.profileConnections.get(profileId)?.add(connectionId);

    // If this is the first connection for this profile, mark them online
    if (this.profileConnections.get(profileId)?.size === 1) {
      this.setProfileOnline(profileId, true);
    }
    console.log('connection stats', this.getConnectionStats());

    logger.info({ profileId, connectionId }, 'Profile connected');

    ws.on('close', () => {
      this.removeConnection(connectionId);
    });

    ws.on('error', (error) => {
      logger.error({ error, profileId, connectionId }, 'WebSocket error');
      this.removeConnection(connectionId);
    });
  }

  removeConnection(connectionId: ObjectId) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo) {
      logger.warn(
        { connectionId },
        'Attempted to remove non-existent connection'
      );
      return;
    }

    const { profileId } = connectionInfo;

    // Remove from connections and profile connections
    this.connections.delete(connectionId);

    const profileConnectionsSet = this.profileConnections.get(profileId);
    if (profileConnectionsSet) {
      profileConnectionsSet.delete(connectionId);

      logger.info(
        {
          profileId,
          connectionId,
          remainingConnections: profileConnectionsSet.size,
        },
        'Connection removed from profile'
      );

      // If no more connections for this profile, mark them offline
      if (profileConnectionsSet.size === 0) {
        logger.info(
          { profileId },
          'Last connection removed, setting profile offline'
        );
        this.profileConnections.delete(profileId);
        this.setProfileOnline(profileId, false);
      }
    }

    logger.info({ profileId, connectionId }, 'User disconnected');
  }

  private async setProfileOnline(profileId: ObjectId, isOnline: boolean) {
    try {
      const newLastOnline = isOnline ? null : DateTime.now();

      await prisma.profile.update({
        where: { id: profileId },
        data: {
          isOnline,
          lastOnline: newLastOnline?.toJSDate() ?? null,
        },
      });

      // Get the updated profile with friends
      const populatedProfile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          friends: {
            select: { id: true },
          },
          chatMemberships: {
            select: { id: true, chatId: true },
          },
        },
      });
      logger.info(populatedProfile, 'Fetched profile with friends');

      if (populatedProfile) {
        logger.info(
          {
            profileWithChange: profileId,
            isOnline,
            lastOnline: newLastOnline,
            friendsCount: populatedProfile.friends.length,
            friendIds: populatedProfile.friends.map((f) => f.id),
            chatIds: populatedProfile.chatMemberships.map((c) => c.chatId),
          },
          'Emitting presence update events to friends'
        );

        const payload = {
          profileId,
          isOnline,
          lastOnline: newLastOnline,
        };

        // Notify friends about presence change
        populatedProfile.friends.forEach((friend) => {
          const eventName = `presenceUpdate:${friend.id}`;
          logger.info({ eventName, profileId, isOnline }, 'Emitting event');
          eventEmitter.emit(eventName, payload);
        });

        populatedProfile.chatMemberships.forEach((chat) => {
          const eventName = `presenceInChatUpdate:${chat.chatId}`;
          logger.info({ eventName, profileId, isOnline }, 'Emitting event');
          eventEmitter.emit(eventName, payload);
        });
      } else {
        logger.warn(
          { profileId },
          'Profile not found when trying to emit presence updates'
        );
      }

      logger.info({ profileId, isOnline }, 'Profile online status updated');
    } catch (error) {
      logger.error({ error, profileId }, 'Failed to update online status');
    }
  }

  isProfileOnline(profileId: string): boolean {
    const connections = this.profileConnections.get(profileId);
    return connections ? connections.size > 0 : false;
  }

  getActiveConnectionsCount(): number {
    return this.connections.size;
  }

  getOnlineProfilesCount(): number {
    return this.profileConnections.size;
  }

  getConnectionStats() {
    return {
      totalConnections: this.getActiveConnectionsCount(),
      onlineProfiles: this.getOnlineProfilesCount(),
      profileConnectionCounts: Array.from(
        this.profileConnections.entries()
      ).map(([profileId, connections]) => ({
        profileId,
        connectionCount: connections.size,
      })),
    };
  }
}

export const connectionManager = new ConnectionManager();
