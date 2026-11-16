import { useSyncExternalStore } from 'react';
import { SynapseStore } from './synapseStore.js';

// Single application-wide store instance (client-side demo state, persisted to localStorage).
export const store = new SynapseStore();

// Subscribe a component to store changes. Returns the current state snapshot and the store.
export function useSynapse() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { state, store };
}
