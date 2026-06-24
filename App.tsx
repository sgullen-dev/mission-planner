import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMissions } from './hooks/useMissions';
import type { Waypoint } from './lib/types';
import { MODAL_BACKDROP_STYLE, MODAL_CONTAINER_STYLE } from './lib/constants';
import Rail from './components/Rail';
import MapCanvas from './components/MapCanvas';
import MobileSheet from './components/MobileSheet';
import DeleteConfirmModal from './components/DeleteConfirmModal';

export default function App() {
  const {
    missions,
    selectedMissionId,
    workingCopy,
    isDirty,
    createMission,
    deleteMission,
    setMissionStatus,
    selectMission,
    deselectMission,
    updateMissionName,
    updateMissionStatus,
    updateMissionColor,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    reorderWaypoints,
    importMission,
    saveWorkingCopy,
    discardWorkingCopy,
  } = useMissions();

  // Placement mode: user is about to click the map to drop a waypoint
  const [isPlacingWaypoint, setIsPlacingWaypoint] = useState(false);

  // Selected waypoint for bidirectional highlighting
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  // Mission pending deletion (for the confirm modal)
  const [missionToDelete, setMissionToDelete] = useState<typeof missions[0] | null>(null);

  // Mission pending navigation away from dirty editor
  const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(null);
  const [pendingDeselect, setPendingDeselect] = useState(false);

  // Focus system: waypoints to fly to, and a trigger counter
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [focusWaypoints, setFocusWaypoints] = useState<Waypoint[]>([]);

  // Active missions to show on the map when not editing
  const activeMissions = useMemo(
    () => missions.filter(m => m.status === 'active'),
    [missions]
  );

  // Cancel placement mode on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isPlacingWaypoint) {
        setIsPlacingWaypoint(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingWaypoint]);

  /* ---- Handlers ---- */

  /**
   * Handle clicking a mission card in the list.
   * This is a soft select — highlights the card but doesn't open the editor.
   */
  const handleSelectMission = useCallback((_id: string) => {
    // Clicking the card row itself is now a no-op for editing.
    // Use the explicit Edit button instead.
  }, []);

  /**
   * Handle the "Edit" button — opens the mission in the editor.
   * If dirty, ask the user to confirm before switching.
   */
  const handleEditMission = useCallback((id: string) => {
    const success = selectMission(id);
    if (!success) {
      setPendingNavigationId(id);
    } else {
      // Trigger map focus on the newly selected mission
      const mission = missions.find(m => m.id === id);
      if (mission) {
        setFocusWaypoints(mission.waypoints);
        setFocusTrigger(prev => prev + 1);
      }
    }
    setSelectedWaypointId(null);
    setIsPlacingWaypoint(false);
  }, [selectMission, missions]);

  /**
   * Handle the "Focus" button — flies the map to a mission's waypoints
   * without entering the editor.
   */
  const handleFocusMission = useCallback((id: string) => {
    const mission = missions.find(m => m.id === id);
    if (mission && mission.waypoints.length > 0) {
      setFocusWaypoints(mission.waypoints);
      setFocusTrigger(prev => prev + 1);
    }
  }, [missions]);

  /**
   * Handle going back to the mission list from the editor.
   */
  const handleBack = useCallback(() => {
    const success = deselectMission();
    if (!success) {
      setPendingDeselect(true);
    }
    setSelectedWaypointId(null);
    setIsPlacingWaypoint(false);
  }, [deselectMission]);

  /**
   * Confirm discarding unsaved changes and proceed with navigation.
   */
  const handleConfirmDiscard = useCallback(() => {
    discardWorkingCopy();

    if (pendingNavigationId) {
      setTimeout(() => {
        selectMission(pendingNavigationId);
        setFocusTrigger(prev => prev + 1);
        setPendingNavigationId(null);
      }, 0);
    } else if (pendingDeselect) {
      setTimeout(() => {
        deselectMission();
        setPendingDeselect(false);
      }, 0);
    }
  }, [discardWorkingCopy, pendingNavigationId, pendingDeselect, selectMission, deselectMission]);

  const handleCancelDiscard = useCallback(() => {
    setPendingNavigationId(null);
    setPendingDeselect(false);
  }, []);

  /**
   * Enter placement mode — the next map click will create a waypoint.
   */
  const handleAddWaypoint = useCallback(() => {
    setIsPlacingWaypoint(true);
  }, []);

  /**
   * Handle a map click during placement mode — creates a new waypoint.
   */
  const handleMapClick = useCallback((lng: number, lat: number) => {
    if (!isPlacingWaypoint) return;

    const waypointNumber = (workingCopy?.waypoints.length ?? 0) + 1;
    const newWaypoint: Waypoint = {
      id: crypto.randomUUID(),
      name: `WP-${waypointNumber.toString().padStart(2, '0')}`,
      lng,
      lat,
    };

    addWaypoint(newWaypoint);
    setIsPlacingWaypoint(false);
    setSelectedWaypointId(newWaypoint.id);
  }, [isPlacingWaypoint, workingCopy, addWaypoint]);

  /**
   * Handle dragging a waypoint marker to a new position.
   */
  const handleWaypointDragEnd = useCallback((waypointId: string, lng: number, lat: number) => {
    updateWaypoint(waypointId, { lng, lat });
  }, [updateWaypoint]);

  /**
   * Handle selecting a waypoint (from either the list or the map).
   */
  const handleSelectWaypoint = useCallback((id: string) => {
    setSelectedWaypointId(prevId => prevId === id ? null : id);
  }, []);

  /**
   * Handle renaming a waypoint from the editor row.
   */
  const handleRenameWaypoint = useCallback((id: string, name: string) => {
    updateWaypoint(id, { name });
  }, [updateWaypoint]);

  /**
   * Handle updating waypoint coordinates from the inline lat/lng inputs.
   */
  const handleUpdateWaypointCoords = useCallback((id: string, lat: number, lng: number) => {
    updateWaypoint(id, { lat, lng });
  }, [updateWaypoint]);

  /**
   * Handle delete button click — show confirmation modal.
   */
  const handleRequestDelete = useCallback((id: string) => {
    const mission = missions.find(m => m.id === id);
    if (mission) {
      setMissionToDelete(mission);
    }
  }, [missions]);

  /**
   * Confirm deletion of a mission.
   */
  const handleConfirmDelete = useCallback(() => {
    if (missionToDelete) {
      deleteMission(missionToDelete.id);
      setMissionToDelete(null);
    }
  }, [missionToDelete, deleteMission]);

  /* ---- Shared props for Rail and MobileSheet ---- */
  const sharedProps = {
    missions,
    selectedMissionId,
    onSelectMission: handleSelectMission,
    onEditMission: handleEditMission,
    onFocusMission: handleFocusMission,
    onDeleteMission: handleRequestDelete,
    onSetMissionStatus: setMissionStatus,
    onCreateMission: createMission,
    workingCopy,
    isDirty,
    selectedWaypointId,
    onBack: handleBack,
    onUpdateName: updateMissionName,
    onUpdateStatus: updateMissionStatus,
    onUpdateColor: updateMissionColor,
    onSelectWaypoint: handleSelectWaypoint,
    onRenameWaypoint: handleRenameWaypoint,
    onUpdateWaypointCoords: handleUpdateWaypointCoords,
    onDeleteWaypoint: deleteWaypoint,
    onReorderWaypoints: reorderWaypoints,
    onImportMission: importMission,
    onAddWaypoint: handleAddWaypoint,
    onSave: saveWorkingCopy,
    onDiscard: discardWorkingCopy,
    isPlacingWaypoint,
  };

  return (
    <div className="flex h-full w-full">
      {/* Desktop: left rail */}
      <Rail {...sharedProps} />

      {/* Map fills the remaining space */}
      <MapCanvas
        editingMission={workingCopy}
        activeMissions={activeMissions}
        isPlacingWaypoint={isPlacingWaypoint}
        selectedWaypointId={selectedWaypointId}
        focusWaypoints={focusWaypoints}
        focusTrigger={focusTrigger}
        onMapClick={handleMapClick}
        onWaypointDrag={handleWaypointDragEnd}
        onWaypointDragEnd={handleWaypointDragEnd}
        onSelectWaypoint={handleSelectWaypoint}
      />

      {/* Mobile: bottom sheet */}
      <MobileSheet {...sharedProps} />

      {/* Delete confirmation modal */}
      {missionToDelete && (
        <DeleteConfirmModal
          mission={missionToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setMissionToDelete(null)}
        />
      )}

      {/* Unsaved changes confirmation dialog */}
      {(pendingNavigationId || pendingDeselect) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={MODAL_BACKDROP_STYLE}
            onClick={handleCancelDiscard}
          />
          <div
            className="relative flex flex-col"
            style={MODAL_CONTAINER_STYLE}
          >
            {/* Amber warning icon + title on same line */}
            <div className="flex items-center" style={{ gap: 12 }}>
              <div
                className="flex-shrink-0 flex items-center justify-center font-sans"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'rgba(244,183,62,0.13)',
                  border: '1px solid rgba(244,183,62,0.3)',
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#F4B73E',
                }}
              >
                ⚠
              </div>
              <h3
                className="font-sans"
                style={{ fontSize: 15, fontWeight: 600, color: '#E7EEF7' }}
              >
                Unsaved changes
              </h3>
            </div>
            <p
              className="font-sans"
              style={{ fontSize: 12.5, fontWeight: 400, lineHeight: 1.6, color: '#9DB0C6' }}
            >
              You have unsaved changes. Discard them and continue?
            </p>
            <div className="flex" style={{ gap: 9, marginTop: 4 }}>
              <button
                onClick={handleCancelDiscard}
                className="font-sans cursor-pointer flex-1"
                style={{
                  padding: 11,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#9DB0C6',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                }}
              >
                Keep Editing
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="font-sans cursor-pointer flex-1"
                style={{
                  padding: 11,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#1A1206',
                  background: '#F4B73E',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 0 18px rgba(244,183,62,0.25)',
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
