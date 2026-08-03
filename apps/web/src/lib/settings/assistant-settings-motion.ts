import type { Variants } from 'framer-motion';

/** Stagger delay between Assistant Settings section cards (seconds). */
export const ASSISTANT_SETTINGS_CARD_STAGGER_SECONDS = 0.05;

export const assistantSettingsCardStackContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: ASSISTANT_SETTINGS_CARD_STAGGER_SECONDS,
      delayChildren: 0,
    },
  },
};

export const assistantSettingsCardStackItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
  },
};
