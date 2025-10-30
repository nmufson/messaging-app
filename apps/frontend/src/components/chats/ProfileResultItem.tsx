import { ListProfileDTO } from '@repo/common';
import { ProfilePreview } from '@/components/profile/ProfilePreview';

interface ProfileResultItemProps {
  profile: ListProfileDTO;
  onAddProfile: (profile: ListProfileDTO) => void;
}

export function ProfileResultItem(props: ProfileResultItemProps) {
  const { profile, onAddProfile } = props;
  return (
    <ProfilePreview profile={profile} onClick={() => onAddProfile(profile)} />
  );
}
