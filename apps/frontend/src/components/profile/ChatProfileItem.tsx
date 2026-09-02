import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { MouseEvent } from 'react';
import { useModalContext } from '@/context/ModalContext';
import { ProfileContent } from '@/app/profile/profileContent';
import { FullscreenModal } from '@/components/modal/FullscreenModal';
import { SelectedProfile } from '@/types/profile';
import { BaseProfileDTO } from '@repo/common';

interface ChatProfileItemProps {
  profile: BaseProfileDTO;
  onClearSelections: () => void;
  addSelectedProfile: (profile: SelectedProfile) => void;
}

export function ChatProfileItem(props: ChatProfileItemProps) {
  const { profile, onClearSelections, addSelectedProfile } = props;
  const { launchModal, closeModal } = useModalContext();

  const handleProfileClick = () => {
    onClearSelections();
    addSelectedProfile({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  };

  const handleOpenProfileModal = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    launchModal(
      <FullscreenModal header="New Message">
        <ProfileContent profileId={profile.id} />
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
