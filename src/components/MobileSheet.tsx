import { useState, useEffect, useMemo } from 'react';
import { useMissionContext, MissionContext } from '../context/MissionContext';
import MissionList from './MissionList';
import MissionEditor from './MissionEditor';

/**
 * Three detent heights for the mobile bottom sheet (vh).
 * Collapsed: just a status bar. Half: mission list. Full: editor.
 */
const DETENT_COLLAPSED = 7;
const DETENT_HALF = 54;
const DETENT_FULL = 92;

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
export default function MobileSheet() {
  const ctx = useMissionContext();
  const { missions, workingCopy, isPlacingWaypoint } = ctx;

  const [detent, setDetent] = useState<number>(DETENT_COLLAPSED);
  const [lastOpenDetent, setLastOpenDetent] = useState<number>(DETENT_HALF);

  const isEditing = workingCopy !== null;

  const activeMissionCount = useMemo(
    () => missions.filter(m => m.status === 'active').length,
    [missions]
  );

  // When a mission is opened for editing, expand to full
  useEffect(() => {
    if (isEditing && !isPlacingWaypoint) {
      setDetent(DETENT_FULL);
      setLastOpenDetent(DETENT_FULL);
    }
  }, [isEditing]);

  // When entering placement mode, collapse so the map is visible
  useEffect(() => {
    if (isPlacingWaypoint) {
      setDetent(DETENT_COLLAPSED);
    }
  }, [isPlacingWaypoint]);

  // When a waypoint is just placed (placement mode turns off while editing),
  // re-expand to full
  const [wasPlacing, setWasPlacing] = useState(false);
  useEffect(() => {
    if (isPlacingWaypoint) {
      setWasPlacing(true);
    } else if (wasPlacing && isEditing) {
      setDetent(DETENT_FULL);
      setLastOpenDetent(DETENT_FULL);
      setWasPlacing(false);
    }
  }, [isPlacingWaypoint, wasPlacing, isEditing]);

  // Override onBack to also update sheet detent
  const mobileCtxValue = useMemo(() => ({
    ...ctx,
    onBack: () => {
      ctx.onBack();
      setDetent(DETENT_HALF);
      setLastOpenDetent(DETENT_HALF);
    },
  }), [ctx]);

  // Toggle the tray: if open, collapse (remembering position); if collapsed, restore
  function handleHandleTap() {
    if (isPlacingWaypoint) return;

    const isCurrentlyCollapsed = detent <= DETENT_COLLAPSED + 2;

    if (isCurrentlyCollapsed) {
      setDetent(lastOpenDetent);
    } else {
      setLastOpenDetent(detent);
      setDetent(DETENT_COLLAPSED);
    }
  }

  // Determine what to show in the collapsed bar
  function collapsedText(): string {
    if (isPlacingWaypoint) {
      const wpNum = (workingCopy?.waypoints.length ?? 0) + 1;
      return `Tap map to place waypoint ${wpNum}`;
    }
    if (isEditing) {
      return `${workingCopy!.code} · ${workingCopy!.name}`;
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
              color: isPlacingWaypoint ? '#2FD8CF' : '#6A7E97',
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
            <MissionContext.Provider value={mobileCtxValue}>
              <MissionEditor />
            </MissionContext.Provider>
          ) : (
            <MissionList />
          )}
        </div>
      )}
    </div>
  );
}
