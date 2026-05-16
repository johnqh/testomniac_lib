import type { TestScheduleResponse } from '@sudobility/testomniac_types';

export const RECURRENCE_OPTIONS = [
  { value: 'one_time', label: 'One time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekday', label: 'Weekday' },
  { value: 'weekly', label: 'Weekly' },
] as const;

export const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export function describeScheduleTarget(schedule: TestScheduleResponse): string {
  if (schedule.testSurfaceBundleId)
    return `Bundle #${schedule.testSurfaceBundleId}`;
  if (schedule.testSurfaceId) return `Surface #${schedule.testSurfaceId}`;
  if (schedule.testInteractionId)
    return `Element #${schedule.testInteractionId}`;
  return 'Unknown target';
}

export function describeRecurrence(schedule: TestScheduleResponse): string {
  if (schedule.recurrenceType === 'weekly' && schedule.dayOfWeek != null) {
    const day =
      DAY_OPTIONS.find(option => option.value === schedule.dayOfWeek)?.label ??
      'Day';
    return `Weekly on ${day} at ${schedule.timeOfDay}`;
  }
  if (schedule.recurrenceType === 'weekday') {
    return `Weekdays at ${schedule.timeOfDay}`;
  }
  if (schedule.recurrenceType === 'daily') {
    return `Daily at ${schedule.timeOfDay}`;
  }
  return `One time at ${schedule.timeOfDay}`;
}
