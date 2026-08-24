import { FullscreenModal } from '@/components/modal/FullscreenModal';
import { ComposeMessageModal } from '@/app/chats/ComposeMessageModal';
import { useModalContext } from '@/context/ModalContext';
import { SearchModal } from './SearchModal';

export function MessageSearchBar() {
  const { launchModal } = useModalContext();

  const handleOpenMainSearchModal = () => {
    launchModal(
      <FullscreenModal showHeader={false}>
        <SearchModal />
      </FullscreenModal>
    );
  };

  const handleOpenComposeMessageModal = () => {
    launchModal(
      <FullscreenModal showHeader={false}>
        <ComposeMessageModal />
      </FullscreenModal>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center py-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          <i className="bi bi-search" />
        </span>

        <button
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-left text-sm text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/30"
          onClick={handleOpenMainSearchModal}
        >
          Search chats
        </button>
      </div>
      <button
        onClick={handleOpenComposeMessageModal}
        className="ml-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-brand text-xl text-white shadow-sm shadow-brand/25 transition hover:bg-blue-600"
        aria-label="Compose message"
      >
        <i className="bi bi-pencil-square" />
      </button>
    </div>
  );
}
