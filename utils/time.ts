// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG

export const getTimeBucket = (date = new Date()): 
  'night' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'late-night' => {
  const hour = date.getHours(); // assume Asia/Bangkok frontend

  if (hour >= 0 && hour < 5) return 'night';
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'late-night';
};
