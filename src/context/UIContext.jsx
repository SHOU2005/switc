import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const showModal = useCallback((title, body, buttons) => {
    setModal({ title, body, buttons });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <UIContext.Provider value={{ toast, showToast, modal, showModal, closeModal }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
