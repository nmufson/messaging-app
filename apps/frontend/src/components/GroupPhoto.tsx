import { BaseProfileDTO } from '@repo/common';
import { ProfileAvatar } from './ProfileAvatar';

const GROUP_PHOTO_SPACING = {
  minFramePadding: 1,
  framePaddingRatio: 0.04,
  gapRatio: 0.02,
} as const;

const GROUP_PHOTO_LAYOUT = {
  one: {
    sizeRatio: 0.78,
    leftRatio: 0.11,
    topRatio: 0.11,
  },
  two: {
    primary: {
      sizeRatio: 0.54,
      leftRatio: 0,
      topRatio: 0.23,
    },
    secondary: {
      sizeRatio: 0.42,
      leftRatio: 0.54,
      topRatio: 0.29,
      addGap: true,
    },
  },
  three: {
    primary: {
      sizeRatio: 0.52,
      leftRatio: 0,
      topRatio: 0.19,
    },
    secondary: {
      sizeRatio: 0.4,
      leftRatio: 0.48,
      topRatio: 0.06,
      addGap: true,
    },
    tertiary: {
      sizeRatio: 0.4,
      leftRatio: 0.44,
      topRatio: 0.52,
      addGap: true,
      extraLeftRatio: 0.02,
    },
  },
} as const;

interface GroupPhotoProps {
  groupPictureUrl: string | null;
  // TODO: change this?
  participantProfiles: BaseProfileDTO[];
  size?: number;
  className?: string;
}

export function GroupPhoto(props: GroupPhotoProps) {
  const {
    groupPictureUrl,
    participantProfiles,
    size = 48,
    className = '',
  } = props;

  if (groupPictureUrl) {
    return (
      <img
        src={groupPictureUrl}
        alt="Group"
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Show up to 3 participants
  const displayProfiles = participantProfiles.slice(0, 3);
  const count = displayProfiles.length;
  const framePadding = Math.max(
    GROUP_PHOTO_SPACING.minFramePadding,
    size * GROUP_PHOTO_SPACING.framePaddingRatio
  );
  const innerSize = size - framePadding * 2;
  const gap = innerSize * GROUP_PHOTO_SPACING.gapRatio;

  return (
    <div
      className={`relative rounded-full border border-slate-200 bg-slate-100 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute"
        style={{
          left: framePadding,
          top: framePadding,
          width: innerSize,
          height: innerSize,
        }}
      >
        {count === 1 ? (
          <div
            className="absolute overflow-hidden rounded-full border border-white"
            style={{
              width: innerSize * GROUP_PHOTO_LAYOUT.one.sizeRatio,
              height: innerSize * GROUP_PHOTO_LAYOUT.one.sizeRatio,
              left: innerSize * GROUP_PHOTO_LAYOUT.one.leftRatio,
              top: innerSize * GROUP_PHOTO_LAYOUT.one.topRatio,
            }}
          >
            <ProfileAvatar
              profile={displayProfiles[0]}
              size={innerSize * GROUP_PHOTO_LAYOUT.one.sizeRatio}
              rounded
            />
          </div>
        ) : count === 2 ? (
          <>
            <div
              className="absolute overflow-hidden rounded-full border border-white"
              style={{
                width: innerSize * GROUP_PHOTO_LAYOUT.two.primary.sizeRatio,
                height: innerSize * GROUP_PHOTO_LAYOUT.two.primary.sizeRatio,
                left: innerSize * GROUP_PHOTO_LAYOUT.two.primary.leftRatio,
                top: innerSize * GROUP_PHOTO_LAYOUT.two.primary.topRatio,
              }}
            >
              <ProfileAvatar
                profile={displayProfiles[0]}
                size={innerSize * GROUP_PHOTO_LAYOUT.two.primary.sizeRatio}
                rounded
              />
            </div>

            <div
              className="absolute overflow-hidden rounded-full border border-white"
              style={{
                width: innerSize * GROUP_PHOTO_LAYOUT.two.secondary.sizeRatio,
                height: innerSize * GROUP_PHOTO_LAYOUT.two.secondary.sizeRatio,
                left:
                  innerSize * GROUP_PHOTO_LAYOUT.two.secondary.leftRatio +
                  (GROUP_PHOTO_LAYOUT.two.secondary.addGap ? gap : 0),
                top: innerSize * GROUP_PHOTO_LAYOUT.two.secondary.topRatio,
              }}
            >
              <ProfileAvatar
                profile={displayProfiles[1]}
                size={innerSize * GROUP_PHOTO_LAYOUT.two.secondary.sizeRatio}
                rounded
              />
            </div>
          </>
        ) : count === 3 ? (
          <>
            <div
              className="absolute overflow-hidden rounded-full border border-white"
              style={{
                width: innerSize * GROUP_PHOTO_LAYOUT.three.primary.sizeRatio,
                height: innerSize * GROUP_PHOTO_LAYOUT.three.primary.sizeRatio,
                left: innerSize * GROUP_PHOTO_LAYOUT.three.primary.leftRatio,
                top: innerSize * GROUP_PHOTO_LAYOUT.three.primary.topRatio,
              }}
            >
              <ProfileAvatar
                profile={displayProfiles[0]}
                size={innerSize * GROUP_PHOTO_LAYOUT.three.primary.sizeRatio}
                rounded
              />
            </div>

            <div
              className="absolute overflow-hidden rounded-full border border-white"
              style={{
                width: innerSize * GROUP_PHOTO_LAYOUT.three.secondary.sizeRatio,
                height:
                  innerSize * GROUP_PHOTO_LAYOUT.three.secondary.sizeRatio,
                left:
                  innerSize * GROUP_PHOTO_LAYOUT.three.secondary.leftRatio +
                  (GROUP_PHOTO_LAYOUT.three.secondary.addGap ? gap : 0),
                top: innerSize * GROUP_PHOTO_LAYOUT.three.secondary.topRatio,
              }}
            >
              <ProfileAvatar
                profile={displayProfiles[1]}
                size={innerSize * GROUP_PHOTO_LAYOUT.three.secondary.sizeRatio}
                rounded
              />
            </div>

            <div
              className="absolute overflow-hidden rounded-full border border-white"
              style={{
                width: innerSize * GROUP_PHOTO_LAYOUT.three.tertiary.sizeRatio,
                height: innerSize * GROUP_PHOTO_LAYOUT.three.tertiary.sizeRatio,
                left:
                  innerSize * GROUP_PHOTO_LAYOUT.three.tertiary.leftRatio +
                  (GROUP_PHOTO_LAYOUT.three.tertiary.addGap ? gap : 0) +
                  innerSize * GROUP_PHOTO_LAYOUT.three.tertiary.extraLeftRatio,
                top: innerSize * GROUP_PHOTO_LAYOUT.three.tertiary.topRatio,
              }}
            >
              <ProfileAvatar
                profile={displayProfiles[2]}
                size={innerSize * GROUP_PHOTO_LAYOUT.three.tertiary.sizeRatio}
                rounded
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
