import { useSelectedValues } from '@/hooks/general';
import { DateTime } from 'luxon';
import { usePathname } from 'next/navigation';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Fragment,
  useEffect,
} from 'react';
import * as R from 'remeda';

interface ModalStackItem {
  key: string;
  node: ReactNode;
}

interface ModalContext {
  modals: ModalStackItem[];
  showModal: boolean;
  launchModal: (content: ReactNode) => void;
  closeModal: () => void;
  closeAllModals: () => void;
}

const defaultModalContext = {
  modals: [],
  showModal: false,
  closeModal: R.doNothing,
  closeAllModals: R.doNothing,
  launchModal: R.doNothing,
};

const ModalContext = createContext<ModalContext>(defaultModalContext);

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error('useModal must be used within a ModalContextWrapper');
  return ctx;
};

export function ModalContextWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    values: modals,
    setValues: setModals,
    add: addModal,
    clear: clearModals,
    hasAny: showModal,
  } = useSelectedValues<ModalStackItem>([]);

  const launchModal = (node: ReactNode) => {
    const key = `modal-${DateTime.now().toMillis()}`;
    addModal({ key, node: <Fragment key={key}>{node}</Fragment> });
  };

  const closeModal = () => {
    setModals((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    // auto close modals on path change
    clearModals();
  }, [pathname, clearModals]);

  return (
    <ModalContext.Provider
      value={{
        modals,
        showModal,
        launchModal,
        closeModal,
        closeAllModals: clearModals,
      }}
    >
      {children}

      {modals.map((modalItem, index) => (
        <div
          key={modalItem.key}
          style={{
            zIndex: index + 1,
            // only the top modal is interactive
            pointerEvents: index === modals.length - 1 ? 'auto' : 'none',
          }}
        >
          {modalItem.node}
        </div>
      ))}
    </ModalContext.Provider>
  );
}
