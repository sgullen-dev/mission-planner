interface EmptyStateProps {
  onCreateMission: () => void;
}

/**
 * Shown when there are no mission profiles yet.
 * Features the rotated diamond icon with glowing dot from the design.
 */
export default function EmptyState({ onCreateMission }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center"
      style={{ padding: '24px 26px', gap: 14 }}
    >
      {/* Rotated diamond icon with dashed border and glowing dot */}
      <div
        style={{
          width: 56,
          height: 56,
          transform: 'rotate(45deg)',
          border: '1.5px dashed rgba(47,216,207,0.4)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#2FD8CF',
            boxShadow: '0 0 12px rgba(47,216,207,0.6)',
          }}
        />
      </div>

      <h3
        className="font-sans"
        style={{ fontSize: 14, fontWeight: 600, color: '#D7E2EF' }}
      >
        No mission profiles yet
      </h3>

      <p
        className="font-sans"
        style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.55, color: '#6A7E97' }}
      >
        Task your first mission to begin plotting waypoints and planning routes.
      </p>

      <button
        onClick={onCreateMission}
        className="font-sans cursor-pointer flex items-center gap-1.5"
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: '#06141A',
          background: '#2FD8CF',
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          boxShadow: '0 0 20px rgba(47,216,207,0.28)',
        }}
      >
        <span className="font-mono" style={{ fontSize: 15, fontWeight: 600 }}>+</span>
        Task a Mission
      </button>
    </div>
  );
}
