import { create } from 'zustand';
import type { RunStreamEvent } from '@sudobility/testomniac_types';

interface ScanProgressState {
  runId: number | null;
  phase: string;
  pagesFound: number;
  pageStatesFound: number;
  actionsCompleted: number;
  actionsRemaining: number;
  issuesFound: number;
  latestScreenshotUrl: string | null;
  currentPageUrl: string | null;
  events: RunStreamEvent[];
  isComplete: boolean;
  error: string | null;

  // Actions
  setRunId: (runId: number) => void;
  handleEvent: (event: RunStreamEvent) => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

const initialState = {
  runId: null as number | null,
  phase: 'pending',
  pagesFound: 0,
  pageStatesFound: 0,
  actionsCompleted: 0,
  actionsRemaining: 0,
  issuesFound: 0,
  latestScreenshotUrl: null as string | null,
  currentPageUrl: null as string | null,
  events: [] as RunStreamEvent[],
  isComplete: false,
  error: null as string | null,
};

export const useScanProgressStore = create<ScanProgressState>(set => ({
  ...initialState,

  setRunId: runId => set({ runId }),

  handleEvent: event =>
    set(state => {
      const events = [...state.events, event].slice(-100); // Keep last 100

      switch (event.type) {
        case 'phase_changed':
          return {
            ...state,
            events,
            phase: event.payload.phase as string,
          };
        case 'page_discovered':
          return {
            ...state,
            events,
            pagesFound: state.pagesFound + 1,
            currentPageUrl: event.payload.url as string,
          };
        case 'page_state_created':
          return {
            ...state,
            events,
            pageStatesFound: state.pageStatesFound + 1,
            latestScreenshotUrl:
              (event.payload.screenshotUrl as string) ??
              state.latestScreenshotUrl,
          };
        case 'stats_update': {
          const p = event.payload;
          return {
            ...state,
            events,
            pagesFound: (p.pages as number) ?? state.pagesFound,
            pageStatesFound: (p.pageStates as number) ?? state.pageStatesFound,
            actionsCompleted:
              (p.actionsCompleted as number) ?? state.actionsCompleted,
            actionsRemaining:
              (p.actionsRemaining as number) ?? state.actionsRemaining,
            issuesFound: (p.issues as number) ?? state.issuesFound,
            latestScreenshotUrl:
              (p.screenshotUrl as string) ?? state.latestScreenshotUrl,
            currentPageUrl:
              (p.currentPageUrl as string) ?? state.currentPageUrl,
          };
        }
        case 'action_completed':
          return {
            ...state,
            events,
            actionsCompleted: state.actionsCompleted + 1,
          };
        case 'issue_detected':
          return {
            ...state,
            events,
            issuesFound: state.issuesFound + 1,
          };
        case 'scan_completed':
          return {
            ...state,
            events,
            isComplete: true,
            phase: 'completed',
          };
        case 'scan_failed':
          return {
            ...state,
            events,
            isComplete: true,
            phase: 'failed',
            error: event.payload.error as string,
          };
        default:
          return { ...state, events };
      }
    }),

  reset: () => set(initialState),
  setError: error => set({ error }),
}));
