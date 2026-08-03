/** Max length for Fitness module page header purpose copy. */
export const FITNESS_MODULE_PURPOSE_MAX_LENGTH = 90;

export function isValidFitnessModulePurpose(purpose: string): boolean {
  return purpose.length <= FITNESS_MODULE_PURPOSE_MAX_LENGTH;
}

export function assertFitnessModulePurpose(purpose: string): void {
  if (!isValidFitnessModulePurpose(purpose)) {
    throw new Error(
      `Fitness module purpose must be ≤ ${FITNESS_MODULE_PURPOSE_MAX_LENGTH} characters (got ${purpose.length})`
    );
  }
}
