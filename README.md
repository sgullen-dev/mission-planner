# Mission Planner — Maritime C2

A mission planning application for autonomous surface vessels. Users create mission profiles, plot ordered waypoints on a Mapbox map, review the route connecting them, and save. Missions persist client-side via localStorage.

## Setup

```bash
git clone <repo-url>
cd mission-planner
npm install
```

Create a `.env` file from the example and add your Mapbox access token:

```bash
cp .env.example .env
# Edit .env and set VITE_MAPBOX_TOKEN=your_token_here
```

Start the dev server:

```bash
npm run dev
```

## How to Use

1. **Task a Mission** — Click "+ Task a Mission" to create a new mission profile
2. **Plot Waypoints** — Click "+ Add Waypoint" to enter placement mode, then click the map to drop a waypoint. Press ESC to cancel placement
3. **Edit Waypoints** — Drag markers on the map to reposition. Click a waypoint row or marker for bidirectional selection. Rename waypoints inline
4. **Save** — Click "Save Profile" to persist changes to localStorage. "Discard" reverts to the last saved state
5. **Filter & Manage** — Use the filter tabs (All / Active / Draft / Done) to find missions. Set status via the status chips in the editor

## Design Approach

The UI follows a **Google Maps drill-in pattern**: a persistent left rail shows the mission list, and selecting a mission drills into an inline editor — no page transitions, no router. The **dark naval C2 palette** (`#0A0F1A` background, `#2FD8CF` accent) creates a console aesthetic appropriate for maritime command-and-control software. **Red is reserved strictly for destructive actions and alert status** — it is never used decoratively, following C2 convention where color carries operational meaning. All UI copy uses **maritime/C2 vocabulary**: "Task a Mission" (not "New Mission"), "Mission Profiles," "Waypoints," "Discard," "Save Profile." Coordinates display as degrees-decimal-minutes with hemisphere suffix (e.g., `34°02.4′N 119°27.5′W`), matching nautical convention.

## Assumptions

- Client-side only — no backend, no authentication
- Single user — no collaboration or conflict resolution
- Waypoints are placed by map click, not geocoded or manually entered
- Missions are stored in localStorage; clearing browser data deletes all missions
- Mapbox token is user-provided via `.env`

## What I'd Improve With More Time

- **Import/export mission JSON** — cheap once the data model exists; enables sharing between users
- **Light theme toggle** — the color tokens are already CSS custom properties, so swapping is straightforward
- **Great-circle distance** — haversine per leg + mission total in nautical miles reinforces the maritime domain
- **Waypoint reordering** — drag-and-drop via dnd-kit or simple up/down buttons
- **Map chrome** — scale bar, zoom-level overlay token
- **"Saving…" animation** — async save feedback with undo history
- **Keyboard accessibility pass** — full ARIA roles, focus management, screen reader testing
- **Per-waypoint coordinate text entry** — manual lat/lng input as an alternative to map click
