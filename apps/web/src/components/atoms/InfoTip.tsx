import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

interface TipPosition {
  top: number;
  left: number;
  placement: 'above' | 'below';
}

const TIP_WIDTH_PX = 224;
const TIP_GAP_PX = 8;
const VIEWPORT_PADDING_PX = 8;

function computePosition(trigger: HTMLElement): TipPosition {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const preferBelow = spaceBelow >= 120 || spaceBelow >= spaceAbove;
  const placement = preferBelow ? 'below' : 'above';

  const top = placement === 'below' ? rect.bottom + TIP_GAP_PX : rect.top - TIP_GAP_PX;

  const maxLeft = window.innerWidth - TIP_WIDTH_PX - VIEWPORT_PADDING_PX;
  const left = Math.max(VIEWPORT_PADDING_PX, Math.min(rect.left, maxLeft));

  return { top, left, placement };
}

export default function InfoTip({ label, children, className }: InfoTipProps) {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [position, setPosition] = useState<TipPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const open = hoverOpen || pinnedOpen;

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setPosition(computePosition(trigger));
  }, []);

  const showHover = useCallback(() => setHoverOpen(true), []);
  const hideHover = useCallback(() => {
    if (!pinnedOpen) {
      setHoverOpen(false);
    }
  }, [pinnedOpen]);

  const togglePinned = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setPinnedOpen((prev) => !prev);
    setHoverOpen(false);
  }, []);

  const handleFocus = useCallback(() => setHoverOpen(true), []);
  const handleBlur = useCallback(() => {
    setHoverOpen(false);
    setPinnedOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHoverOpen(false);
        setPinnedOpen(false);
        triggerRef.current?.focus();
      }
    };

    const onReposition = () => updatePosition();

    document.addEventListener('keydown', onEscape);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      document.removeEventListener('keydown', onEscape);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updatePosition]);

  return (
    <span className={cn('inline-flex shrink-0', className)}>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={showHover}
        onMouseLeave={hideHover}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={togglePinned}
        className="text-gray-400 transition-colors hover:text-gray-600 touch-manipulation dark:hover:text-gray-300"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && position
        ? typeof document === 'undefined'
          ? null
          : createPortal(
              <div
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none fixed z-[80] w-56 max-w-[min(16rem,90vw)] rounded-lg bg-gray-900 p-2 text-xs text-white shadow-lg dark:bg-gray-700"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: position.placement === 'above' ? 'translateY(-100%)' : undefined,
                }}
              >
                {children}
              </div>,
              document.body
            )
        : null}
    </span>
  );
}
