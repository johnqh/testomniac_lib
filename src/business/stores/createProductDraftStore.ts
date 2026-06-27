import { create } from 'zustand';

/**
 * Tracks whether the dashboard "create product" form currently holds unsaved
 * input. Lifted into a shared store so the sidebar (a sibling surface) can warn
 * before a workspace/product selector switch navigates away and discards it.
 */
interface CreateProductDraftState {
  /** True while the create-product form has meaningful, unsaved input. */
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
}

export const useCreateProductDraftStore = create<CreateProductDraftState>(
  set => ({
    dirty: false,
    setDirty: (dirty: boolean) => set({ dirty }),
  })
);
