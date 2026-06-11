// Format a Date as a local 'YYYY-MM-DD' string.
//
// We deliberately read the Date's local year/month/day rather than using
// toISOString(), which converts to UTC first. For users east of UTC, a
// locally-constructed midnight (e.g. new Date(2026, 4, 1)) falls on the
// previous day in UTC, so toISOString() would shift the calendar day back by
// one. Reading local components keeps the string aligned with the day the
// user actually sees.
export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parse a stored date value as a local calendar day at midnight.
//
// PocketBase stores our date fields at midnight UTC (e.g.
// '2026-05-01 00:00:00.000Z'), but quit dates, slip dates and tracking entries
// all represent a day the user picked, not an instant. We read the 'YYYY-MM-DD'
// portion and rebuild it in local time so the day isn't shifted by the UTC
// offset (which would put users behind UTC a day early).
export function parseDay(value) {
  if (!value) return null
  const [y, m, d] = String(value).split(/[ T]/)[0].split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// Whole days from the most recent of the given stored day values to today.
// Returns `empty` when none of the values are present.
export function daysSinceLatest(values, empty = null) {
  const times = values.filter(Boolean).map(v => parseDay(v)?.getTime()).filter(t => t != null)
  if (!times.length) return empty
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((today - Math.max(...times)) / 86400000))
}
