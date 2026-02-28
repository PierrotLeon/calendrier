/**
 * @module useModal
 * @description Simple boolean + payload state for controlling modals.
 *
 * Keeps the open/close logic out of component bodies and lets us pass
 * arbitrary data (e.g. an existing event to edit) when opening.
 */

import { useState, useCallback } from 'react';

/**
 * @returns {Object} `{ isOpen, data, open, close }`
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  /** Open the modal, optionally passing context data. */
  const open = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  /** Close the modal and clear its data. */
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
}
