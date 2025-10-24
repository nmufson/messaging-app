import { DateTime } from 'luxon';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  Fragment,
} from 'react';
import * as R from 'remeda';

interface ModalStackItem {
  key: string;
  node: ReactNode;
}

interface ModalContext {
  modalStack: ModalStackItem[];
  showModal: boolean;
  launchModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const defaultModalContext = {
  modalStack: [],
  showModal: false,
  closeModal: R.doNothing,
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
  const [modalStack, setModalStack] = useState<ModalStackItem[]>([]);

  const showModal = modalStack.length > 0;

  const launchModal = (node: ReactNode) => {
    const key = `modal-${DateTime.now().toMillis()}`;
    setModalStack((prev) => [
      ...prev,
      { key, node: <Fragment key={key}>{node}</Fragment> },
    ]);
  };

  const closeModal = () => {
    setModalStack((prev) => prev.slice(0, -1));
  };

  return (
    <ModalContext.Provider
      value={{ modalStack, showModal, launchModal, closeModal }}
    >
      {children}

      {modalStack.map((modalItem, index) => (
        <div
          key={modalItem.key}
          style={{
            zIndex: index + 1,
            // only the top modal is interactive
            pointerEvents: index === modalStack.length - 1 ? 'auto' : 'none',
          }}
        >
          {modalItem.node}
        </div>
      ))}
    </ModalContext.Provider>
  );
}
