import { useState } from 'react';
import type { Waypoint } from '../lib/types';
import { formatCoords, formatLat, formatLng } from '../lib/coords';
import { INPUT_STYLE, inputFocusHandlers } from '../lib/constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WaypointRowProps {
  waypoint: Waypoint;
  /** 1-based sequence number */
  sequenceNumber: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onUpdateCoords: (id: string, lat: number, lng: number) => void;
}

/**
 * Format a number to exactly 4 decimal places for display in the input field.
 * e.g. 33.95 → "33.9500", -118.4339 → "-118.4339"
 */
function toFixedDisplay(value: number): string {
  return value.toFixed(4);
}

/**
 * Try to parse a string as a valid coordinate number.
 * Returns null if the string is empty, a lone minus sign, or non-numeric.
 */
function parseCoord(input: string): number | null {
  const trimmed = input.trim();
  // Allow empty or partial typing (lone "-", trailing ".") without crashing
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
    return null;
  }
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return null;
  return parsed;
}

/**
 * A single waypoint row in the editor.
 * - Name is read-only text by default; becomes an input when selected.
 * - Drag handle (⋮⋮) on the left for reordering via dnd-kit.
 * - Expands when selected to show labeled decimal-degree inputs with live DDM preview.
 */
export default function WaypointRow({
  waypoint,
  sequenceNumber,
  isSelected,
  onSelect,
  onDelete,
  onRename,
  onUpdateCoords,
}: WaypointRowProps) {
  // DDM string used by both the collapsed row and the expanded preview
  const coordsString = formatCoords(waypoint.lat, waypoint.lng);

  // dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  // Local state for the input fields so the user can type freely
  // without every keystroke committing to the waypoint.
  const [latInput, setLatInput] = useState(toFixedDisplay(waypoint.lat));
  const [lngInput, setLngInput] = useState(toFixedDisplay(waypoint.lng));

  // Keep local inputs in sync when the waypoint changes externally (e.g. drag on map)
  const [lastWaypointId, setLastWaypointId] = useState(waypoint.id);
  const [lastLat, setLastLat] = useState(waypoint.lat);
  const [lastLng, setLastLng] = useState(waypoint.lng);

  if (waypoint.id !== lastWaypointId || waypoint.lat !== lastLat || waypoint.lng !== lastLng) {
    setLatInput(toFixedDisplay(waypoint.lat));
    setLngInput(toFixedDisplay(waypoint.lng));
    setLastWaypointId(waypoint.id);
    setLastLat(waypoint.lat);
    setLastLng(waypoint.lng);
  }

  /**
   * Compute a live DDM preview from whatever the user has typed.
   * Falls back to the waypoint's current value if the input is not yet valid.
   */
  const previewLat = parseCoord(latInput);
  const previewLng = parseCoord(lngInput);

  const latIsValid = previewLat !== null && previewLat >= -90 && previewLat <= 90;
  const lngIsValid = previewLng !== null && previewLng >= -180 && previewLng <= 180;

  const ddmLatPreview = latIsValid ? formatLat(previewLat) : formatLat(waypoint.lat);
  const ddmLngPreview = lngIsValid ? formatLng(previewLng) : formatLng(waypoint.lng);

  /**
   * Commit the input values when the user blurs the field or presses Enter.
   * Only writes valid, in-range numbers to state. Invalid input is reset.
   */
  function commitCoords() {
    const parsedLat = parseCoord(latInput);
    const parsedLng = parseCoord(lngInput);

    const latOk = parsedLat !== null && parsedLat >= -90 && parsedLat <= 90;
    const lngOk = parsedLng !== null && parsedLng >= -180 && parsedLng <= 180;

    if (latOk && lngOk) {
      // Round to 4 decimal places before committing
      const cappedLat = parseFloat(parsedLat.toFixed(4));
      const cappedLng = parseFloat(parsedLng.toFixed(4));
      onUpdateCoords(waypoint.id, cappedLat, cappedLng);
    } else {
      // Reset to the waypoint's current valid values
      setLatInput(toFixedDisplay(waypoint.lat));
      setLngInput(toFixedDisplay(waypoint.lng));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      commitCoords();
      (e.target as HTMLInputElement).blur();
    }
  }

  const focusHandlers = inputFocusHandlers();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...sortableStyle,
        padding: 8,
        borderRadius: 7,
        background: isDragging
          ? 'rgba(47,216,207,0.15)'
          : isSelected
            ? 'rgba(47,216,207,0.09)'
            : 'transparent',
        borderLeft: isSelected ? '2px solid #2FD8CF' : '2px solid transparent',
      }}
      onClick={() => onSelect(waypoint.id)}
      className="cursor-pointer transition-colors"
    >
      {/* Main row: drag handle, sequence number, name/coords, delete */}
      <div className="flex items-center" style={{ gap: 7 }}>
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 font-mono"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            fontSize: 14,
            fontWeight: 600,
            color: isSelected ? '#9DB0C6' : '#6A7E97',
            padding: '4px 4px',
            userSelect: 'none',
            touchAction: 'none',
            lineHeight: 1,
          }}
          title="Drag to reorder"
        >
          ⋮⋮
        </div>

        {/* Sequence number — rounded square */}
        <div
          className="flex-shrink-0 flex items-center justify-center font-mono"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: isSelected ? 'none' : '1px solid rgba(47,216,207,0.5)',
            background: isSelected ? '#2FD8CF' : 'transparent',
            fontSize: 11,
            fontWeight: 600,
            color: isSelected ? '#06141A' : '#2FD8CF',
          }}
        >
          {sequenceNumber}
        </div>

        {/* Waypoint name + DDM coordinates (collapsed view) */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
          <div
            className="font-sans truncate"
            style={{
              fontSize: 12.5,
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? '#FFFFFF' : '#D7E2EF',
            }}
          >
            {waypoint.name}
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: 9.5,
              fontWeight: 500,
              color: isSelected ? '#7FC9C8' : '#506178',
            }}
          >
            {coordsString}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(waypoint.id);
          }}
          className="flex-shrink-0 cursor-pointer font-mono"
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1,
            color: isSelected ? '#9DB0C6' : '#6A7E97',
            background: 'none',
            border: 'none',
            padding: '4px 6px',
            borderRadius: 4,
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F0555E';
            e.currentTarget.style.background = 'rgba(240,85,94,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isSelected ? '#9DB0C6' : '#6A7E97';
            e.currentTarget.style.background = 'none';
          }}
          title="Delete waypoint"
        >
          ✕
        </button>
      </div>

      {/* Expanded panel — shown when selected */}
      {isSelected && (
        <div
          style={{ marginTop: 8, marginLeft: 40 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Editable name input */}
          <div style={{ marginBottom: 8 }}>
            <label
              className="font-mono block"
              style={{ fontSize: 9, fontWeight: 600, color: '#506178', letterSpacing: 1, marginBottom: 3 }}
            >
              NAME
            </label>
            <input
              type="text"
              value={waypoint.name}
              onChange={(e) => onRename(waypoint.id, e.target.value)}
              className="font-sans w-full"
              style={{ ...INPUT_STYLE, fontSize: 12 }}
              {...focusHandlers}
              placeholder="Waypoint name"
            />
          </div>

          {/* Decimal-degree coordinate inputs */}
          <div className="flex" style={{ gap: 8 }}>
            {/* Latitude */}
            <div className="flex-1">
              <label
                className="font-mono block"
                style={{ fontSize: 9, fontWeight: 600, color: '#506178', letterSpacing: 1, marginBottom: 3 }}
              >
                LATITUDE (°)
              </label>
              <input
                type="text"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                onBlur={(e) => { commitCoords(); focusHandlers.onBlur(e); }}
                onFocus={focusHandlers.onFocus}
                onKeyDown={handleKeyDown}
                className="font-mono"
                style={INPUT_STYLE}
              />
              {/* Live DDM preview */}
              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: latIsValid ? '#7FC9C8' : '#F0555E',
                  marginTop: 3,
                }}
              >
                {latIsValid ? ddmLatPreview : 'Invalid'}
              </div>
            </div>

            {/* Longitude */}
            <div className="flex-1">
              <label
                className="font-mono block"
                style={{ fontSize: 9, fontWeight: 600, color: '#506178', letterSpacing: 1, marginBottom: 3 }}
              >
                LONGITUDE (°)
              </label>
              <input
                type="text"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                onBlur={(e) => { commitCoords(); focusHandlers.onBlur(e); }}
                onFocus={focusHandlers.onFocus}
                onKeyDown={handleKeyDown}
                className="font-mono"
                style={INPUT_STYLE}
              />
              {/* Live DDM preview */}
              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: lngIsValid ? '#7FC9C8' : '#F0555E',
                  marginTop: 3,
                }}
              >
                {lngIsValid ? ddmLngPreview : 'Invalid'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
