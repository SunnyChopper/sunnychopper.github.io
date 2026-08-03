/**
 * Returns caret coordinates relative to the textarea's padding box (scroll-adjusted).
 */
export function getTextareaCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const style = getComputedStyle(textarea);
  const mirror = document.createElement('div');
  const properties = [
    'boxSizing',
    'width',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'textTransform',
    'wordSpacing',
    'textIndent',
    'lineHeight',
    'tabSize',
  ] as const;

  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  mirror.style.overflow = 'hidden';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';

  for (const prop of properties) {
    mirror.style[prop] = style[prop];
  }

  const contentWidth =
    textarea.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight) -
    parseFloat(style.borderLeftWidth) -
    parseFloat(style.borderRightWidth);
  mirror.style.width = `${contentWidth}px`;

  const textBefore = textarea.value.substring(0, position);
  const textAfter = textarea.value.substring(position) || '\u200b';

  mirror.textContent = textBefore;
  const marker = document.createElement('span');
  marker.textContent = textAfter[0] ?? '\u200b';
  mirror.appendChild(marker);

  document.body.appendChild(mirror);
  const markerRect = marker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  document.body.removeChild(mirror);

  const top =
    markerRect.top - mirrorRect.top + textarea.scrollTop - parseFloat(style.borderTopWidth);
  const left =
    markerRect.left - mirrorRect.left + textarea.scrollLeft - parseFloat(style.borderLeftWidth);

  return { top, left };
}

/** Clamp chip position inside the editor pane. */
export function clampSmartPasteChipPosition(
  coords: { top: number; left: number },
  paneWidth: number,
  chipWidth = 200,
  chipHeight = 36
): { top: number; left: number } {
  const padding = 8;
  const top = Math.max(padding, coords.top - chipHeight - 6);
  const left = Math.min(
    Math.max(padding, coords.left),
    Math.max(padding, paneWidth - chipWidth - padding)
  );
  return { top, left };
}
