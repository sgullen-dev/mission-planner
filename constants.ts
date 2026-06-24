import type { MissionStatus } from './types';

/* ---- Status definitions with display colors ---- */

export interface StatusDef {
  value: MissionStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const STATUS_DEFS: StatusDef[] = [
  { value: 'draft',    label: 'Draft',    color: '#9DB0C6', bg: 'rgba(255,255,255,0.06)',   border: 'rgba(255,255,255,0.12)' },
  { value: 'active',   label: 'Active',   color: '#F4B73E', bg: 'rgba(244,183,62,0.13)',    border: 'rgba(244,183,62,0.32)' },
  { value: 'complete', label: 'Complete', color: '#46C98A', bg: 'rgba(70,201,138,0.13)',    border: 'rgba(70,201,138,0.3)' },
];

export function getStatusDef(status: MissionStatus): StatusDef {
  return STATUS_DEFS.find(s => s.value === status)!;
}

/* ---- Shared inline style constants ---- */

export const BORDER_SUBTLE = '1px solid rgba(255,255,255,0.07)';
export const BORDER_MEDIUM = '1px solid rgba(255,255,255,0.1)';

export const DROPDOWN_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  marginTop: 4,
  background: '#111B2E',
  border: BORDER_MEDIUM,
  borderRadius: 7,
  padding: 4,
  zIndex: 50,
  minWidth: 110,
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

export const MODAL_BACKDROP_STYLE: React.CSSProperties = {
  background: 'rgba(5,9,16,0.66)',
  backdropFilter: 'blur(3px)',
};

export const MODAL_CONTAINER_STYLE: React.CSSProperties = {
  width: 400,
  maxWidth: 'calc(100% - 32px)',
  background: '#111B2E',
  border: BORDER_MEDIUM,
  borderRadius: 14,
  padding: 24,
  gap: 15,
  boxShadow: '0 40px 90px -20px rgba(0,0,0,0.8)',
};

export const INPUT_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#D7E2EF',
  background: '#0A1322',
  border: BORDER_MEDIUM,
  borderRadius: 5,
  padding: '6px 8px',
  outline: 'none',
  width: '100%',
};

export const ACTION_BUTTON_STYLE: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  color: '#9DB0C6',
  background: 'rgba(255,255,255,0.05)',
  border: BORDER_MEDIUM,
  borderRadius: 5,
  padding: '4px 8px',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

/* ---- Hover handler helpers ---- */

/**
 * Returns onMouseEnter/onMouseLeave props for an accent-colored hover effect.
 */
export function accentHoverHandlers() {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = 'rgba(47,216,207,0.12)';
      e.currentTarget.style.color = '#2FD8CF';
      e.currentTarget.style.borderColor = 'rgba(47,216,207,0.3)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      e.currentTarget.style.color = '#9DB0C6';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    },
  };
}

/**
 * Returns onMouseEnter/onMouseLeave props for a destructive (red) hover effect.
 */
export function alertHoverHandlers() {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = 'rgba(240,85,94,0.12)';
      e.currentTarget.style.color = '#F0555E';
      e.currentTarget.style.borderColor = 'rgba(240,85,94,0.3)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      e.currentTarget.style.color = '#9DB0C6';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    },
  };
}

/**
 * Returns onFocus/onBlur props for accent-bordered input focus styling.
 */
export function inputFocusHandlers() {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = 'rgba(47,216,207,0.45)';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47,216,207,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      e.currentTarget.style.boxShadow = 'none';
    },
  };
}
