/** Session preference for course practice answer-key visibility (quiz + homework). */

export const COURSE_PRACTICE_SHOW_ANSWERS_KEY = 'personalos.coursePractice.showAnswers';

export function readShowAnswersPreference(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(COURSE_PRACTICE_SHOW_ANSWERS_KEY) === '1';
}

export function writeShowAnswersPreference(value: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(COURSE_PRACTICE_SHOW_ANSWERS_KEY, value ? '1' : '0');
}
