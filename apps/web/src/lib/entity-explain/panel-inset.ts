/** Width of the entity-explain docked panel (must match drawer `w-[22rem]`). */
export const ENTITY_EXPLAIN_PANEL_WIDTH = '22rem';

export const ENTITY_EXPLAIN_INSET_VAR = '--entity-explain-inset';

const LG_MEDIA_QUERY = '(min-width: 1024px)';

function syncEntityExplainInset(mq: MediaQueryList): void {
  if (mq.matches) {
    document.documentElement.style.setProperty(
      ENTITY_EXPLAIN_INSET_VAR,
      ENTITY_EXPLAIN_PANEL_WIDTH
    );
  } else {
    document.documentElement.style.setProperty(ENTITY_EXPLAIN_INSET_VAR, '0px');
  }
}

/** Apply desktop content inset while the explain drawer is open. Returns cleanup. */
export function applyEntityExplainDesktopInset(): () => void {
  const mq = window.matchMedia(LG_MEDIA_QUERY);
  const onChange = () => syncEntityExplainInset(mq);
  syncEntityExplainInset(mq);
  mq.addEventListener('change', onChange);
  return () => {
    mq.removeEventListener('change', onChange);
    document.documentElement.style.removeProperty(ENTITY_EXPLAIN_INSET_VAR);
  };
}
