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
3. **Edit Waypoints** — Drag markers on the map to reposition. Click a waypoint row or marker for bidirectional selection. Rename waypoints and edit coordinates via decimal-degree inputs with live DDM preview
4. **Reorder Waypoints** — Drag waypoints in the list using the grip handle to reorder the route sequence
5. **Import / Export** — Export a mission as a JSON file for sharing, or import a JSON file to load waypoints into the current mission
6. **Save** — Click "Save Profile" to persist changes to localStorage. "Discard" reverts to the last saved state. A browser prompt guards against closing the tab with unsaved changes
7. **Filter & Manage** — Use the filter tabs (All / Active / Draft / Done) to find missions. Set status via the status chips in the editor or mission list
8. **Route Colors** — Assign one of eight route colors per mission to distinguish overlapping routes on the map
9. **Delete** — Remove a mission through the delete button, with a confirmation modal to prevent accidental loss

## Design Approach

### Layout & Navigation
- Follows a **Google Maps drill-in pattern**: a persistent left rail shows the mission list, and selecting a mission drills into an inline editor — no page transitions, no router
- State-driven UI keeps all interaction within a single view for fast context switching

### Visual Language
- **Dark naval C2 palette** (`#0A0F1A` background, `#2FD8CF` accent) creates a console aesthetic appropriate for maritime command-and-control software
- **Red is reserved strictly for destructive actions and alert status** — it is never used decoratively, following C2 convention where color carries operational meaning
- **Two-font design system** using IBM Plex Sans and IBM Plex Mono for clear hierarchy between labels and data

### Waypoint Editing
- Waypoints support **inline name editing**, **drag-and-drop reordering** (via dnd-kit), and **direct coordinate entry** with decimal-degree inputs and live DDM preview
- Bidirectional selection syncs clicks between the waypoint list and map markers
- Coordinate validation enforces lat [-90, 90] and lng [-180, 180], rounding to four decimal places

### Data Management
- **Dirty state tracking** with deep equality comparison prevents accidental data loss
- Unsaved changes show a pulsing amber indicator; saved state flashes a green timestamp ("Saved · HH:MM UTC")
- Confirmation modals guard destructive actions (delete, discard unsaved changes)
- **Import/Export** enables sharing missions as JSON files with fresh UUIDs assigned on import to avoid collisions

### Mobile Experience
- On screens below 768px, the desktop rail is replaced with a **custom bottom sheet** designed for ease of use on small screens
- The sheet has **three discrete height states** — collapsed (7vh), half (54vh), and full (92vh) — toggled by tapping the drag handle
- In **collapsed mode**, a persistent summary bar shows the active mission count, current mission name, or placement instructions so the user always has context without obscuring the map
- **Placement mode automatically collapses the sheet** to maximize map visibility for precise waypoint tapping, then re-expands once the waypoint is placed
- Editing a mission expands the sheet to full height; pressing back collapses it to the half-height list view
- This map-first approach ensures the most important interaction surface — the map — is never blocked by UI chrome on small devices

## Tech Stack

- **React 19** with TypeScript and Vite
- **Tailwind CSS 4** for utility styling alongside inline styles for precision control
- **Mapbox GL / react-map-gl** for vector mapping and GeoJSON route rendering
- **@dnd-kit** for accessible drag-and-drop waypoint reordering

## What I'd Improve With More Time

- **Light theme toggle** — the color tokens are already CSS custom properties, so swapping is straightforward
- **Keyboard accessibility pass** — full ARIA roles, focus management, screen reader testing
