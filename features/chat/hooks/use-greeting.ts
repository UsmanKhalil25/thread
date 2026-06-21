type Greeting = readonly [string, string];

const MORNING: Greeting[] = [
  ['Good morning.', 'Fresh context, clean slate.'],
  ['Morning.', 'Let’s make something sharp.'],
  ['Good morning.', 'Small steps, strong signal.'],
  ['Morning.', 'The stack is quiet. Use it.'],
];

const AFTERNOON: Greeting[] = [
  ['Good afternoon.', "Let's get into it."],
  ['Good afternoon.', 'Momentum window is open.'],
  ['Afternoon.', 'A good time to untangle things.'],
  ['Good afternoon.', 'Ship the useful bit first.'],
];

const EVENING: Greeting[] = [
  ['Good evening.', 'Still got a clean pass left in you?'],
  ['Evening.', 'Low light, high focus.'],
  ['Good evening.', 'Time to make the idea concrete.'],
  ['Evening.', 'Trim the noise. Keep the signal.'],
];

const LATE_NIGHT: Greeting[] = [
  ['Late night.', 'The quiet hours are listening.'],
  ['Still awake?', 'Careful work beats tired work.'],
  ['Late night.', 'One clean thought at a time.'],
  ['Night shift.', 'Make it small enough to finish.'],
];

function pick(options: Greeting[], seed: number) {
  return options[seed % options.length];
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

export function useGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();
  const seed = getDayOfYear(now) + hour;

  if (hour === 1 && minute === 23) return ['1:23', 'Sequence detected.'] as const;
  if (hour === 4 && minute === 20) return ['4:20', 'Signal acquired.'] as const;
  if (hour === 11 && minute === 11) return ['11:11', 'Make a wish, then ship it.'] as const;
  if (hour === 13 && minute === 37) return ['13:37', 'Elite hours.'] as const;
  if (hour === 22 && minute === 22) return ['22:22', 'A pattern worth noticing.'] as const;

  if (hour === 0 && minute === 0) return ['Midnight.', 'New day, same signal.'] as const;
  if (hour === 2 && minute === 0) return ['2 AM.', 'The quiet part of the internet.'] as const;

  if (hour >= 5 && hour < 12) {
    if (day === 1) return ['Monday morning.', 'Fresh week. Lower the entropy.'] as const;
    if (day === 6 || day === 0) return ['Weekend morning.', 'No rush, still useful.'] as const;
    return pick(MORNING, seed);
  }

  if (hour >= 12 && hour < 17) {
    if (hour === 12 && minute === 0) return ['Noon.', 'Midday checkpoint.'] as const;
    if (day === 5) return ['Friday afternoon.', 'Finish the part future-you needs.'] as const;
    if (hour >= 14 && hour < 16) return ['Slump hours.', 'Tiny task, clean win.'] as const;
    return pick(AFTERNOON, seed);
  }

  if (hour >= 17 && hour < 21) {
    if (hour === 17) return ['Five o’clock.', 'Last useful push?'] as const;
    if (day === 5 || day === 6)
      return ['Weekend evening.', 'Keep it light. Make it count.'] as const;
    return pick(EVENING, seed);
  }

  if (hour >= 21 || hour < 5) {
    if (hour >= 23 || hour < 4) return pick(LATE_NIGHT, seed);
    return ['Good night.', 'Close the loop before you close the laptop.'] as const;
  }

  return ['Hello.', "What's on your mind?"] as const;
}
