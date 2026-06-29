import { MissionProvider, useMissionContext } from './context/MissionContext';
import Rail from './components/Rail';
import MapCanvas from './components/MapCanvas';
import MobileSheet from './components/MobileSheet';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import DiscardConfirmModal from './components/DiscardConfirmModal';

function AppLayout() {
  const {
    missionToDelete,
    showDiscardDialog,
    onConfirmDelete,
    onCancelDelete,
    onConfirmDiscard,
    onCancelDiscard,
  } = useMissionContext();

  return (
    <div className="flex h-full w-full">
      <Rail />
      <MapCanvas />
      <MobileSheet />

      {missionToDelete && (
        <DeleteConfirmModal
          mission={missionToDelete}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      )}

      {showDiscardDialog && (
        <DiscardConfirmModal
          onConfirm={onConfirmDiscard}
          onCancel={onCancelDiscard}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <MissionProvider>
      <AppLayout />
    </MissionProvider>
  );
}
