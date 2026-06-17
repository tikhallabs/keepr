// statusMeta.js — Shared status labels + colors for Queue (and later Ideas) screens
export const STATUS_META = {
  overdue:     { label: 'Overdue',     color: '#C53030', bg: '#FDEDED' },
  scheduled:   { label: 'Scheduled',   color: '#2B6CB0', bg: '#EBF4FF' },
  incomplete:  { label: 'Incomplete',  color: '#B7791F', bg: '#FFF8E8' },
  unscheduled: { label: 'Unscheduled', color: '#4A5568', bg: '#F1F1EF' },
};

// Order matters here — Overdue first, per D015 (immediate attention)
export const STATUS_ORDER = ['overdue', 'scheduled', 'incomplete', 'unscheduled'];