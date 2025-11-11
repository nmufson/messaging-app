import { ObjectId } from '@repo/common';
import { ProfileAvatar } from './ProfileAvatar';

const POSITIONS = [
  // 2 participants
  [
    { x: 0.15, y: 0.15 },
    { x: 0.55, y: 0.55 },
  ],
  // 3 participants...
  [
    { x: 0.5, y: 0.1 },
    { x: 0.1, y: 0.6 },
    { x: 0.7, y: 0.6 },
  ],
  [
    { x: 0.1, y: 0.1 },
    { x: 0.6, y: 0.1 },
    { x: 0.1, y: 0.6 },
    { x: 0.6, y: 0.6 },
  ],
  [
    { x: 0.5, y: 0.05 },
    { x: 0.1, y: 0.35 },
    { x: 0.7, y: 0.35 },
    { x: 0.25, y: 0.7 },
    { x: 0.6, y: 0.7 },
  ],
];

interface GroupPhotoProps {
  groupPictureUrl: string | null;
  // TODO: change this?
  participants: {
    id: ObjectId;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  }[];
  size?: number;
  className?: string;
}

export function GroupPhoto(props: GroupPhotoProps) {
  const { groupPictureUrl, participants, size = 48, className = '' } = props;

  if (groupPictureUrl) {
    return (
      <img
        src={groupPictureUrl}
        alt="Group"
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Show 2-5 participant avatars, arranged in a cluster
  const displayParticipants = participants.slice(0, 5);
  const count = displayParticipants.length;
  const avatarSize = size / (count > 2 ? 1.5 : 1.2);

  const pos = POSITIONS[count - 2] || POSITIONS[POSITIONS.length - 1];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {displayParticipants.map((p, i) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: pos[i].x * size,
            top: pos[i].y * size,
            width: avatarSize,
            height: avatarSize,
            zIndex: count - i,
          }}
        >
          <ProfileAvatar
            firstName={p.firstName}
            lastName={p.lastName}
            avatarUrl={p.avatarUrl}
            size={avatarSize}
            rounded
          />
        </div>
      ))}
    </div>
  );
}
