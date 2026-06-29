import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useMissions } from '../hooks/useMissions';
import type { Mission, MissionStatus, RouteColor, Waypoint } from '../lib/types';

/* ---- Context value type ---- */

export interface MissionContextValue {
  /* Mission data */
  missions: Mission[];
  selectedMissionId: string | null;
  workingCopy: Mission | null;
  isDirty: boolean;
  activeMissions: Mission[];

  /* UI state */
  isPlacingWaypoint: boolean;
  selectedWaypointId: string | null;
  focusTrigger: number;
  focusWaypoints: Waypoint[];

  /* Modal state */
  missionToDelete: Mission | null;
  showDiscardDialog: boolean;

  /* List actions */
  onSelectMission: (id: string) => void;
  onEditMission: (id: string) => void;
  onFocusMission: (id: string) => void;
  onDeleteMission: (id: string) => void;
  onSetMissionStatus: (id: string, status: MissionStatus) => void;
  onCreateMission: () => void;

  /* Editor actions */
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

  /* Map actions */
  onMapClick: (lng: number, lat: number) => void;
  onWaypointDrag: (waypointId: string, lng: number, lat: number) => void;
  onWaypointDragEnd: (waypointId: string, lng: number, lat: number) => void;

  /* Modal actions */
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDiscard: () => void;
  onCancelDiscard: () => void;
}

/* ---- Context ---- */

export const MissionContext = createContext<MissionContextValue | null>(null);

export function useMissionContext(): MissionContextValue {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMissionContext must be used within a MissionProvider');
  return ctx;
}

/* ---- Editor interaction hook (composes with useMissions) ---- */

function useEditorInteraction(missions: ReturnType<typeof useMissions>) {
  const {
    missions: missionList,
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
  } = missions;

  // Placement mode: user is about to click the map to drop a waypoint
  const [isPlacingWaypoint, setIsPlacingWaypoint] = useState(false);

  // Selected waypoint for bidirectional highlighting
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  // Mission pending deletion (for the confirmation modal)
  const [missionToDelete, setMissionToDelete] = useState<typeof missionList[0] | null>(null);

  // Mission pending navigation away from dirty editor
  const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(null);
  const [pendingDeselect, setPendingDeselect] = useState(false);

  // Focus system: waypoints to fly to, and a trigger counter
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [focusWaypoints, setFocusWaypoints] = useState<Waypoint[]>([]);

  // Active missions to show on the map when not editing
  const activeMissions = useMemo(
    () => missionList.filter(m => m.status === 'active'),
    [missionList]
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

  const handleSelectMission = useCallback((_id: string) => {
    // Clicking the card row itself is now a no-op for editing.
  }, []);

  const handleEditMission = useCallback((id: string) => {
    const success = selectMission(id);
    if (!success) {
      setPendingNavigationId(id);
    } else {
      const mission = missionList.find(m => m.id === id);
      if (mission) {
        setFocusWaypoints(mission.waypoints);
        setFocusTrigger(prev => prev + 1);
      }
    }
    setSelectedWaypointId(null);
    setIsPlacingWaypoint(false);
  }, [selectMission, missionList]);

  const handleFocusMission = useCallback((id: string) => {
    const mission = missionList.find(m => m.id === id);
    if (mission && mission.waypoints.length > 0) {
      setFocusWaypoints(mission.waypoints);
      setFocusTrigger(prev => prev + 1);
    }
  }, [missionList]);

  const handleBack = useCallback(() => {
    const success = deselectMission();
    if (!success) {
      setPendingDeselect(true);
    }
    setSelectedWaypointId(null);
    setIsPlacingWaypoint(false);
  }, [deselectMission]);

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

  const handleAddWaypoint = useCallback(() => {
    setIsPlacingWaypoint(true);
  }, []);

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
  }, [isPlacingWaypoint, addWaypoint, workingCopy?.waypoints.length]);

  const handleWaypointDragEnd = useCallback((waypointId: string, lng: number, lat: number) => {
    updateWaypoint(waypointId, { lng, lat });
  }, [updateWaypoint]);

  const handleSelectWaypoint = useCallback((id: string) => {
    setSelectedWaypointId(prevId => prevId === id ? null : id);
  }, []);

  const handleRenameWaypoint = useCallback((id: string, name: string) => {
    updateWaypoint(id, { name });
  }, [updateWaypoint]);

  const handleUpdateWaypointCoords = useCallback((id: string, lat: number, lng: number) => {
    updateWaypoint(id, { lat, lng });
  }, [updateWaypoint]);

  const handleRequestDelete = useCallback((id: string) => {
    const mission = missionList.find(m => m.id === id);
    if (mission) {
      setMissionToDelete(mission);
    }
  }, [missionList]);

  const handleConfirmDelete = useCallback(() => {
    if (missionToDelete) {
      deleteMission(missionToDelete.id);
      setMissionToDelete(null);
    }
  }, [missionToDelete, deleteMission]);

  const handleCancelDelete = useCallback(() => {
    setMissionToDelete(null);
  }, []);

  return {
    // Mission data
    missions: missionList,
    selectedMissionId,
    workingCopy,
    isDirty,
    activeMissions,

    // UI state
    isPlacingWaypoint,
    selectedWaypointId,
    focusTrigger,
    focusWaypoints,

    // Modal state
    missionToDelete,
    showDiscardDialog: !!(pendingNavigationId || pendingDeselect),

    // List actions
    onSelectMission: handleSelectMission,
    onEditMission: handleEditMission,
    onFocusMission: handleFocusMission,
    onDeleteMission: handleRequestDelete,
    onSetMissionStatus: setMissionStatus,
    onCreateMission: createMission,

    // Editor actions
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

    // Map actions
    onMapClick: handleMapClick,
    onWaypointDrag: handleWaypointDragEnd,
    onWaypointDragEnd: handleWaypointDragEnd,

    // Modal actions
    onConfirmDelete: handleConfirmDelete,
    onCancelDelete: handleCancelDelete,
    onConfirmDiscard: handleConfirmDiscard,
    onCancelDiscard: handleCancelDiscard,
  } satisfies MissionContextValue;
}

/* ---- Provider component ---- */

export function MissionProvider({ children }: { children: ReactNode }) {
  const missionsHook = useMissions();
  const value = useEditorInteraction(missionsHook);

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
}
