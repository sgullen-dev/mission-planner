import type { Mission, MissionStatus, RouteColor } from '../lib/types';
import MissionList from './MissionList';
import MissionEditor from './MissionEditor';

interface RailProps {
  /* List state */
  missions: Mission[];
  selectedMissionId: string | null;
  onSelectMission: (id: string) => void;
  onEditMission: (id: string) => void;
  onFocusMission: (id: string) => void;
  onDeleteMission: (id: string) => void;
  onSetMissionStatus: (id: string, status: MissionStatus) => void;
  onCreateMission: () => void;

  /* Editor state */
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
 * Left rail panel (300px). Shows either the mission list or the mission editor,
 * depending on whether a mission is selected.
 */
export default function Rail(props: RailProps) {
  const isEditing = props.workingCopy !== null;

  return (
    <div
      className="h-full bg-surface flex flex-col max-md:hidden"
      style={{
        width: 300,
        minWidth: 300,
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header with logo icon */}
      <div
        className="flex items-center gap-[11px]"
        style={{ padding: '18px 18px 15px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Rotated gradient logo square */}
        <div
          className="flex-shrink-0"
          style={{
            width: 24,
            height: 24,
            borderRadius: 5,
            background: 'linear-gradient(135deg, #2FD8CF, #16707C)',
            transform: 'rotate(45deg)',
          }}
        />

        <div style={{ lineHeight: 1.25 }}>
          <div
            className="font-mono"
            style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: '#E7EEF7' }}
          >
            MISSION PLANNER
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: 1.5, color: '#5C7186' }}
          >
            MARITIME C2 · v2.4
          </div>
        </div>
      </div>

      {/* Content: either list or editor */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <MissionEditor
            mission={props.workingCopy!}
            isDirty={props.isDirty}
            selectedWaypointId={props.selectedWaypointId}
            onBack={props.onBack}
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
    </div>
  );
}
