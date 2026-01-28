# Post-Mortem: Post-Mortem Location Mistake

**Date**: 2026-01-28  
**Issue**: Detailed post-mortem content was added directly to `CLAUDE.md`  
**Root Cause**: Didn't establish a pattern for where post-mortems should be stored  
**Impact**: Polluted `CLAUDE.md` with excessive context that reduces its effectiveness as a quick reference

## What Happened

After writing a post-mortem for the success criteria field mismatch issue, the detailed analysis, decision framework, and lessons learned were added directly to `CLAUDE.md`. This made the file too long and cluttered with context that should be in a separate location.

## Why This Happened

1. **No established pattern**: There was no existing pattern or documentation about where post-mortems should be stored.

2. **Wanted to ensure visibility**: Assumed that putting it in `CLAUDE.md` would ensure future LLM agents would see it.

3. **Didn't consider context limits**: Didn't think about how the length would affect the file's usefulness as a quick reference.

4. **Mixed concerns**: Combined "what to do" (actionable takeaways) with "why and how we learned it" (detailed analysis).

## Why This Was Wrong

1. **CLAUDE.md is a quick reference**: It should contain only actionable takeaways and pointers to detailed documentation, not full analyses.

2. **Context pollution**: Long detailed content in `CLAUDE.md` reduces its effectiveness by taking up valuable context window space.

3. **Harder to maintain**: Detailed post-mortems mixed with quick reference make it harder to find and update specific information.

4. **Violates separation of concerns**: Quick reference vs. detailed analysis should be separated.

## The Correct Approach

1. **Create dedicated post-mortems folder**: Store detailed post-mortems in `docs/post-mortems/` with descriptive filenames.

2. **Keep CLAUDE.md lean**: Only include actionable takeaways and a pointer to where post-mortems are stored.

3. **Establish naming convention**: Use date-prefixed filenames (e.g., `2026-01-28-issue-name.md`) for chronological organization.

4. **Reference from CLAUDE.md**: Add a brief section in `CLAUDE.md` that points to the post-mortems folder for detailed learnings.

## Pattern Established

- **Location**: `docs/post-mortems/`
- **Naming**: `YYYY-MM-DD-descriptive-name.md`
- **Content**: Full analysis, decision frameworks, lessons learned, affected files, action items
- **CLAUDE.md reference**: Brief actionable takeaways only, with pointer to post-mortems folder

## Files Affected

- `CLAUDE.md` - Remove detailed content, keep only actionable takeaways
- `docs/post-mortems/` - New folder for storing detailed post-mortems

## Action Items

- [x] Create `docs/post-mortems/` folder
- [x] Move detailed post-mortem content to separate file
- [x] Update `CLAUDE.md` to only contain actionable takeaways
- [x] Create this meta post-mortem to document the pattern
