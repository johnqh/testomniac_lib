import { describe, it, expect, beforeEach } from 'vitest';
import { useCreateProductDraftStore } from './createProductDraftStore';

describe('useCreateProductDraftStore', () => {
  beforeEach(() => {
    useCreateProductDraftStore.setState({ dirty: false });
  });

  it('defaults to not dirty', () => {
    expect(useCreateProductDraftStore.getState().dirty).toBe(false);
  });

  it('setDirty toggles the flag', () => {
    useCreateProductDraftStore.getState().setDirty(true);
    expect(useCreateProductDraftStore.getState().dirty).toBe(true);

    useCreateProductDraftStore.getState().setDirty(false);
    expect(useCreateProductDraftStore.getState().dirty).toBe(false);
  });
});
