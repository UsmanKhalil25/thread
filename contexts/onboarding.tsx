import { useSegments } from 'expo-router';
import { createContext, useContext, type PropsWithChildren } from 'react';

const STEPS: Record<string, number> = {
  index: 1,
  privacy: 2,
  suggestion: 3,
};

const TOTAL = Object.keys(STEPS).length;

interface OnboardingContextValue {
  step: number;
  total: number;
}

const OnboardingContext = createContext<OnboardingContextValue>({ step: 1, total: TOTAL });

export function OnboardingProvider({ children }: PropsWithChildren) {
  const segments = useSegments();
  const last = segments[segments.length - 1];
  const currentSegment = !last || last === '(onboarding)' ? 'index' : last;
  const step = STEPS[currentSegment] ?? 1;

  return (
    <OnboardingContext.Provider value={{ step, total: TOTAL }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
