import { BaseProfileDTO } from '@repo/common';
import { ProfilePreview } from '@/components/profile/ProfilePreview';

interface ProfileResultItemProps {
  profile: BaseProfileDTO;
  onAddProfile: (profile: BaseProfileDTO) => void;
  className?: string;
}

export function ProfileResultItem(props: ProfileResultItemProps) {
  const { profile, onAddProfile, className } = props;
  return (
    <ProfilePreview
      profile={profile}
      onClick={() => onAddProfile(profile)}
      className={className}
    />
  );
}
