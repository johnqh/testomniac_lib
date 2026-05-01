import { create } from 'zustand';
import type { TestRunStreamEvent } from '@sudobility/testomniac_types';

interface ScanProgressState {
  testRunId: number | null;
  pagesFound: number;
  pageStatesFound: number;
  testRunsCompleted: number;
  findingsFound: number;
  suitesCreated: number;
  latestScreenshotUrl: string | null;
  currentPageUrl: string | null;
  events: TestRunStreamEvent[];
  isComplete: boolean;
  error: string | null;

  // Actions
  setTestRunId: (testRunId: number) => void;
  handleEvent: (event: TestRunStreamEvent) => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

const initialState = {
  testRunId: null as number | null,
  pagesFound: 0,
  pageStatesFound: 0,
  testRunsCompleted: 0,
  findingsFound: 0,
  suitesCreated: 0,
  latestScreenshotUrl: null as string | null,
  currentPageUrl: null as string | null,
  events: [] as TestRunStreamEvent[],
  isComplete: false,
  error: null as string | null,
};

export const useScanProgressStore = create<ScanProgressState>(set => ({
  ...initialState,

  setTestRunId: testRunId => set({ testRunId }),

  handleEvent: event =>
    set(state => {
      const events = [...state.events, event].slice(-100);

      switch (event.type) {
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
            testRunsCompleted:
              (p.testRunsCompleted as number) ?? state.testRunsCompleted,
            findingsFound: (p.findingsFound as number) ?? state.findingsFound,
            latestScreenshotUrl:
              (p.screenshotUrl as string) ?? state.latestScreenshotUrl,
            currentPageUrl:
              (p.currentPageUrl as string) ?? state.currentPageUrl,
          };
        }
        case 'test_suite_created':
          return {
            ...state,
            events,
            suitesCreated: state.suitesCreated + 1,
          };
        case 'child_run_completed':
          return {
            ...state,
            events,
            testRunsCompleted: state.testRunsCompleted + 1,
          };
        case 'finding_created':
          return {
            ...state,
            events,
            findingsFound: state.findingsFound + 1,
          };
        case 'run_completed':
          return {
            ...state,
            events,
            isComplete: true,
          };
        case 'run_failed':
          return {
            ...state,
            events,
            isComplete: true,
            error: event.payload.error as string,
          };
        default:
          return { ...state, events };
      }
    }),

  reset: () => set(initialState),
  setError: error => set({ error }),
}));
