import { afterEach, describe, expect, it } from 'vitest';

import {
  COURSE_PRACTICE_SHOW_ANSWERS_KEY,
  readShowAnswersPreference,
  writeShowAnswersPreference,
} from '@/lib/knowledge-vault/course-practice-show-answers';

describe('course-practice-show-answers', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('defaults to false when key is absent', () => {
    expect(readShowAnswersPreference()).toBe(false);
  });

  it('returns true when sessionStorage is "1"', () => {
    sessionStorage.setItem(COURSE_PRACTICE_SHOW_ANSWERS_KEY, '1');
    expect(readShowAnswersPreference()).toBe(true);
  });

  it('returns false when sessionStorage is "0"', () => {
    sessionStorage.setItem(COURSE_PRACTICE_SHOW_ANSWERS_KEY, '0');
    expect(readShowAnswersPreference()).toBe(false);
  });

  it('writes "1" when enabled and "0" when disabled', () => {
    writeShowAnswersPreference(true);
    expect(sessionStorage.getItem(COURSE_PRACTICE_SHOW_ANSWERS_KEY)).toBe('1');
    writeShowAnswersPreference(false);
    expect(sessionStorage.getItem(COURSE_PRACTICE_SHOW_ANSWERS_KEY)).toBe('0');
  });
});
