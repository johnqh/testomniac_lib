import { describe, expect, it } from 'vitest';
import {
  PRIORITY_LEVELS,
  getSurfacePriorityBand,
  priorityLabel,
  priorityShortLabel,
} from './priority';

describe('priority labels', () => {
  it('derives full labels matching the legacy "P{n} - Name" format', () => {
    expect(priorityLabel(0)).toBe('P0 - Crash');
    expect(priorityLabel(1)).toBe('P1 - Critical');
    expect(priorityLabel(4)).toBe('P4 - Suggestion');
  });

  it('falls back to "P{n}" for unknown levels', () => {
    expect(priorityLabel(9)).toBe('P9');
  });

  it('produces short labels', () => {
    expect(priorityShortLabel(0)).toBe('P0');
    expect(priorityShortLabel(3)).toBe('P3');
  });

  it('exposes the canonical levels', () => {
    expect(PRIORITY_LEVELS).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('getSurfacePriorityBand', () => {
  it('bands by score thresholds (>=8, 5-7, 3-4, <3)', () => {
    expect(getSurfacePriorityBand(10)).toBe('critical');
    expect(getSurfacePriorityBand(8)).toBe('critical');
    expect(getSurfacePriorityBand(7)).toBe('high');
    expect(getSurfacePriorityBand(5)).toBe('high');
    expect(getSurfacePriorityBand(4)).toBe('medium');
    expect(getSurfacePriorityBand(3)).toBe('medium');
    expect(getSurfacePriorityBand(2)).toBe('low');
    expect(getSurfacePriorityBand(0)).toBe('low');
  });
});
