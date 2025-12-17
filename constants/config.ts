
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG

export const LOCATION_CACHE_KEY = 'userLocationMeta';
export const LOCATION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const RATE_LIMIT_BUCKETS = [
  { windowSec: 30, limit: 3 },
  { windowSec: 600, limit: 10 }
];

export const DAILY_QUOTA_DEFAULT = 30;
