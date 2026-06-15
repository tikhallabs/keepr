// src/constants/theme.js
// Keepr Design System — Single source of truth for all UI
// Never hardcode colours, fonts or spacing in screen files — always reference this file

export const colors = {
  background: '#FAFAFA',      // App background
  surface: '#FFFFFF',         // Card and modal backgrounds
  primary: '#1A1A2E',         // Brand navy — headings, primary buttons
  accent: '#C9A84C',          // Gold — highlights, active states, CTAs
  border: '#E8E8E8',          // Subtle dividers and borders
  textPrimary: '#1A1A2E',     // Main text
  textSecondary: '#6B7280',   // Labels, hints, metadata
  error: '#DC2626',           // Errors, overdue states
  success: '#16A34A',         // Completions, confirmations
};

export const typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 32,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};
export const borderRadius = radius;