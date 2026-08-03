import { describe, expect, it } from 'vitest';

import {
  inboxItemAccentBarClassName,
  inboxItemRowShellClassName,
} from '@/lib/knowledge-vault/inbox-item-surfaces';

describe('inboxItemRowShellClassName', () => {
  it('uses neutral gray border at rest and when selected', () => {
    expect(inboxItemRowShellClassName()).toContain('border-gray-200');
    expect(inboxItemRowShellClassName({ selected: true })).toContain('border-gray-200');
    expect(inboxItemRowShellClassName({ selected: true })).not.toContain('border-green-500');
  });

  it('applies green tint and soft shadow when selected', () => {
    const selected = inboxItemRowShellClassName({ selected: true });
    expect(selected).toContain('bg-green-50');
    expect(selected).toContain('dark:bg-green-900/20');
    expect(selected).toContain('shadow-[0_4px_14px_rgba(0,0,0,0.08)]');
  });

  it('applies neutral hover background and shadow when unselected', () => {
    const idle = inboxItemRowShellClassName({ selected: false });
    expect(idle).toContain('hover:bg-gray-50');
    expect(idle).toContain('hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]');
    expect(idle).not.toContain('hover:border-green');
  });

  it('uses 100ms ease-out transition on background and shadow', () => {
    const classes = inboxItemRowShellClassName();
    expect(classes).toContain('duration-100');
    expect(classes).toContain('ease-out');
    expect(classes).toContain('transition-[background-color,box-shadow,border-color]');
  });

  it('does not apply hover translate', () => {
    const classes = inboxItemRowShellClassName({ selected: false });
    expect(classes).not.toContain('translate');
    expect(classes).not.toContain('hover:-translate');
  });

  it('exposes keyboard focus-visible ring', () => {
    const classes = inboxItemRowShellClassName();
    expect(classes).toContain('focus-visible:ring-2');
    expect(classes).toContain('focus-visible:ring-green-500/40');
  });
});

describe('inboxItemAccentBarClassName', () => {
  it('hides accent when not selected', () => {
    const classes = inboxItemAccentBarClassName({ selected: false });
    expect(classes).toContain('opacity-0');
  });

  it('shows green accent when selected', () => {
    const classes = inboxItemAccentBarClassName({ selected: true });
    expect(classes).toContain('opacity-100');
    expect(classes).toContain('bg-green-500');
  });

  it('uses absolute positioning to avoid layout shift', () => {
    const classes = inboxItemAccentBarClassName();
    expect(classes).toContain('absolute');
    expect(classes).not.toContain('border-l-');
  });
});
