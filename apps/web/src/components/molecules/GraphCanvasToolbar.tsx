import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

const DEFAULT_ANIMATION_MS = 300;
const FIT_PADDING = 0.18;

interface GraphCanvasToolbarProps {
  reduceMotion?: boolean;
  className?: string;
}

export function GraphCanvasToolbar({ reduceMotion = false, className }: GraphCanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const duration = reduceMotion ? 0 : DEFAULT_ANIMATION_MS;

  const handleZoomIn = useCallback(() => {
    void zoomIn({ duration });
  }, [zoomIn, duration]);

  const handleZoomOut = useCallback(() => {
    void zoomOut({ duration });
  }, [zoomOut, duration]);

  const handleFitToScreen = useCallback(() => {
    void fitView({ padding: FIT_PADDING, duration });
  }, [fitView, duration]);

  return (
    <div
      role="toolbar"
      aria-label="Graph canvas controls"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white/95 p-1 shadow-sm backdrop-blur-sm',
        'dark:border-gray-600 dark:bg-gray-800/95',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disableSound
        className="!min-h-[40px] !min-w-[40px] !rounded-md !px-2"
        onClick={handleZoomIn}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disableSound
        className="!min-h-[40px] !min-w-[40px] !rounded-md !px-2"
        onClick={handleZoomOut}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disableSound
        className="!min-h-[40px] !min-w-[40px] !rounded-md !px-2"
        onClick={handleFitToScreen}
        aria-label="Fit to screen"
        title="Fit to screen"
      >
        <Maximize className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
