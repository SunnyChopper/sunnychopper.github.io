import { describe, expect, it } from 'vitest';
import {
  parseTasksDeepLinkParams,
  tasksUntaggedCompletedHref,
} from '@/lib/growth-system/tasks-deep-links';

describe('tasks-deep-links', () => {
  it('builds untagged completed tasks href', () => {
    expect(tasksUntaggedCompletedHref()).toBe(
      '/admin/tasks?status=Done&energyTag=untagged&view=list'
    );
  });

  it('parses deep-link params from URLSearchParams', () => {
    const sp = new URLSearchParams('status=Done&energyTag=untagged&view=list');
    expect(parseTasksDeepLinkParams(sp)).toEqual({
      status: 'Done',
      energyTag: 'untagged',
      view: 'list',
      hasDeepLinkParams: true,
    });
  });

  it('ignores invalid status values', () => {
    const sp = new URLSearchParams('status=Invalid&energyTag=untagged');
    expect(parseTasksDeepLinkParams(sp)).toEqual({
      status: undefined,
      energyTag: 'untagged',
      view: undefined,
      hasDeepLinkParams: true,
    });
  });

  it('parses query string without leading question mark', () => {
    expect(parseTasksDeepLinkParams('status=Done&view=list')).toEqual({
      status: 'Done',
      energyTag: undefined,
      view: 'list',
      hasDeepLinkParams: true,
    });
  });

  it('returns hasDeepLinkParams false when no recognized params', () => {
    expect(parseTasksDeepLinkParams(new URLSearchParams('taskId=abc'))).toEqual({
      status: undefined,
      energyTag: undefined,
      view: undefined,
      hasDeepLinkParams: false,
    });
  });
});
