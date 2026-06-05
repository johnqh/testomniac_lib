import type { TestInteractionResponse } from '@sudobility/testomniac_types';

/**
 * Generates a human-readable summary of a test interaction from its title,
 * starting path, and steps. Useful for displaying interaction previews
 * in sequence lists, bundle views, and scenario details.
 */
export function describeInteraction(
  interaction: Pick<
    TestInteractionResponse,
    'title' | 'startingPath' | 'stepsJson'
  >
): string {
  const parts: string[] = [];

  if (interaction.startingPath) {
    parts.push(`Navigate to ${interaction.startingPath}`);
  }

  const steps = parseSteps(interaction.stepsJson);
  for (const step of steps) {
    const desc = describeStep(step);
    if (desc) parts.push(desc);
  }

  if (parts.length === 0) {
    return interaction.title;
  }

  return parts.join(', ');
}

interface Step {
  actionType?: string;
  description?: string;
  selector?: string;
  value?: string;
  path?: string;
}

function parseSteps(stepsJson: unknown): Step[] {
  if (!stepsJson) return [];
  if (Array.isArray(stepsJson)) return stepsJson;
  return [];
}

function describeStep(step: Step): string | null {
  // Prefer the step's own description if it's meaningful
  if (step.description && step.description.length > 5) {
    return step.description;
  }

  const action = step.actionType;
  if (!action) return null;

  switch (action) {
    case 'goto':
      return step.path ? `Navigate to ${step.path}` : 'Navigate to page';
    case 'click':
      return step.selector ? `Click on ${step.selector}` : 'Click element';
    case 'fill':
      return step.selector
        ? `Fill in ${step.selector}${step.value ? ` with "${step.value}"` : ''}`
        : 'Fill in field';
    case 'type':
      return step.selector ? `Type in ${step.selector}` : 'Type text';
    case 'hover':
      return step.selector ? `Hover over ${step.selector}` : 'Hover element';
    case 'selectOption':
      return step.selector
        ? `Select option in ${step.selector}`
        : 'Select option';
    case 'check':
      return step.selector ? `Check ${step.selector}` : 'Check checkbox';
    case 'uncheck':
      return step.selector ? `Uncheck ${step.selector}` : 'Uncheck checkbox';
    case 'press':
      return step.value ? `Press ${step.value}` : 'Press key';
    default:
      return step.selector ? `${action} on ${step.selector}` : action;
  }
}
