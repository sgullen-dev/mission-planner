import { useState, useRef, useEffect } from 'react';
import type { Mission, MissionStatus, RouteColor } from '../lib/types';
import { ROUTE_COLORS } from '../lib/types';
import { BORDER_SUBTLE, DROPDOWN_STYLE } from '../lib/constants';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import StatusDropdown from './StatusDropdown';
import WaypointRow from './WaypointRow';
import SaveBar from './SaveBar';

interface MissionEditorProps {
  mission: Mission;
  isDirty: boolean;
  selectedWaypointId: string | null;
  onBack: () => void;
  onUpdateName: (name: string) => void;
  onUpdateStatus: (status: MissionStatus) => void;
  onUpdateColor: (color: RouteColor) => void;
  onSelectWaypoint: (id: string) => void;
  onRenameWaypoint: (id: string, name: string) => void;
  onUpdateWaypointCoords: (id: string, lat: number, lng: number) => void;
  onDeleteWaypoint: (id: string) => void;
  onReorderWaypoints: (activeId: string, overId: string) => void;
  onImportMission: (data: Partial<Mission>) => void;
  onAddWaypoint: () => void;
  onSave: () => void;
  onDiscard: () => void;
  isPlacingWaypoint: boolean;
}

export default function MissionEditor({
  mission,
  isDirty,
  selectedWaypointId,
  onBack,
  onUpdateName,
  onUpdateStatus,
  onUpdateColor,
  onSelectWaypoint,
  onRenameWaypoint,
  onUpdateWaypointCoords,
  onDeleteWaypoint,
  onReorderWaypoints,
  onImportMission,
  onAddWaypoint,
  onSave,
  onDiscard,
  isPlacingWaypoint,
}: MissionEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderWaypoints(active.id as string, over.id as string);
    }
  }

  const waypointIds = mission.waypoints.map(wp => wp.id);

  // Color picker dropdown state
  const [isColorOpen, setIsColorOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isColorOpen) return;
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isColorOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="font-mono flex items-center cursor-pointer"
        style={{
          gap: 6,
          padding: '10px 18px',
          fontSize: 11,
          fontWeight: 500,
          color: '#9DB0C6',
          background: 'none',
          border: 'none',
          borderBottom: BORDER_SUBTLE,
          transition: 'color 0.15s',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>‹</span>
        Mission Profiles
      </button>

      {/* Mission header */}
      <div style={{ padding: '14px 16px', borderBottom: BORDER_SUBTLE }}>
        {/* Editable mission name */}
        <input
          type="text"
          value={mission.name}
          onChange={(e) => onUpdateName(e.target.value.toUpperCase())}
          className="font-sans w-full"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            fontWeight: 600,
            color: '#E7EEF7',
            padding: 0,
            marginBottom: 8,
          }}
        />

        {/* Code + status dropdown + color picker */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <span
            className="font-mono"
            style={{ fontSize: 10.5, fontWeight: 500, color: '#506178', letterSpacing: 0.4 }}
          >
            {mission.code}
          </span>

          <StatusDropdown
            status={mission.status}
            onChange={onUpdateStatus}
          />

          <div className="flex-1" />

          {/* Route color picker */}
          <div ref={colorRef} className="relative">
            <button
              onClick={() => setIsColorOpen(prev => !prev)}
              className="cursor-pointer flex items-center"
              style={{
                gap: 5,
                padding: '5px 8px',
                height: 28,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 5,
              }}
              title="Route color"
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: mission.color,
                  flexShrink: 0,
                }}
              />
              <svg
                width="8" height="5" viewBox="0 0 8 5" fill="none"
                style={{ transform: isColorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              >
                <path d="M1 1l3 3 3-3" stroke="#506178" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isColorOpen && (
              <div
                style={{
                  ...DROPDOWN_STYLE,
                  right: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  width: 120,
                  padding: 6,
                }}
              >
                {ROUTE_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { onUpdateColor(c.value); setIsColorOpen(false); }}
                    className="cursor-pointer"
                    title={c.label}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: c.value,
                      border: mission.color === c.value ? '2px solid #fff' : '2px solid transparent',
                      boxShadow: mission.color === c.value ? `0 0 0 2px ${c.value}40` : 'none',
                      padding: 0,
                      transition: 'all 0.1s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waypoint list — scrollable, drag-and-drop sortable */}
      <div
        className="flex-1 overflow-y-auto flex flex-col"
        style={{ padding: '8px 8px', gap: 2 }}
      >
        {mission.waypoints.length === 0 ? (
          <div
            className="font-sans text-center"
            style={{ padding: '32px 16px', fontSize: 12.5, color: '#6A7E97', lineHeight: 1.6 }}
          >
            No waypoints plotted yet.
            <br />
            Click "+ Add Waypoint" to begin.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={waypointIds} strategy={verticalListSortingStrategy}>
              {mission.waypoints.map((waypoint, index) => (
                <WaypointRow
                  key={waypoint.id}
                  waypoint={waypoint}
                  sequenceNumber={index + 1}
                  isSelected={waypoint.id === selectedWaypointId}
                  onSelect={onSelectWaypoint}
                  onDelete={onDeleteWaypoint}
                  onRename={onRenameWaypoint}
                  onUpdateCoords={onUpdateWaypointCoords}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add waypoint button */}
      <div style={{ padding: '10px 16px', borderTop: BORDER_SUBTLE }}>
        <button
          onClick={onAddWaypoint}
          disabled={isPlacingWaypoint}
          className="font-sans cursor-pointer w-full"
          style={{
            padding: '9px 12px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 7,
            border: isPlacingWaypoint
              ? '1px dashed rgba(47,216,207,0.5)'
              : '1px dashed rgba(255,255,255,0.12)',
            background: isPlacingWaypoint ? 'rgba(47,216,207,0.08)' : 'transparent',
            color: isPlacingWaypoint ? '#2FD8CF' : '#9DB0C6',
            transition: 'all 0.15s',
          }}
        >
          {isPlacingWaypoint ? 'Click map to plot waypoint…' : '+ Add Waypoint'}
        </button>
      </div>

      {/* Import / Export JSON */}
      <div
        className="flex"
        style={{ padding: '8px 16px', gap: 8, borderTop: BORDER_SUBTLE }}
      >
        <button
          onClick={() => {
            const exportData = {
              name: mission.name,
              code: mission.code,
              status: mission.status,
              color: mission.color,
              waypoints: mission.waypoints.map(wp => ({
                name: wp.name,
                lat: wp.lat,
                lng: wp.lng,
              })),
            };
            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `${mission.code}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
          }}
          className="font-mono cursor-pointer flex-1"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#9DB0C6',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5,
            padding: '6px 8px',
            transition: 'all 0.15s',
          }}
          title="Export mission as JSON file"
        >
          Export JSON
        </button>

        <label
          className="font-mono cursor-pointer flex-1 flex items-center justify-center"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#9DB0C6',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5,
            padding: '6px 8px',
            transition: 'all 0.15s',
          }}
          title="Import mission from JSON file"
        >
          Import JSON
          <input
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const data = JSON.parse(reader.result as string);
                  onImportMission(data);
                } catch {
                  console.warn('Failed to parse imported JSON file.');
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {/* Save bar */}
      <SaveBar
        isDirty={isDirty}
        lastSavedAt={mission.updatedAt}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    </div>
  );
}
