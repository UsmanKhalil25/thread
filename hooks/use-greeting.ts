export function useGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();

  if (hour === 4 && minute === 20) return ['4:20', 'Blaze it.'] as const;

  if (hour === 2 && minute === 0) return ['2 AM', 'The witching hour.'] as const;

  if (hour >= 5 && hour < 12) {
    if (day === 1) return ['Good morning.', 'Mondays hit different.'] as const;
    if (day === 6 || day === 0) return ['Good morning.', 'Weekend well spent?'] as const;
    return ['Good morning.', 'Coffee kicking in?'] as const;
  }

  if (hour >= 12 && hour < 17) {
    if (hour === 12 && minute === 0) return ['Lunch time.', 'What are we cooking?'] as const;
    if (day === 5) return ['Good afternoon.', 'You can smell the weekend.'] as const;
    if (hour >= 14 && hour < 16) return ['Good afternoon.', 'Peak slump hours.'] as const;
    return ['Good afternoon.', "Let's get into it."] as const;
  }

  if (hour >= 17 && hour < 21) {
    if (hour === 17) return ['Happy hour.', "What'll it be?"] as const;
    if (day === 5 || day === 6) return ['Good evening.', 'Weekend mode.'] as const;
    return ['Good evening.', 'Done with the day?'] as const;
  }

  if (hour >= 21 || hour < 5) {
    if (hour >= 23 || hour < 4) return ['Late night.', "Shouldn't you be sleeping?"] as const;
    return ['Good night.', 'Still at it?'] as const;
  }

  return ['Hello.', "What's on your mind?"] as const;
}
