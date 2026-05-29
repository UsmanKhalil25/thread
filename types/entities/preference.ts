import type { Persisted } from './persisted';

export interface Preference extends Persisted {
  // id mirrors the preference key (e.g., 'onboarding_complete')
  value: string;
}
