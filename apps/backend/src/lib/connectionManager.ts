import { WebSocket } from 'ws';
import { prisma } from '@repo/db';
import { eventEmitter } from './eventBus';
import { logger } from './pino';
import { DateTime } from 'luxon';
import { DateTimeSchema, ObjectId } from '@repo/common';

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
    if (!connectionInfo) return;

    const { profileId } = connectionInfo;

    // Remove from connections and profile connections
    this.connections.delete(connectionId);

    const profileConnectionsSet = this.profileConnections.get(profileId);
    if (profileConnectionsSet) {
      profileConnectionsSet.delete(connectionId);

      // If no more connections for this profile, mark them offline
      if (profileConnectionsSet.size === 0) {
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
      const profileWithFriends = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          friends: {
            select: { id: true },
          },
        },
      });

      if (profileWithFriends) {
        // Notify friends about presence change
        profileWithFriends.friends.forEach((friend) => {
          logger.info({ friendId: friend.id }, 'emitting the event');
          eventEmitter.emit(`presenceUpdate:${friend.id}`, {
            profileId,
            isOnline,
            lastOnline: newLastOnline,
          });
        });
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
