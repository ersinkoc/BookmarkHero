'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBookmark } from '@/hooks/use-bookmarks';
import { useCollections } from '@/hooks/use-collections';
import { useTags } from '@/hooks/use-tags';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
        </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* URL */}
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
                      URL *
                    </label>
                    <Input
                      {...register('url')}
                      type="url"
                      id="url"
                      placeholder="https://example.com"
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
                    <Input
                      {...register('title')}
                      type="text"
                      id="title"
                      placeholder="Bookmark title (auto-detected if empty)"
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
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBookmark.isPending}
                    >
                      {createBookmark.isPending && <LoadingSpinner size="sm" />}
                      <span>Add Bookmark</span>
                    </Button>
                  </div>
                </form>
      </DialogContent>
    </Dialog>
  );
}