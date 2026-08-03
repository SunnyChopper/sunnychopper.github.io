import { describe, expect, it } from 'vitest';

import {
  vaultItemCardAccentBarClassName,
  vaultItemCardShellClassName,
} from '@/lib/knowledge-vault/vault-item-card-surfaces';

describe('vaultItemCardShellClassName', () => {
  it('always uses border-2 for layout-stable chrome', () => {
    expect(vaultItemCardShellClassName()).toContain('border-2');
    expect(vaultItemCardShellClassName({ selected: true })).toContain('border-2');
    expect(vaultItemCardShellClassName({ highlighted: true })).toContain('border-2');
  });

  it('applies idle gray border and primary hover tint', () => {
    const idle = vaultItemCardShellClassName({ interactive: true });
    expect(idle).toContain('border-gray-200');
    expect(idle).toContain('hover:border-primary/40');
    expect(idle).toContain('hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]');
  });

  it('uses 150ms ease-out transition on border and shadow', () => {
    const classes = vaultItemCardShellClassName();
    expect(classes).toContain('duration-150');
    expect(classes).toContain('ease-out');
    expect(classes).toContain('transition-[border-color,box-shadow]');
  });

  it('does not apply hover translate', () => {
    const classes = vaultItemCardShellClassName({ interactive: true });
    expect(classes).not.toContain('translate');
    expect(classes).not.toContain('hover:-translate');
  });

  it('applies selected primary border and soft shadow', () => {
    const selected = vaultItemCardShellClassName({ selected: true });
    expect(selected).toContain('border-primary/40');
    expect(selected).toContain('shadow-[0_4px_14px_rgba(0,0,0,0.08)]');
  });

  it('applies violet highlight chrome that wins over idle border', () => {
    const highlighted = vaultItemCardShellClassName({ highlighted: true });
    expect(highlighted).toContain('border-violet-500');
    expect(highlighted).toContain('ring-violet-500/20');
    expect(highlighted).not.toContain('border-gray-200');
  });

  it('exposes keyboard focus-visible ring when interactive', () => {
    const interactive = vaultItemCardShellClassName({ interactive: true });
    expect(interactive).toContain('focus-visible:ring-2');
    expect(interactive).toContain('focus-visible:ring-primary/50');
  });
});

describe('vaultItemCardAccentBarClassName', () => {
  it('hides accent at rest when not selected', () => {
    const classes = vaultItemCardAccentBarClassName({ selected: false });
    expect(classes).toContain('opacity-0');
    expect(classes).toContain('group-focus-within:opacity-100');
    expect(classes).toContain('group-focus-visible:opacity-100');
  });

  it('shows accent when selected', () => {
    const classes = vaultItemCardAccentBarClassName({ selected: true });
    expect(classes).toContain('opacity-100');
    expect(classes).toContain('bg-primary/50');
  });

  it('uses absolute positioning to avoid layout shift', () => {
    const classes = vaultItemCardAccentBarClassName();
    expect(classes).toContain('absolute');
    expect(classes).not.toContain('border-l-');
  });
});
