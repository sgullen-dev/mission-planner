import { useMissionContext } from '../context/MissionContext';
import MissionList from './MissionList';
import MissionEditor from './MissionEditor';

/**
 * Left rail panel (300px). Shows either the mission list or the mission editor,
 * depending on whether a mission is selected.
 */
export default function Rail() {
  const { workingCopy } = useMissionContext();
  const isEditing = workingCopy !== null;

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
          className="shrink-0"
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
            MARITIME C2
          </div>
        </div>
      </div>

      {/* Content: either list or editor */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? <MissionEditor /> : <MissionList />}
      </div>
    </div>
  );
}
