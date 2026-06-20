import { create } from 'zustand';

/**
 * The product selected in the dashboard sidebar. Lifted into a shared store (vs
 * local component state) so other surfaces — e.g. the "create product" flow —
 * can select a freshly-created product and have the sidebar reflect it.
 */
interface ProductSelectionState {
  /** Explicitly-selected product id (as a string), or null for "no choice yet". */
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
}

export const useProductSelectionStore = create<ProductSelectionState>(set => ({
  selectedProductId: null,
  setSelectedProductId: (id: string | null) => set({ selectedProductId: id }),
}));
