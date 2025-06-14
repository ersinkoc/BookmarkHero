'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBookmark } from '@/hooks/use-bookmarks';
import { useCollections } from '@/hooks/use-collections';
import { useTags } from '@/hooks/use-tags';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const addBookmarkSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
  description: z.string().optional(),
  collectionIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
});

type AddBookmarkForm = z.infer<typeof addBookmarkSchema>;

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkModal({ isOpen, onClose }: AddBookmarkModalProps) {
  const createBookmark = useCreateBookmark();
  const { data: collectionsData } = useCollections();
  const { data: tagsData } = useTags();
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const collections = collectionsData?.collections || [];
  const tags = tagsData?.tags || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AddBookmarkForm>({
    resolver: zodResolver(addBookmarkSchema),
    defaultValues: {
      collectionIds: [],
      tagIds: [],
    },
  });

  const watchedUrl = watch('url');
  const watchedCollectionIds = watch('collectionIds');
  const watchedTagIds = watch('tagIds');

  const onSubmit = async (data: AddBookmarkForm) => {
    try {
      await createBookmark.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCollectionToggle = (collectionId: string) => {
    const current = watchedCollectionIds || [];
    if (current.includes(collectionId)) {
      setValue('collectionIds', current.filter(id => id !== collectionId));
    } else {
      setValue('collectionIds', [...current, collectionId]);
    }
  };

  const handleTagToggle = (tagId: string) => {
    const current = watchedTagIds || [];
    if (current.includes(tagId)) {
      setValue('tagIds', current.filter(id => id !== tagId));
    } else {
      setValue('tagIds', [...current, tagId]);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all border border-border">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-foreground"
                  >
                    Add Bookmark
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-accent rounded"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* URL */}
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
                      URL *
                    </label>
                    <input
                      {...register('url')}
                      type="url"
                      id="url"
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {errors.url && (
                      <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                      Title
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      id="title"
                      placeholder="Bookmark title (auto-detected if empty)"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      id="description"
                      rows={3}
                      placeholder="Add a description..."
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    />
                  </div>

                  {/* Collections */}
                  {collections.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Collections
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-border rounded-md p-2 space-y-1">
                        {collections.map((collection) => (
                          <label
                            key={collection.id}
                            className="flex items-center space-x-2 p-1 hover:bg-accent rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={watchedCollectionIds?.includes(collection.id) || false}
                              onChange={() => handleCollectionToggle(collection.id)}
                              className="rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">{collection.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tags
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-border rounded-md p-2 space-y-1">
                        {tags.map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center space-x-2 p-1 hover:bg-accent rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={watchedTagIds?.includes(tag.id) || false}
                              onChange={() => handleTagToggle(tag.id)}
                              className="rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">{tag.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createBookmark.isPending}
                      className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {createBookmark.isPending && <LoadingSpinner size="sm" />}
                      <span>Add Bookmark</span>
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}