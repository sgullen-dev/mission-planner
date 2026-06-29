import { useState } from 'react';
import type { MissionStatus } from '../lib/types';
import { BORDER_SUBTLE } from '../lib/constants';
import { useMissionContext } from '../context/MissionContext';
import MissionListItem from './MissionListItem';
import EmptyState from './EmptyState';

type FilterValue = 'all' | MissionStatus;

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Done', value: 'complete' },
];

export default function MissionList() {
  const {
    missions,
    selectedMissionId,
    onSelectMission,
    onEditMission,
    onFocusMission,
    onDeleteMission,
    onSetMissionStatus,
    onCreateMission,
  } = useMissionContext();

  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  // Filter missions based on the active filter tab
  const filteredMissions = activeFilter === 'all'
    ? missions
    : missions.filter(m => m.status === activeFilter);

  // If there are no missions at all, show the empty state
  if (missions.length === 0) {
    return <EmptyState onCreateMission={onCreateMission} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter row */}
      <div
        className="flex items-center gap-1"
        style={{
          padding: '10px 16px',
          borderBottom: BORDER_SUBTLE,
        }}
      >
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className="font-mono uppercase cursor-pointer"
              style={{
                padding: '5px 9px',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1,
                borderRadius: 5,
                border: isActive
                  ? '1px solid rgba(47,216,207,0.3)'
                  : '1px solid transparent',
                background: isActive ? 'rgba(47,216,207,0.1)' : 'transparent',
                color: isActive ? '#2FD8CF' : '#506178',
                transition: 'all 0.15s',
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Mission list — scrollable, card-based with gaps */}
      <div
        className="flex-1 overflow-y-auto flex flex-col"
        style={{ padding: '12px 12px', gap: 9 }}
      >
        {filteredMissions.length === 0 ? (
          <div
            className="font-sans text-center"
            style={{ padding: 24, fontSize: 13, color: '#6A7E97' }}
          >
            No {activeFilter} missions
          </div>
        ) : (
          filteredMissions.map(mission => (
            <MissionListItem
              key={mission.id}
              mission={mission}
              isSelected={mission.id === selectedMissionId}
              onSelect={onSelectMission}
              onEdit={onEditMission}
              onFocus={onFocusMission}
              onDelete={onDeleteMission}
              onSetStatus={onSetMissionStatus}
            />
          ))
        )}
      </div>

      {/* Create mission button */}
      <div style={{ padding: '12px 16px', borderTop: BORDER_SUBTLE }}>
        <button
          onClick={onCreateMission}
          className="font-sans cursor-pointer w-full flex items-center justify-center gap-1.5"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: '#06141A',
            background: '#2FD8CF',
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            boxShadow: '0 0 20px rgba(47,216,207,0.28)',
          }}
        >
          <span className="font-mono" style={{ fontSize: 15, fontWeight: 600 }}>+</span>
          Task a Mission
        </button>
      </div>
    </div>
  );
}
