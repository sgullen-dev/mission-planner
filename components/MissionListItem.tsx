import type { Mission, MissionStatus } from '../lib/types';
import { timeAgo } from '../lib/timeago';
import { ACTION_BUTTON_STYLE, accentHoverHandlers, alertHoverHandlers } from '../lib/constants';
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
  const editedAgo = timeAgo(mission.updatedAt);

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
        {waypointCount} waypoint{waypointCount !== 1 ? 's' : ''} · edited {editedAgo}
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
          className="font-mono"
          style={ACTION_BUTTON_STYLE}
          {...alertHoverHandlers()}
          title="Delete mission"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
