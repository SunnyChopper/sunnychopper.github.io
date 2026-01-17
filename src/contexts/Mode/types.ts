import { createContext } from 'react';

export const MODE_STORAGE_KEY = 'leisure_mode_preference';

export interface ModeContextType {
  isLeisureMode: boolean;
  toggleMode: () => void;
}

export const ModeContext = createContext<ModeContextType | undefined>(undefined);
