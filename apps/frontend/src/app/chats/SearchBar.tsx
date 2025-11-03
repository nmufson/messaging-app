import { FullscreenModal } from '@/components/modal/FullscreenModal';
import { WriteToChatModal } from '@/app/chats/WriteToChatModal';
import { useModalContext } from '@/context/ModalContext';
import { SearchModal } from './SearchModal';

export function MessageSearchBar() {
  const { launchModal } = useModalContext();

  const handleOpenMainSearchModal = () => {
    launchModal(
      <FullscreenModal>
        <SearchModal />
      </FullscreenModal>
    );
  };

  const handleOpenWriteToChatModal = () => {
    launchModal(
      <FullscreenModal>
        <WriteToChatModal />
      </FullscreenModal>
    );
  };

  return (
    <div className="flex items-center w-full max-w-xl mx-auto py-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          <i className="bi bi-search" />
        </span>

        <button
          className="w-full pl-10 pr-4 py-2 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-light"
          onClick={handleOpenMainSearchModal}
        >
          Search
        </button>
      </div>
      <button
        onClick={handleOpenWriteToChatModal}
        className="ml-3 text-brand-dark text-2xl p-2 hover:bg-gray-100 transition border-none"
      >
        <i className="bi bi-pencil-square" />
      </button>
    </div>
  );
}
