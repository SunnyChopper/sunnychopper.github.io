import { describe, expect, it, vi } from 'vitest';
import {
  confirmOverwriteTitle,
  isValidHttpUrl,
  resolvePreviewStatus,
  shouldOfferTitleApply,
} from './url-metadata';

describe('url-metadata helpers', () => {
  it('validates http(s) URLs', () => {
    expect(isValidHttpUrl('https://example.com/doc.pdf')).toBe(true);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
  });

  it('offers title apply only when title exists', () => {
    expect(shouldOfferTitleApply('Example')).toBe(true);
    expect(shouldOfferTitleApply('  ')).toBe(false);
    expect(shouldOfferTitleApply(null)).toBe(false);
  });

  it('confirms overwrite when title is non-empty', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    expect(confirmOverwriteTitle('Existing', 'Suggested')).toBe(true);
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('skips confirm when title is empty', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    expect(confirmOverwriteTitle('', 'Suggested')).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('resolves preview status', () => {
    expect(
      resolvePreviewStatus({
        url: 'https://example.com',
        loading: true,
        fetchFailed: false,
        hasTitle: false,
      })
    ).toBe('loading');
    expect(
      resolvePreviewStatus({
        url: 'https://example.com',
        loading: false,
        fetchFailed: true,
        hasTitle: false,
      })
    ).toBe('error');
  });
});
