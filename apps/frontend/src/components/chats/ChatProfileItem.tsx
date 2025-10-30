import { ListProfileDTO } from '@repo/common';
import { ProfilePreview } from '@/components/profile/ProfilePreview';
import { Dispatch, SetStateAction, MouseEvent } from 'react';
import { useModalContext } from '@/context/ModalContext';
import { ProfileContent } from '@/app/profile/profileContent';
import { FullscreenModal } from '@/components/modal/FullscreenModal';

interface ChatProfileItemProps {
  profile: ListProfileDTO;
  onClearSelections: () => void;
  setSelectedProfile: Dispatch<SetStateAction<any>>;
}

export function ChatProfileItem(props: ChatProfileItemProps) {
  const { profile, onClearSelections, setSelectedProfile } = props;
  const { launchModal, closeModal } = useModalContext();

  const handleProfileClick = () => {
    onClearSelections();
    setSelectedProfile([
      {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    ]);
  };

  const handleOpenProfileModal = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    launchModal(
      <FullscreenModal>
        <div className="flex flex-col">
          <div onClick={closeModal} className="flex items-center gap-2 p-4">
            <i className="bi bi-caret-left-fill text-xl" />
            <p className="font-semibold text-lg">New Message</p>
          </div>
          <ProfileContent profileId={profile.id} />
        </div>
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
