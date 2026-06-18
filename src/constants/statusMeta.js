// statusMeta.js — Shared status labels + colors for Queue (and Ideas) screens
export const STATUS_META = {
  overdue:     { label: 'Overdue',     color: '#C53030', bg: '#FDEDED' },
  scheduled:   { label: 'Scheduled',   color: '#2B6CB0', bg: '#EBF4FF' },
  incomplete:  { label: 'Incomplete',  color: '#B7791F', bg: '#FFF8E8' },
  unscheduled: { label: 'Unscheduled', color: '#4A5568', bg: '#F1F1EF' },
  converted:   { label: 'Converted',   color: '#2F855A', bg: '#E6F4EA' },
};

// Order matters here — Overdue first, per D015 (immediate attention)
// Note: 'converted' is intentionally NOT in this array — it's only used for
// the Ideas flag, not for Queue's status grouping, since commitments are
// never 'converted'. Adding it here would just create an always-empty group.
export const STATUS_ORDER = ['overdue', 'scheduled', 'incomplete', 'unscheduled'];