import { columnMapping } from '../constants';
import { Order, LoginAttempt } from '../types';
import { isValid, parse, parseISO } from 'date-fns';

export const parseNumber = (value: any): number | null => {
  const n = Number(String(value ?? "").replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export const get = (row: Order, key: string): string | number | null | undefined => {
  return row[columnMapping[key]];
};

// Helper to extract Thai wall-clock components from a GAS ISO string (which is UTC-shifted)
// e.g. "2025-12-02T17:00:00.000Z" -> represents 2025-12-03 00:00:00 in Thailand
const getThaiComponents = (isoStr: string) => {
    const d = parseISO(isoStr);
    if (!isValid(d)) return null;
    
    // Add 7 hours to get the "Wall Clock" time in Thailand as UTC components
    // We treat the resulting UTC components as the actual local time values
    const thaiWallTime = new Date(d.getTime() + (7 * 60 * 60 * 1000));
    
    return {
        year: thaiWallTime.getUTCFullYear(),
        month: thaiWallTime.getUTCMonth(),
        day: thaiWallTime.getUTCDate(),
        hour: thaiWallTime.getUTCHours(),
        minute: thaiWallTime.getUTCMinutes(),
        second: thaiWallTime.getUTCSeconds()
    };
};

export const getRowDateTime = (row: Order): Date | null => {
    const timeStr = String(get(row, 'time') || "").trim();
    const dateStr = String(get(row, 'date') || "").trim();

    // Check for GAS ISO format (e.g. 2025-12-02T17:00:00.000Z)
    const isIsoDate = dateStr.includes('T') && dateStr.endsWith('Z');
    const isIsoTime = timeStr.includes('T') && timeStr.endsWith('Z');

    if (isIsoDate && isIsoTime) {
        const dateComps = getThaiComponents(dateStr);
        const timeComps = getThaiComponents(timeStr);

        if (dateComps && timeComps) {
            // Construct the final date assuming these components are meant for Thailand (UTC+7)
            // We use Date.UTC to build the timestamp, then subtract 7 hours to get the correct absolute instant
            const timestamp = Date.UTC(
                dateComps.year,
                dateComps.month,
                dateComps.day,
                timeComps.hour,
                timeComps.minute,
                timeComps.second
            ) - (7 * 60 * 60 * 1000);
            
            return new Date(timestamp);
        }
    }

    // Primary method: Text-based formats (dd/MM/yyyy)
    if (timeStr && dateStr) {
        const formats = [
            'd/M/yyyy HH:mm:ss',
            'd/M/yyyy HH:mm',
            'dd/MM/yyyy HH:mm:ss',
            'dd/MM/yyyy HH:mm',
            'yyyy-MM-dd HH:mm:ss',
            'yyyy-MM-dd HH:mm',
        ];

        for (const fmt of formats) {
            // Combine date and time string
            const combined = `${dateStr} ${timeStr}`;
            const date = parse(combined, fmt, new Date());
            if (isValid(date)) {
                return date;
            }
        }
    }

    // Fallback method: Use the main Timestamp column
    const timestampStr = get(row, 'timestamp') as string;
    if (timestampStr) {
        // Try parsing timestamp string with explicit formats, prioritizing Thai format
        const timestampFormats = [
             'd/M/yyyy HH:mm:ss',
             'dd/MM/yyyy HH:mm:ss',
             'd/M/yyyy, HH:mm:ss', // With comma
             'dd/MM/yyyy, HH:mm:ss', // With comma
             'yyyy-MM-dd HH:mm:ss'
        ];
        for (const fmt of timestampFormats) {
             const dt = parse(timestampStr, fmt, new Date());
             if (isValid(dt)) return dt;
        }

        // Try ISO parse last
        let date = parseISO(timestampStr);
        if (isValid(date)) return date;
        
        // Try standard Date constructor
        date = new Date(timestampStr);
        if (isValid(date)) return date;
    }
    
    // If all else fails, return null
    return null;
}

// --- Security Log & Session Management Functions ---

const LOGIN_HISTORY_KEY = 'baristai-eyes-loginHistory';
const BLOCKED_USERS_KEY = 'baristai-eyes-blockedUsers';
const FORCED_LOGOUT_KEY = 'baristai-eyes-forcedLogoutTimestamps';


async function getGeoLocation(): Promise<string> {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,message,city,country');
    if (!response.ok) return 'Location API Error';
    const data = await response.json();
     if (data.status === 'fail') {
        console.warn('Geolocation failed:', data.message);
        return 'Location lookup failed';
    }
    return `${data.city}, ${data.country}`;
  } catch (error) {
    return 'Unknown Location';
  }
}

export function getLoginHistory(): LoginAttempt[] {
  try {
    const historyJson = localStorage.getItem(LOGIN_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse login history:", error);
    return [];
  }
}

export async function logLoginAttempt(username: string, status: 'SUCCESS' | 'FAILED'): Promise<string> {
  const location = await getGeoLocation();
  const timestamp = new Date().toISOString();
  const newLog: LoginAttempt = {
    timestamp,
    role: username,
    location,
    status,
  };

  const history = getLoginHistory();
  // Keep the log from getting excessively large, cap at 100 entries
  const updatedHistory = [newLog, ...history].slice(0, 100); 
  
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(updatedHistory));
  return timestamp;
}

export function getBlockedUsers(): string[] {
  try {
    const blockedJson = localStorage.getItem(BLOCKED_USERS_KEY);
    return blockedJson ? JSON.parse(blockedJson) : [];
  } catch (error) {
    console.error("Failed to parse blocked users list:", error);
    return [];
  }
}

export function blockUser(username: string): void {
  if (username.toLowerCase() === 'admin') return; // Safety: cannot block the admin
  const blocked = getBlockedUsers();
  if (!blocked.includes(username)) {
    const updatedBlocked = [...blocked, username];
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updatedBlocked));
  }
}

export function unblockUser(username: string): void {
  const blocked = getBlockedUsers();
  const updatedBlocked = blocked.filter(u => u !== username);
  localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updatedBlocked));
}

export function getForcedLogoutTimestamps(): string[] {
    try {
        const forcedJson = localStorage.getItem(FORCED_LOGOUT_KEY);
        return forcedJson ? JSON.parse(forcedJson) : [];
    } catch (error) {
        console.error("Failed to parse forced logout list:", error);
        return [];
    }
}

export function forceLogoutSession(timestamp: string): void {
    const forced = getForcedLogoutTimestamps();
    if (!forced.includes(timestamp)) {
        const updatedForced = [...forced, timestamp];
        localStorage.setItem(FORCED_LOGOUT_KEY, JSON.stringify(updatedForced));
    }
}