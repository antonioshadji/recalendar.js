import { getTimes } from "suncalc";

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
  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  let year;
  let month;
  let day;
  if (typeof date.year === "function") {
    year = date.year();
    month = date.month();
    day = date.date();
  } else {
    year = date.getFullYear();
    month = date.getMonth();
    day = date.getDate();
  }

  const timeFormat = config.timeFormat === "12h" ? "12h" : "24h";

  let tz = (config.timezone || "").trim();
  if (!tz) {
    tz =
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat().resolvedOptions().timeZone) ||
      "UTC";
  }

  let formatter;
  try {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: timeFormat === "12h" ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
    });
  } catch {
    formatter = new Intl.DateTimeFormat("en-US", {
      hour: timeFormat === "12h" ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
    });
  }

  // Target approximate local solar noon in UTC for the given longitude to ensure
  // calculations correspond to the specified calendar day
  const approxSolarNoonUtc = new Date(
    Date.UTC(year, month, day, 12, 0, 0) - (lng / 360) * 86400000,
  );

  const times = getTimes(approxSolarNoonUtc, lat, lng);
  const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

  const sunrise = isValidDate(times.sunrise)
    ? formatter.format(times.sunrise)
    : null;
  const sunset = isValidDate(times.sunset)
    ? formatter.format(times.sunset)
    : null;

  return {
    sunrise,
    sunset,
    alwaysUp: Boolean(times.alwaysUp),
    alwaysDown: Boolean(times.alwaysDown),
  };
}
