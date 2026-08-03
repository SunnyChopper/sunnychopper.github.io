import { useCallback, useEffect, useState } from 'react';

const LG_BREAKPOINT_PX = 1024;
const XL_BREAKPOINT_PX = 1280;
const STORAGE_KEY = 'assistant.relevantNow.collapsed';

function readInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return window.innerWidth < XL_BREAKPOINT_PX;
}

export function useRelevantNowRailLayout() {
  const [railCollapsed, setRailCollapsed] = useState(readInitialCollapsed);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < LG_BREAKPOINT_PX) {
        setRailCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRailCollapsed = useCallback(() => {
    setRailCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { railCollapsed, setRailCollapsed, toggleRailCollapsed };
}
