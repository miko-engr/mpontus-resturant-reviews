import React, { useContext, useEffect } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import { useGlobalId } from "../hooks/useGlobalId";

/**
 * Modal Type
 *
 * Modals are passed around context as component types.
 */
export type Modal = React.ComponentType<any>;

/**
 * Modal Map
 *
 * Maps modal to unique ids generated by the hook.
 */
export type ModalMap = Record<string | number, Modal>;

/**
 * Modal Context
 *
 * Reponsible for storing visible modals.
 */
export const ModalContext = React.createContext<{
  modals: ModalMap;
  showModal: (key: keyof ModalMap, modal: Modal) => void;
  hideModal: (key: keyof ModalMap) => void;
}>({
  modals: {},
  showModal: () => undefined,
  hideModal: () => undefined
});

/**
 * Modal Provider
 *
 * Provides modal context to child components.
 */
export const ModalProvider: React.SFC = ({ children }) => {
  const [modals, setModals] = useState<ModalMap>({});

  // Add modal to the list of keys
  const showModal = (key: keyof ModalMap, modal: Modal) =>
    setModals(currentModals => ({ ...currentModals, [key]: modal }));
  const hideModal = (key: keyof ModalMap) =>
    setModals(currentModals => {
      const newModals = { ...currentModals };

      delete newModals[key];

      return newModals;
    });

  return (
    <ModalContext.Provider value={{ modals, showModal, hideModal }}>
      <React.Fragment>{children}</React.Fragment>
    </ModalContext.Provider>
  );
};

/**
 * Modal Manager
 *
 * Renders visible modals outside of the DOM heirarchy of the parent
 * component.
 */
export const ModalRoot = () => {
  const { modals } = useContext(ModalContext);

  return ReactDOM.createPortal(
    <React.Fragment>
      {Object.keys(modals).map(key => {
        const Component = modals[key];

        return <Component key={key} />;
      })}
    </React.Fragment>,
    document.body
  );
};

/**
 * React hook to use modals in stateless components
 */
export const useModal = (Component: React.ComponentType<any>) => {
  const key = useGlobalId();
  const [shown, setShown] = useState(false);
  const { showModal, hideModal } = useContext(ModalContext);

  useEffect(() => (shown ? showModal(key, Component) : hideModal(key)), [
    shown
  ]);

  return [() => setShown(true), () => setShown(false)];
};
