import { useState, useEffect, useMemo } from 'react';
import type { Mission, MissionStatus, RouteColor } from '../lib/types';
import MissionList from './MissionList';
import MissionEditor from './MissionEditor';

/**
 * Three detent heights for the mobile bottom sheet (vh).
 * Collapsed: just a status bar. Half: mission list. Full: editor.
 */
const DETENT_COLLAPSED = 7;
const DETENT_HALF = 54;
const DETENT_FULL = 92;

interface MobileSheetProps {
  missions: Mission[];
  selectedMissionId: string | null;
  onSelectMission: (id: string) => void;
  onEditMission: (id: string) => void;
  onFocusMission: (id: string) => void;
  onDeleteMission: (id: string) => void;
  onSetMissionStatus: (id: string, status: MissionStatus) => void;
  onCreateMission: () => void;
  workingCopy: Mission | null;
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
  onImportMission: (data: Partial<import('../lib/types').Mission>) => void;
  onAddWaypoint: () => void;
  onSave: () => void;
  onDiscard: () => void;
  isPlacingWaypoint: boolean;
}

/**
 * Mobile bottom sheet with three discrete states driven by user actions:
 *
 *   Collapsed  → shows active mission count (or placement mode text)
 *               tap to expand to Half
 *   Half       → shows the mission list
 *               "Edit" on a mission expands to Full
 *   Full       → shows the mission editor
 *               "+ Add Waypoint" collapses to Collapsed
 *               placing a waypoint re-expands to Full
 *               "‹ Back" returns to Half
 */
export default function MobileSheet(props: MobileSheetProps) {
  const [detent, setDetent] = useState<number>(DETENT_COLLAPSED);
  // Remember the last open position so we can restore it when toggling
  const [lastOpenDetent, setLastOpenDetent] = useState<number>(DETENT_HALF);

  const isEditing = props.workingCopy !== null;

  const activeMissionCount = useMemo(
    () => props.missions.filter(m => m.status === 'active').length,
    [props.missions]
  );

  // When a mission is opened for editing, expand to full
  useEffect(() => {
    if (isEditing && !props.isPlacingWaypoint) {
      setDetent(DETENT_FULL);
      setLastOpenDetent(DETENT_FULL);
    }
  }, [isEditing]);

  // When entering placement mode, collapse so the map is visible
  useEffect(() => {
    if (props.isPlacingWaypoint) {
      setDetent(DETENT_COLLAPSED);
    }
  }, [props.isPlacingWaypoint]);

  // When a waypoint is just placed (placement mode turns off while editing),
  // re-expand to full
  const [wasPlacing, setWasPlacing] = useState(false);
  useEffect(() => {
    if (props.isPlacingWaypoint) {
      setWasPlacing(true);
    } else if (wasPlacing && isEditing) {
      // Placement just ended and we're still editing — waypoint was placed
      setDetent(DETENT_FULL);
      setLastOpenDetent(DETENT_FULL);
      setWasPlacing(false);
    }
  }, [props.isPlacingWaypoint, wasPlacing, isEditing]);

  // When going back from editor to list, show half
  const originalOnBack = props.onBack;
  function handleBack() {
    originalOnBack();
    setDetent(DETENT_HALF);
    setLastOpenDetent(DETENT_HALF);
  }

  // Toggle the tray: if open, collapse (remembering position); if collapsed, restore
  function handleHandleTap() {
    if (props.isPlacingWaypoint) return; // don't expand during placement

    const isCurrentlyCollapsed = detent <= DETENT_COLLAPSED + 2;

    if (isCurrentlyCollapsed) {
      // Restore to the last open position
      setDetent(lastOpenDetent);
    } else {
      // Save current position and collapse
      setLastOpenDetent(detent);
      setDetent(DETENT_COLLAPSED);
    }
  }

  // Determine what to show in the collapsed bar
  function collapsedText(): string {
    if (props.isPlacingWaypoint) {
      const wpNum = (props.workingCopy?.waypoints.length ?? 0) + 1;
      return `Tap map to place waypoint ${wpNum}`;
    }
    if (isEditing) {
      return `${props.workingCopy!.code} · ${props.workingCopy!.name}`;
    }
    if (activeMissionCount === 0) {
      return 'No active missions';
    }
    return `${activeMissionCount} active mission${activeMissionCount !== 1 ? 's' : ''}`;
  }

  const isCollapsed = detent <= DETENT_COLLAPSED + 2;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col"
      style={{
        height: `${detent}vh`,
        background: '#0E1626',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '22px 22px 0 0',
        transition: 'height 0.3s ease-out',
      }}
    >
      {/* Handle / collapsed bar — always visible, tappable */}
      <div
        onClick={handleHandleTap}
        className="cursor-pointer"
        style={{ padding: '10px 16px' }}
      >
        {/* Drag handle indicator */}
        <div className="flex justify-center" style={{ marginBottom: isCollapsed ? 8 : 0 }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: '#506178' }} />
        </div>

        {/* Summary text — shown when collapsed */}
        {isCollapsed && (
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: props.isPlacingWaypoint ? '#2FD8CF' : '#6A7E97',
              textAlign: 'center',
            }}
          >
            {collapsedText()}
          </div>
        )}
      </div>

      {/* Content — only rendered when not collapsed */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {isEditing ? (
            <MissionEditor
              mission={props.workingCopy!}
              isDirty={props.isDirty}
              selectedWaypointId={props.selectedWaypointId}
              onBack={handleBack}
              onUpdateName={props.onUpdateName}
              onUpdateStatus={props.onUpdateStatus}
              onUpdateColor={props.onUpdateColor}
              onSelectWaypoint={props.onSelectWaypoint}
              onRenameWaypoint={props.onRenameWaypoint}
              onUpdateWaypointCoords={props.onUpdateWaypointCoords}
              onReorderWaypoints={props.onReorderWaypoints}
              onImportMission={props.onImportMission}
              onDeleteWaypoint={props.onDeleteWaypoint}
              onAddWaypoint={props.onAddWaypoint}
              onSave={props.onSave}
              onDiscard={props.onDiscard}
              isPlacingWaypoint={props.isPlacingWaypoint}
            />
          ) : (
            <MissionList
              missions={props.missions}
              selectedMissionId={props.selectedMissionId}
              onSelect={props.onSelectMission}
              onEdit={props.onEditMission}
              onFocus={props.onFocusMission}
              onDelete={props.onDeleteMission}
              onSetStatus={props.onSetMissionStatus}
              onCreate={props.onCreateMission}
            />
          )}
        </div>
      )}
    </div>
  );
}
