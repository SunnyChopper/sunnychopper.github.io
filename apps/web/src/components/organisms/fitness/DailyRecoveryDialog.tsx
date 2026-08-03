import { useEffect, useState } from 'react';

import Dialog from '@/components/molecules/Dialog';
import { DailyRecoveryCheckIn } from '@/components/organisms/fitness/DailyRecoveryCheckIn';

type DailyRecoveryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  quickMode?: boolean;
};

export function DailyRecoveryDialog({
  isOpen,
  onClose,
  quickMode = false,
}: DailyRecoveryDialogProps) {
  const [expandedFromQuick, setExpandedFromQuick] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setExpandedFromQuick(false);
    }
  }, [isOpen]);

  const effectiveQuickMode = quickMode && !expandedFromQuick;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={effectiveQuickMode ? 'Quick recovery check-in' : 'Recovery check-in'}
      size="lg"
      trapFocus
    >
      <DailyRecoveryCheckIn
        embedded
        quickMode={effectiveQuickMode}
        onExpandFullForm={() => setExpandedFromQuick(true)}
        onSaveSuccess={onClose}
      />
    </Dialog>
  );
}
