import type { Mission, MissionStatus } from '../lib/types';

import { routeDistanceNm, formatNm } from '../lib/distance';
import { ACTION_BUTTON_STYLE, accentHoverHandlers } from '../lib/constants';
import StatusDropdown from './StatusDropdown';

interface MissionListItemProps {
  mission: Mission;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onFocus: (id: string) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: MissionStatus) => void;
}

/**
 * A single mission card in the list.
 * Shows name, status dropdown, summary, and action buttons.
 */
export default function MissionListItem({
  mission,
  isSelected,
  onSelect,
  onEdit,
  onFocus,
  onDelete,
  onSetStatus,
}: MissionListItemProps) {
  const waypointCount = mission.waypoints.length;

  return (
    <div
      onClick={() => onSelect(mission.id)}
      className="cursor-pointer transition-colors"
      style={{
        padding: '12px 13px',
        background: isSelected ? 'rgba(47,216,207,0.09)' : '#13203A',
        border: isSelected
          ? '1px solid rgba(47,216,207,0.28)'
          : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 9,
      }}
    >
      {/* Top row: color dot + name + status dropdown */}
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="flex items-center truncate" style={{ gap: 8, marginRight: 8 }}>
          <span
            className="flex-shrink-0"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: mission.color ?? '#2FD8CF',
            }}
          />
          <span
            className="font-sans truncate"
            style={{ fontSize: 14, fontWeight: 600, color: '#E7EEF7' }}
          >
            {mission.name}
          </span>
        </div>

        <StatusDropdown
          status={mission.status}
          onChange={(status) => onSetStatus(mission.id, status)}
          align="right"
        />
      </div>

      {/* Summary line */}
      <div
        className="font-mono"
        style={{ fontSize: 11, fontWeight: 500, color: '#6A7E97', marginBottom: 8 }}
      >
        {waypointCount} waypoint{waypointCount !== 1 ? 's' : ''}
        {waypointCount >= 2 && ` · ${formatNm(routeDistanceNm(mission.waypoints))}`}
      </div>

      {/* Action buttons row */}
      <div className="flex items-center" style={{ gap: 6 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(mission.id); }}
          className="font-sans"
          style={ACTION_BUTTON_STYLE}
          {...accentHoverHandlers()}
          title="Edit mission"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onFocus(mission.id); }}
          className="font-sans"
          style={ACTION_BUTTON_STYLE}
          {...accentHoverHandlers()}
          title="Focus on map"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>

        <div className="flex-1" />

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(mission.id); }}
          className="font-mono cursor-pointer"
          style={{
            color: '#6A7E97',
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
            e.currentTarget.style.color = '#6A7E97';
            e.currentTarget.style.background = 'none';
          }}
          title="Delete mission"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
