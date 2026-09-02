import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { MouseEvent } from 'react';
import { useModalContext } from '@/context/ModalContext';
import { ProfileContent } from '@/app/profile/profileContent';
import { FullscreenModal } from '@/components/modal/FullscreenModal';
import { BaseProfileDTO } from '@repo/common';

interface ChatProfileSubItemProps {
  profile: BaseProfileDTO;
  onSelectProfile: (profile: BaseProfileDTO) => void;
}

export function ChatProfileSubItem(props: ChatProfileSubItemProps) {
  const { profile, onSelectProfile } = props;
  const { launchModal } = useModalContext();

  const handleProfileClick = () => {
    onSelectProfile(profile);
  };

  const handleOpenProfileModal = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    launchModal(
      <FullscreenModal header="New Message">
        <ProfileContent profileId={profile.id} showBackButton={false} />
      </FullscreenModal>
    );
  };

  return (
    <ProfilePreview
      profile={profile}
      onClick={handleProfileClick}
      rightContent={
        <div tabIndex={0} role="button" onClick={handleOpenProfileModal}>
          <i className="bi bi-info-circle" />
        </div>
      }
    />
  );
}
