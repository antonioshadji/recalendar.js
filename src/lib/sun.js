import { getTimes } from 'suncalc';

import { EVENT_DAY_TYPE } from '~/lib/special-dates-utils';

/**
 * Calculates sunrise and sunset times for a given date and location configuration.
 *
 * @param {import('dayjs').Dayjs | Date} date - The date to calculate sun times for.
 * @param {object} config - Configuration object containing latitude, longitude, timezone, and timeFormat.
 * @returns {{ sunrise: string | null, sunset: string | null, alwaysUp: boolean, alwaysDown: boolean } | null}
 */
export function getSunTimes(date, config = {}) {
  if (!date || config.latitude == null || config.longitude == null) {
    return null;
  }

  const lat = Number(config.latitude);
  const lng = Number(config.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  let year;
  let month;
  let day;
  if (typeof date.year === 'function') {
    year = date.year();
    month = date.month();
    day = date.date();
  } else {
    year = date.getFullYear();
    month = date.getMonth();
    day = date.getDate();
  }

  const timeFormat = config.timeFormat === '12h' ? '12h' : '24h';

  let tz = (config.timezone || '').trim();
  if (!tz) {
    tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  }

  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: timeFormat === '12h' ? 'numeric' : '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', {
      hour: timeFormat === '12h' ? 'numeric' : '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  }

  // Target approximate local solar noon in UTC for the given longitude to ensure
  // calculations correspond to the specified calendar day
  const approxSolarNoonUtc = new Date(Date.UTC(year, month, day, 12, 0, 0) - (lng / 360) * 86400000);

  const times = getTimes(approxSolarNoonUtc, lat, lng);
  const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

  const sunrise = isValidDate(times.sunrise) ? formatter.format(times.sunrise) : null;
  const sunset = isValidDate(times.sunset) ? formatter.format(times.sunset) : null;

  return {
    sunrise,
    sunset,
    alwaysUp: Boolean(times.alwaysUp),
    alwaysDown: Boolean(times.alwaysDown),
  };
}

/**
 * Calculates the exact UTC Date for equinoxes and solstices using Jean Meeus' astronomical algorithms.
 *
 * @param {number} year - The target year
 * @param {number} eventIndex - 0: March Equinox, 1: June Solstice, 2: Sept Equinox, 3: Dec Solstice
 * @returns {Date} UTC Date of the event
 */
function getEquinoxSolsticeDate(year, eventIndex) {
  const Y = (year - 2000) / 1000;
  let jde0 = 0;
  if (eventIndex === 0) {
    // March Equinox
    jde0 = 2451623.80984 + 365242.37404 * Y + 0.05169 * Y ** 2 - 0.00411 * Y ** 3 - 0.00057 * Y ** 4;
  } else if (eventIndex === 1) {
    // June Solstice
    jde0 = 2451716.56767 + 365241.62603 * Y + 0.00325 * Y ** 2 + 0.00888 * Y ** 3 - 0.0003 * Y ** 4;
  } else if (eventIndex === 2) {
    // September Equinox
    jde0 = 2451810.21715 + 365242.01767 * Y - 0.11575 * Y ** 2 + 0.00337 * Y ** 3 + 0.00078 * Y ** 4;
  } else {
    // December Solstice
    jde0 = 2451900.05952 + 365242.74049 * Y - 0.06223 * Y ** 2 - 0.05235 * Y ** 3 + 0.00019 * Y ** 4;
  }

  const T = (jde0 - 2451545.0) / 36525;
  const W = ((35999.373 * T - 2.47) * Math.PI) / 180;
  const deltaLambda = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);

  const periodicTerms = [
    [485, 324.96, 1934.136],
    [203, 279.12, 72001.539],
    [199, 13.13, 2892.678],
    [182, 171.51, 22029.625],
    [156, 285.43, 326.578],
    [136, 110.68, 8698.392],
    [77, 206.08, 13336.072],
    [74, 29.47, 45986.741],
    [70, 337.84, 30600.46],
    [58, 219.0, 32244.913],
    [52, 277.67, 800.767],
    [50, 27.72, 2187.745],
    [45, 207.72, 136.242],
    [44, 288.79, 74744.17],
    [32, 5.19, 2148.88],
    [28, 200.49, 1320.18],
    [17, 163.24, 7192.55],
    [13, 200.0, 30349.8],
    [11, 40.3, 83453.3],
    [10, 78.7, 7831.5],
    [10, 325.3, 9037.9],
    [10, 170.8, 3968.6],
    [9, 10.9, 5653.1],
    [9, 54.3, 780.3],
  ];

  let S = 0;
  for (const [A, B, C] of periodicTerms) {
    const angle = ((B + C * T) * Math.PI) / 180;
    S += A * Math.cos(angle);
  }

  const jde = jde0 + (0.00001 * S) / deltaLambda;
  const deltaTSeconds = 69; // TT - UT difference for current era
  const jdUt = jde - deltaTSeconds / 86400;
  const unixMs = (jdUt - 2440587.5) * 86400000;

  return new Date(unixMs);
}

/**
 * Calculates the 4 seasonal astronomical events (equinoxes and solstices) for a given year in 24h format.
 *
 * @param {number} year - The target calendar year (e.g. 2027)
 * @param {string} [timezone=''] - The target timezone identifier
 * @returns {Array<{ date: string, value: string, type: string }>}
 */
export function getSeasonEvents(year, timezone = '') {
  let tz = (timezone || '').trim();
  if (!tz) {
    tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  }

  const events = [
    { index: 0, name: 'Spring Equinox' },
    { index: 1, name: 'Summer Solstice' },
    { index: 2, name: 'Fall Equinox' },
    { index: 3, name: 'Winter Solstice' },
  ];

  return events.map(({ index, name }) => {
    const d = getEquinoxSolsticeDate(year, index);

    // Format MM-DD in target timezone
    let monthStr = '';
    let dayStr = '';
    let timeStr = '';

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(d);

      for (const part of parts) {
        if (part.type === 'month') {
          monthStr = part.value;
        }
        if (part.type === 'day') {
          dayStr = part.value;
        }
        if (part.type === 'hour') {
          timeStr = `${part.value}:`;
        }
        if (part.type === 'minute') {
          timeStr += part.value;
        }
      }
    } catch {
      monthStr = String(d.getUTCMonth() + 1).padStart(2, '0');
      dayStr = String(d.getUTCDate()).padStart(2, '0');
      timeStr = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    }

    return {
      date: `${monthStr}-${dayStr}`,
      value: `${name} ${timeStr}`,
      type: EVENT_DAY_TYPE,
    };
  });
}
