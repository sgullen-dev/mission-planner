import { useState, useEffect, useCallback, useRef } from 'react';
import type { Mission, Waypoint, MissionStatus, RouteColor } from '../lib/types';
import { loadMissions, saveMissions, generateMissionCode } from '../lib/storage';

export interface UseMissionsReturn {
  /* ---- Persisted mission list ---- */
  missions: Mission[];

  /* ---- Editor state ---- */
  selectedMissionId: string | null;
  workingCopy: Mission | null;
  isDirty: boolean;

  /* ---- List actions ---- */
  createMission: () => void;
  deleteMission: (id: string) => void;
  setMissionStatus: (id: string, status: MissionStatus) => void;

  /* ---- Selection ---- */
  selectMission: (id: string) => boolean; // returns false if blocked by dirty
  deselectMission: () => boolean;          // returns false if blocked by dirty

  /* ---- Editor actions ---- */
  updateMissionName: (name: string) => void;
  updateMissionStatus: (status: MissionStatus) => void;
  updateMissionColor: (color: RouteColor) => void;
  addWaypoint: (waypoint: Waypoint) => void;
  updateWaypoint: (waypointId: string, updates: Partial<Waypoint>) => void;
  deleteWaypoint: (waypointId: string) => void;
  reorderWaypoints: (activeId: string, overId: string) => void;
  importMission: (data: Partial<Mission>) => void;
  saveWorkingCopy: () => void;
  discardWorkingCopy: () => void;
}

/**
 * Deeply compare two missions by their editable fields.
 * Returns true if the working copy differs from the saved version.
 */
function hasMissionChanged(working: Mission, saved: Mission): boolean {
  if (working.name !== saved.name) return true;
  if (working.status !== saved.status) return true;
  if (working.color !== saved.color) return true;
  if (working.waypoints.length !== saved.waypoints.length) return true;

  for (let i = 0; i < working.waypoints.length; i++) {
    const w = working.waypoints[i];
    const s = saved.waypoints[i];
    if (w.id !== s.id) return true;
    if (w.name !== s.name) return true;
    if (w.lng !== s.lng) return true;
    if (w.lat !== s.lat) return true;
  }

  return false;
}

