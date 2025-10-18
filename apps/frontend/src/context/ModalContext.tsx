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

interface ModalContext {
  showModal: boolean;
  modalNode: ReactNode | null;
  launchModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const defaultModalContext = {
  showModal: false,
  modalNode: null,
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
  const [showModal, setShowModal] = useState(false);
  const [modalNode, setModalNode] = useState<ReactNode>(null);

  const launchModal = (node: ReactNode) => {
    setModalNode(<Fragment key={`{modal-${DateTime.now()}}`}>{node}</Fragment>);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalNode(null);
  };

  return (
    <ModalContext.Provider
      value={{ showModal, modalNode, launchModal, closeModal }}
    >
      {children}
      {modalNode}
    </ModalContext.Provider>
  );
}
