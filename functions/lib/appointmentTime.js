/**
 * Parse booking day/time labels into a real Date (America/Chicago by default).
 * Supports: "Today at 3:00 PM", "Tomorrow at 11:00 AM", "Monday at 5:00 PM".
 */

const DEFAULT_TZ = "America/Chicago";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function localPartsInTz(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      weekday: "long",
    })
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0;
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour,
    minute: parseInt(parts.minute, 10),
    weekday: parts.weekday,
  };
}

/** UTC Date that displays as y-mo-d h:mi in `timeZone`. */
function makeUtcFromZoned(y, mo, d, h, mi, timeZone) {
  let utc = Date.UTC(y, mo - 1, d, h, mi, 0);
  for (let i = 0; i < 4; i++) {
    const p = localPartsInTz(new Date(utc), timeZone);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const desired = Date.UTC(y, mo - 1, d, h, mi);
    utc += desired - asUtc;
  }
  return new Date(utc);
}

function addCalendarDays(y, mo, d, add) {
  const dt = new Date(y, mo - 1, d + add);
  return { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
}

function parseClock(text) {
  const m = String(text || "").match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mi = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { hour: h, minute: mi };
}

function resolveTargetDate(dayLabel, nowParts) {
  const label = String(dayLabel || "").trim();
  const { year, month, day, weekday } = nowParts;

  if (/^today$/i.test(label)) {
    return { year, month, day };
  }
  if (/^tomorrow$/i.test(label)) {
    return addCalendarDays(year, month, day, 1);
  }

  const want = WEEKDAYS.findIndex((w) => w.toLowerCase() === label.toLowerCase());
  if (want < 0) return null;

  const current = WEEKDAYS.findIndex((w) => w.toLowerCase() === String(weekday).toLowerCase());
  const add = (want - current + 7) % 7; // 0 = today
  return addCalendarDays(year, month, day, add);
}

/**
 * @param {string} preferredTime e.g. "Monday at 3:00 PM"
 * @param {Date} [now]
 * @param {string} [timeZone]
 * @returns {{ appointmentAt: Date, timezone: string, preferredTime: string } | null}
 */
function resolveAppointmentAt(preferredTime, now = new Date(), timeZone = DEFAULT_TZ) {
  const text = String(preferredTime || "").trim();
  if (!text) return null;

  const atMatch = text.match(
    /\b(Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b\s*(?:at|@)?\s*(.+)/i
  );
  if (!atMatch) return null;

  const clock = parseClock(atMatch[2]);
  if (!clock) return null;

  const nowParts = localPartsInTz(now, timeZone);
  let target = resolveTargetDate(atMatch[1], nowParts);
  if (!target) return null;

  let appointmentAt = makeUtcFromZoned(
    target.year,
    target.month,
    target.day,
    clock.hour,
    clock.minute,
    timeZone
  );

  // If that slot already passed (same weekday today, or Today), roll forward
  if (appointmentAt.getTime() <= now.getTime() - 60 * 1000) {
    if (/^today$/i.test(atMatch[1])) {
      target = addCalendarDays(target.year, target.month, target.day, 1);
    } else if (!/^tomorrow$/i.test(atMatch[1])) {
      target = addCalendarDays(target.year, target.month, target.day, 7);
    } else {
      return null;
    }
    appointmentAt = makeUtcFromZoned(
      target.year,
      target.month,
      target.day,
      clock.hour,
      clock.minute,
      timeZone
    );
  }

  if (Number.isNaN(appointmentAt.getTime())) return null;

  return {
    appointmentAt,
    timezone: timeZone,
    preferredTime: text,
  };
}

module.exports = {
  DEFAULT_TZ,
  resolveAppointmentAt,
  parseClock,
  localPartsInTz,
};
