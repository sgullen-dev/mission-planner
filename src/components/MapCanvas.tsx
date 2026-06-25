import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
import type { Feature, LineString } from 'geojson';
import type { Mission, Waypoint } from '../lib/types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

/** Build a route line layer style with the given color */
function makeRouteStyle(id: string, color: string, opacity = 0.9, width = 2.2): React.ComponentProps<typeof Layer> {
  return {
    id,
    type: 'line',
    paint: {
      'line-color': color,
      'line-width': width,
      'line-opacity': opacity,
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
  };
}

interface MapCanvasProps {
  /** The mission currently being edited (working copy), if any */
  editingMission: Mission | null;
  /** Active missions to display on the map when not editing */
  activeMissions: Mission[];
  isPlacingWaypoint: boolean;
  selectedWaypointId: string | null;
  /** Waypoints to fly to when focusTrigger increments */
  focusWaypoints: Waypoint[];
  /** Incrementing counter that triggers a fly-to on focusWaypoints */
  focusTrigger: number;
  onMapClick: (lng: number, lat: number) => void;
  onWaypointDrag: (waypointId: string, lng: number, lat: number) => void;
  onWaypointDragEnd: (waypointId: string, lng: number, lat: number) => void;
  onSelectWaypoint: (id: string) => void;
}

export default function MapCanvas({
  editingMission,
  activeMissions,
  isPlacingWaypoint,
  selectedWaypointId,
  focusWaypoints,
  focusTrigger,
  onMapClick,
  onWaypointDrag,
  onWaypointDragEnd,
  onSelectWaypoint,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  // Tracks whether any marker is currently being dragged.
  // While true, the "fly to selected waypoint" effect is suppressed
  // so the map doesn't chase the marker during a drag.
  const isDraggingRef = useRef(false);

  const isEditing = editingMission !== null;
  const editingWaypoints = editingMission?.waypoints ?? [];
  const editingColor = editingMission?.color ?? '#2FD8CF';

  /**
   * Build a GeoJSON LineString from an ordered list of waypoints.
   */
  function buildRouteGeoJSON(waypoints: Waypoint[]): Feature<LineString> | null {
    if (waypoints.length < 2) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map(wp => [wp.lng, wp.lat]),
      },
    };
  }

  const editingRouteGeoJSON = buildRouteGeoJSON(editingWaypoints);

  /**
   * Handle map clicks — only used during placement mode to add waypoints.
   */
  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (!isPlacingWaypoint) return;
      onMapClick(event.lngLat.lng, event.lngLat.lat);
    },
    [isPlacingWaypoint, onMapClick]
  );

  /**
   * When a waypoint is selected in the editor, ease the map toward it.
   */
  useEffect(() => {
    if (!selectedWaypointId || !mapRef.current) return;
    if (isDraggingRef.current) return; // don't chase the marker during a drag

    const selectedWaypoint = editingWaypoints.find(wp => wp.id === selectedWaypointId);
    if (!selectedWaypoint) return;

    mapRef.current.easeTo({
      center: [selectedWaypoint.lng, selectedWaypoint.lat],
      duration: 800,
    });
  }, [selectedWaypointId, editingWaypoints]);

  /**
   * When focusTrigger changes, fly the map to fit the focusWaypoints.
   * This fires when "Edit" opens a mission, or when "Focus" is clicked.
   */
  useEffect(() => {
    if (focusTrigger === 0 || !mapRef.current) return;

    const waypoints = focusWaypoints;
    if (!waypoints || waypoints.length === 0) return;

    // If only one waypoint, fly to it. Otherwise fit the bounds of all waypoints.
    if (waypoints.length === 1) {
      mapRef.current.flyTo({
        center: [waypoints[0].lng, waypoints[0].lat],
        zoom: 12,
        duration: 1200,
      });
    } else {
      // Compute bounding box of all waypoints
      let minLng = waypoints[0].lng;
      let maxLng = waypoints[0].lng;
      let minLat = waypoints[0].lat;
      let maxLat = waypoints[0].lat;
      for (const wp of waypoints) {
        if (wp.lng < minLng) minLng = wp.lng;
        if (wp.lng > maxLng) maxLng = wp.lng;
        if (wp.lat < minLat) minLat = wp.lat;
        if (wp.lat > maxLat) maxLat = wp.lat;
      }
      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 80, duration: 1200 }
      );
    }
  }, [focusTrigger, focusWaypoints]);

  return (
    <div className={`flex-1 h-full relative ${isPlacingWaypoint ? 'placement-cursor' : ''}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -118.5,
          latitude: 33.8,
          zoom: 9,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        onClick={handleMapClick}
      >
        {/*
          When NOT editing: show all active missions as background routes.
          These are non-interactive (no dragging, no selection).
        */}
        {!isEditing && activeMissions.map(mission => {
          const routeGeo = buildRouteGeoJSON(mission.waypoints);
          return (
            <BackgroundMission
              key={mission.id}
              mission={mission}
              routeGeoJSON={routeGeo}
            />
          );
        })}

        {/*
          When editing: show only the working copy's route and markers.
          These are interactive (draggable, selectable).
        */}
        {isEditing && editingRouteGeoJSON && (
          <Source id="route-editing" type="geojson" data={editingRouteGeoJSON}>
            <Layer {...makeRouteStyle('route-editing-line', editingColor)} />
          </Source>
        )}

        {isEditing && editingWaypoints.map((waypoint, index) => (
          <EditableWaypointMarker
            key={waypoint.id}
            waypoint={waypoint}
            sequenceNumber={index + 1}
            color={editingColor}
            isSelected={waypoint.id === selectedWaypointId}
            onSelect={onSelectWaypoint}
            onDrag={onWaypointDrag}
            onDragEnd={onWaypointDragEnd}
            isDraggingRef={isDraggingRef}
          />
        ))}
      </Map>

      {/* Placement mode banner */}
      {isPlacingWaypoint && (
        <div
          className="absolute font-mono pointer-events-none flex items-center"
          style={{
            top: 16,
            left: 16,
            gap: 8,
            padding: '7px 11px',
            background: 'rgba(11,19,34,0.78)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 7,
            fontSize: 11,
            fontWeight: 500,
            color: '#52647C',
            letterSpacing: 0.4,
          }}
        >
          DROP WAYPOINT {editingWaypoints.length + 1} — click to plot, ESC to cancel
        </div>
      )}

      {/* "No active route" hint when nothing to show */}
      {!isEditing && activeMissions.length === 0 && (
        <div
          className="absolute font-mono pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, color: '#3E4F66', textTransform: 'uppercase' as const }}>
            No active route
          </div>
          <div className="font-sans" style={{ fontSize: 12.5, color: '#52647C', marginTop: 6 }}>
            Select a mission to view its route
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Background (non-editable) mission on the map ---- */

interface BackgroundMissionProps {
  mission: Mission;
  routeGeoJSON: Feature<LineString> | null;
}

/**
 * Renders a non-interactive mission on the map (route line + static markers).
 * Shown for active missions when no mission is being edited.
 * Uses a slightly dimmer style to distinguish from the editing state.
 */
function BackgroundMission({ mission, routeGeoJSON }: BackgroundMissionProps) {
  const color = mission.color ?? '#2FD8CF';

  return (
    <>
      {routeGeoJSON && (
        <Source id={`bg-route-${mission.id}`} type="geojson" data={routeGeoJSON}>
          <Layer {...makeRouteStyle(`bg-route-${mission.id}-line`, color, 0.9, 2.2)} />
        </Source>
      )}
      {mission.waypoints.map((waypoint, index) => (
        <Marker
          key={waypoint.id}
          longitude={waypoint.lng}
          latitude={waypoint.lat}
          anchor="center"
        >
          <div
            className="font-mono flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#0B1322',
              border: `2px solid ${color}`,
              fontSize: 11,
              fontWeight: 600,
              color: color,
              boxShadow: `0 0 0 4px ${color}1A`,
            }}
          >
            {index + 1}
          </div>
        </Marker>
      ))}
    </>
  );
}

/* ---- Editable waypoint marker (used when editing a mission) ---- */

interface EditableWaypointMarkerProps {
  waypoint: Waypoint;
  sequenceNumber: number;
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDrag: (waypointId: string, lng: number, lat: number) => void;
  onDragEnd: (waypointId: string, lng: number, lat: number) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
}

function EditableWaypointMarker({
  waypoint,
  sequenceNumber,
  color,
  isSelected,
  onSelect,
  onDrag,
  onDragEnd,
  isDraggingRef,
}: EditableWaypointMarkerProps) {
  const size = isSelected ? 32 : 24;

  // Track whether a drag just happened so we can suppress the click that follows
  const [justDragged, setJustDragged] = useState(false);

  return (
    <Marker
      longitude={waypoint.lng}
      latitude={waypoint.lat}
      draggable
      onDragStart={() => {
        setJustDragged(true);
        isDraggingRef.current = true;
      }}
      onDrag={(event) => {
        onDrag(waypoint.id, event.lngLat.lng, event.lngLat.lat);
      }}
      onDragEnd={(event) => {
        isDraggingRef.current = false;
        onDragEnd(waypoint.id, event.lngLat.lng, event.lngLat.lat);
      }}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        if (justDragged) {
          setJustDragged(false);
          return;
        }
        onSelect(waypoint.id);
      }}
      anchor="center"
    >
      <div
        className="font-mono flex items-center justify-center cursor-pointer"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: isSelected ? color : '#0B1322',
          border: isSelected ? '2px solid #fff' : `2px solid ${color}`,
          fontSize: isSelected ? 13 : 11,
          fontWeight: 600,
          color: isSelected ? '#06141A' : color,
          boxShadow: isSelected
            ? `0 0 0 6px ${color}2E`
            : `0 0 0 4px ${color}1A`,
          transition: 'all 0.2s ease',
        }}
      >
        {sequenceNumber}
      </div>
    </Marker>
  );
}
