import type { Mission } from '../lib/types';
import { MODAL_BACKDROP_STYLE, MODAL_CONTAINER_STYLE } from '../lib/constants';

interface DeleteConfirmModalProps {
  mission: Mission;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal dialog confirming mission deletion.
 * Matches design: 400px wide, 14px radius, blur backdrop, red icon container.
 * Red is used ONLY here — reserved for destructive actions per C2 convention.
 */
export default function DeleteConfirmModal({
  mission,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const waypointCount = mission.waypoints.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0"
        style={MODAL_BACKDROP_STYLE}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative flex flex-col"
        style={MODAL_CONTAINER_STYLE}
      >
        {/* Red warning icon + title on same line */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="flex-shrink-0 flex items-center justify-center font-sans"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(240,85,94,0.13)',
              border: '1px solid rgba(240,85,94,0.3)',
              fontSize: 18,
              fontWeight: 500,
              color: '#F0555E',
            }}
          >
            ⚠
          </div>
          <h3
            className="font-sans"
            style={{ fontSize: 15, fontWeight: 600, color: '#E7EEF7' }}
          >
            Delete mission profile?
          </h3>
        </div>

        {/* Mission code */}
        <p
          className="font-mono"
          style={{ fontSize: 10.5, fontWeight: 500, color: '#506178', letterSpacing: 0.4 }}
        >
          {mission.code} · {mission.name}
        </p>

        {/* Body text */}
        <p
          className="font-sans"
          style={{ fontSize: 12.5, fontWeight: 400, lineHeight: 1.6, color: '#9DB0C6' }}
        >
          "<span style={{ color: '#D7E2EF', fontWeight: 600 }}>{mission.name}</span>" and its {waypointCount} waypoint{waypointCount !== 1 ? 's' : ''}{' '}
          will be permanently removed. This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex" style={{ gap: 9, marginTop: 4 }}>
          <button
            onClick={onCancel}
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
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="font-sans cursor-pointer flex-1"
            style={{
              padding: 11,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#FFFFFF',
              background: '#E0434C',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 0 18px rgba(240,85,94,0.3)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
