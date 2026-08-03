import { describe, expect, it } from 'vitest';
import {
  chatAssistantChromeWidthClassName,
  chatBubbleMaxWidthClassName,
  getBubbleSurfaceClassName,
} from '@/lib/chat/imessage-surfaces';

describe('imessage-surfaces width tokens', () => {
  it('shares max width between bubble surface and assistant chrome', () => {
    expect(chatAssistantChromeWidthClassName).toContain(chatBubbleMaxWidthClassName);
    expect(getBubbleSurfaceClassName('assistant', 'solo')).toContain(chatBubbleMaxWidthClassName);
  });

  it('left-aligns assistant chrome with incoming bubbles', () => {
    expect(chatAssistantChromeWidthClassName).toContain('mr-auto');
    expect(chatAssistantChromeWidthClassName).toContain('w-full');
  });
});
