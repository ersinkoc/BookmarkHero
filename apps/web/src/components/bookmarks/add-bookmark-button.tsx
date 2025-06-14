'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AddBookmarkModal } from './add-bookmark-modal';

export function AddBookmarkButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Bookmark
      </button>

      <AddBookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}