export function useMissions(): UseMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>(() => loadMissions());
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [workingCopy, setWorkingCopy] = useState<Mission | null>(null);

  // Compute dirty state by comparing working copy to saved version
  const isDirty = (() => {
    if (!workingCopy || !selectedMissionId) return false;
    const saved = missions.find(m => m.id === selectedMissionId);
    if (!saved) return false;
    return hasMissionChanged(workingCopy, saved);
  })();

  // Keep a ref to isDirty for the beforeunload handler
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Persist missions to localStorage whenever they change
  useEffect(() => {
    saveMissions(missions);
  }, [missions]);

  // Warn user before closing tab if there are unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /* ---- List actions ---- */

  const createMission = useCallback(() => {
    // Find the next available name: "NEW MISSION", "NEW MISSION 1", "NEW MISSION 2", etc.
    const existingNames = new Set(missions.map(m => m.name));
    let name = 'NEW MISSION';
    if (existingNames.has(name)) {
      let counter = 1;
      while (existingNames.has(`NEW MISSION ${counter}`)) {
        counter++;
      }
      name = `NEW MISSION ${counter}`;
    }

    const newMission: Mission = {
      id: crypto.randomUUID(),
      code: generateMissionCode(),
      name,
      status: 'draft',
      color: '#2FD8CF',
      waypoints: [],
      updatedAt: Date.now(),
    };

    setMissions(prev => [newMission, ...prev]);
    setSelectedMissionId(newMission.id);
    setWorkingCopy({ ...newMission });
  }, [missions]);

  const deleteMission = useCallback((id: string) => {
    setMissions(prev => prev.filter(m => m.id !== id));

    // If deleting the currently selected mission, clear the editor
    if (selectedMissionId === id) {
      setSelectedMissionId(null);
      setWorkingCopy(null);
    }
  }, [selectedMissionId]);

  /**
   * Update a mission's status directly in the saved store (not the working copy).
   * Used from the mission list where there's no editor open.
   */
  const setMissionStatus = useCallback((id: string, status: MissionStatus) => {
    setMissions(prev =>
      prev.map(m => m.id === id ? { ...m, status, updatedAt: Date.now() } : m)
    );
  }, []);

  /* ---- Selection (with dirty guard) ---- */

  /**
   * Select a mission for editing.
   * Returns false if there are unsaved changes and the user should be prompted.
   */
  const selectMission = useCallback((id: string): boolean => {
    if (isDirtyRef.current) {
      return false; // caller should show confirm dialog
    }

    const mission = missions.find(m => m.id === id);
    if (!mission) return true;

    setSelectedMissionId(id);
    // Create a deep clone for the working copy
    setWorkingCopy(JSON.parse(JSON.stringify(mission)));
    return true;
  }, [missions]);

  const deselectMission = useCallback((): boolean => {
    if (isDirtyRef.current) {
      return false; // caller should show confirm dialog
    }

    setSelectedMissionId(null);
    setWorkingCopy(null);
    return true;
  }, []);

  /* ---- Editor actions (all modify the working copy only) ---- */

  const updateMissionName = useCallback((name: string) => {
    setWorkingCopy(prev => prev ? { ...prev, name } : null);
  }, []);

  const updateMissionStatus = useCallback((status: MissionStatus) => {
    setWorkingCopy(prev => prev ? { ...prev, status } : null);
  }, []);

  const updateMissionColor = useCallback((color: RouteColor) => {
    setWorkingCopy(prev => prev ? { ...prev, color } : null);
  }, []);

  const addWaypoint = useCallback((waypoint: Waypoint) => {
    setWorkingCopy(prev => {
      if (!prev) return null;
      return { ...prev, waypoints: [...prev.waypoints, waypoint] };
    });
  }, []);

  const updateWaypoint = useCallback((waypointId: string, updates: Partial<Waypoint>) => {
    setWorkingCopy(prev => {
      if (!prev) return null;
      const updatedWaypoints = prev.waypoints.map(wp =>
        wp.id === waypointId ? { ...wp, ...updates } : wp
      );
      return { ...prev, waypoints: updatedWaypoints };
    });
  }, []);

  const deleteWaypoint = useCallback((waypointId: string) => {
    setWorkingCopy(prev => {
      if (!prev) return null;
      return { ...prev, waypoints: prev.waypoints.filter(wp => wp.id !== waypointId) };
    });
  }, []);

  /**
   * Reorder waypoints by moving the item with activeId to the position of overId.
   * Used by the drag-and-drop sortable list.
   */
  const reorderWaypoints = useCallback((activeId: string, overId: string) => {
    setWorkingCopy(prev => {
      if (!prev) return null;

      const oldIndex = prev.waypoints.findIndex(wp => wp.id === activeId);
      const newIndex = prev.waypoints.findIndex(wp => wp.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

      // Remove item from old position and insert at new position
      const reordered = [...prev.waypoints];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      return { ...prev, waypoints: reordered };
    });
  }, []);

  /**
   * Import mission data from a JSON object into the current working copy.
   * Preserves the mission's id and code, but replaces name, status, color, and waypoints.
   * Each imported waypoint gets a fresh UUID to avoid collisions.
   */
  const importMission = useCallback((data: Partial<Mission>) => {
    setWorkingCopy(prev => {
      if (!prev) return null;

      const importedWaypoints = Array.isArray(data.waypoints)
        ? data.waypoints.map(wp => ({
            id: crypto.randomUUID(),
            name: typeof wp.name === 'string' ? wp.name : `WP-${Math.floor(Math.random() * 100)}`,
            lat: typeof wp.lat === 'number' ? wp.lat : 0,
            lng: typeof wp.lng === 'number' ? wp.lng : 0,
          }))
        : prev.waypoints;

      return {
        ...prev,
        name: typeof data.name === 'string' ? data.name : prev.name,
        status: data.status === 'draft' || data.status === 'active' || data.status === 'complete'
          ? data.status : prev.status,
        color: typeof data.color === 'string' ? data.color as RouteColor : prev.color,
        waypoints: importedWaypoints,
      };
    });
  }, []);

  /**
   * Save the working copy back to the missions store.
   * Bumps updatedAt and clears dirty state.
   */
  const saveWorkingCopy = useCallback(() => {
    if (!workingCopy || !selectedMissionId) return;

    const savedVersion: Mission = {
      ...workingCopy,
      updatedAt: Date.now(),
    };

    setMissions(prev =>
      prev.map(m => m.id === selectedMissionId ? savedVersion : m)
    );

    // Update the working copy so it matches the saved version (clears dirty)
    setWorkingCopy(savedVersion);
  }, [workingCopy, selectedMissionId]);

  /**
   * Discard changes: reset working copy to the saved version.
   */
  const discardWorkingCopy = useCallback(() => {
    if (!selectedMissionId) return;
    const saved = missions.find(m => m.id === selectedMissionId);
    if (saved) {
      setWorkingCopy(JSON.parse(JSON.stringify(saved)));
    }
  }, [missions, selectedMissionId]);

  return {
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
  };
}
