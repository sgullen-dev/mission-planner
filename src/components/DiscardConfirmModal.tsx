import { MODAL_BACKDROP_STYLE, MODAL_CONTAINER_STYLE } from '../lib/constants';

interface DiscardConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal dialog confirming discard of unsaved changes.
 * Matches design conventions of DeleteConfirmModal: 400px wide, 14px radius,
 * blur backdrop, amber icon container (amber = warning, red = destructive).
 */
export default function DiscardConfirmModal({
  onConfirm,
  onCancel,
}: DiscardConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
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
        {/* Amber warning icon + title on same line */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="shrink-0 flex items-center justify-center font-sans"
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

        {/* Body text */}
        <p
          className="font-sans"
          style={{ fontSize: 12.5, fontWeight: 400, lineHeight: 1.6, color: '#9DB0C6' }}
        >
          You have unsaved changes. Discard them and continue?
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
            Keep Editing
          </button>

          <button
            onClick={onConfirm}
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
  );
}
