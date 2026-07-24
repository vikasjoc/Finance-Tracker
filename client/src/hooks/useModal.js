import { useState, useCallback } from 'react';

/**
 * Generic modal state management.
 * Tracks open/close, edit mode, and payload data.
 * Eliminates the repetitive useState pattern for modals.
 */
export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const open = useCallback((item = null) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setEditingItem(null);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    editingItem,
    open,
    close,
    isEditing: !!editingItem,
  };
}

