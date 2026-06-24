import { useState, useRef, useEffect } from 'react';
import type { MissionStatus } from '../lib/types';
import { STATUS_DEFS, getStatusDef, DROPDOWN_STYLE } from '../lib/constants';

interface StatusDropdownProps {
  status: MissionStatus;
  onChange: (status: MissionStatus) => void;
  /** Which side the dropdown opens toward */
  align?: 'left' | 'right';
}

/**
 * Custom dropdown for selecting a mission status.
 * Displays as a colored chip with a chevron; opens a flat dark dropdown panel.
 * Reused in both the mission list cards and the mission editor.
 */
export default function StatusDropdown({ status, onChange, align = 'left' }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const current = getStatusDef(status);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="font-mono uppercase cursor-pointer flex items-center"
        style={{
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: 1,
          borderRadius: 5,
          padding: '5px 8px',
          height: 28,
          color: current.color,
          background: current.bg,
          border: `1px solid ${current.border}`,
          gap: 6,
        }}
      >
        {current.label}
        <svg
          width="8" height="5" viewBox="0 0 8 5" fill="none"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <path d="M1 1l3 3 3-3" stroke={current.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          style={{
            ...DROPDOWN_STYLE,
            [align === 'right' ? 'right' : 'left']: 0,
          }}
        >
          {STATUS_DEFS.map(opt => {
            const isActive = status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="font-mono uppercase w-full flex items-center cursor-pointer"
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: 1,
                  padding: '6px 8px',
                  borderRadius: 5,
                  border: 'none',
                  color: opt.color,
                  background: isActive ? opt.bg : 'transparent',
                  gap: 7,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? opt.bg : 'transparent'; }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
