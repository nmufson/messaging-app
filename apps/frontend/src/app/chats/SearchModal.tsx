import { useModalContext } from '@/context/ModalContext';
import { usePotentialChats } from '@/hooks/chat';
import { useMessages } from '@/hooks/messages';
import { ChatListDTO, ListProfileDTO } from '@repo/common';
import { useState } from 'react';

export function SearchModal() {
  const { closeModal } = useModalContext();
  const [searchInput, setSearchInput] = useState('');

  // TODO: use getPotentialChats endpoint
  // getMessages
  // getPhotoMessages

  const { profiles, groupChats } = usePotentialChats({
    searchString: searchInput,
  });

  const combinedList: (ListProfileDTO | ChatListDTO)[] = [
    ...profiles,
    ...groupChats,
  ];

  const { textMessages, photoMessages } = useMessages({ searchInput });

  return (
    <div>
      {combinedList.length > 0 &&
        combinedList.map((item) => {
          return <div></div>;
        })}
      <div></div>
    </div>
  );
}

function ChatResultItem() {}
