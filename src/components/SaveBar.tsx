import { useState, useEffect } from 'react';
import { BORDER_SUBTLE } from '../lib/constants';

interface SaveBarProps {
  isDirty: boolean;
  lastSavedAt: number | null;
  onSave: () => void;
  onDiscard: () => void;
}

/**
 * Footer bar showing save state and action buttons.
 * Save button is amber when dirty (matching design), with glow shadow.
 * Unsaved dot pulses. Saved state shows green checkmark.
 */
export default function SaveBar({ isDirty, lastSavedAt, onSave, onDiscard }: SaveBarProps) {
  const [showSavedFlash, setShowSavedFlash] = useState(false);

  // When lastSavedAt changes and we're not dirty, flash the saved indicator
  useEffect(() => {
    if (lastSavedAt && !isDirty) {
      setShowSavedFlash(true);
      const timer = setTimeout(() => setShowSavedFlash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSavedAt, isDirty]);

  function formatSavedTime(epochMs: number): string {
    const date = new Date(epochMs);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} UTC`;
  }

  return (
    <div style={{ padding: '14px 16px', borderTop: BORDER_SUBTLE }}>
      {/* Save state indicator */}
      <div style={{ marginBottom: 10, height: 18 }}>
        {isDirty && (
          <span
            className="font-mono flex items-center"
            style={{ fontSize: 10.5, fontWeight: 500, color: '#F4B73E', gap: 7 }}
          >
            <span
              className="animate-pulse-dot"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#F4B73E',
              }}
            />
            Unsaved changes
          </span>
        )}
        {!isDirty && showSavedFlash && lastSavedAt && (
          <span className="font-mono flex items-center" style={{ gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#46C98A' }}>✓</span>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: '#46C98A' }}>
              Saved · {formatSavedTime(lastSavedAt)}
            </span>
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex" style={{ gap: 9 }}>
        <button
          onClick={onDiscard}
          disabled={!isDirty}
          className="font-sans cursor-pointer flex-1"
          style={{
            padding: 11,
            fontSize: 12.5,
            fontWeight: 600,
            borderRadius: 8,
            border: isDirty
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(255,255,255,0.05)',
            background: isDirty ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: isDirty ? '#9DB0C6' : '#506178',
            opacity: isDirty ? 1 : 0.5,
            cursor: isDirty ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Discard
        </button>

        <button
          onClick={onSave}
          disabled={!isDirty}
          className="font-sans cursor-pointer flex-1"
          style={{
            padding: 11,
            fontSize: 12.5,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            background: isDirty ? '#F4B73E' : 'rgba(244,183,62,0.3)',
            color: isDirty ? '#1A1206' : 'rgba(26,18,6,0.5)',
            boxShadow: isDirty ? '0 0 18px rgba(244,183,62,0.25)' : 'none',
            cursor: isDirty ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
