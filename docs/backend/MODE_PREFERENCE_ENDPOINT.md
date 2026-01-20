# Mode Preference Endpoint

**Route:** `/preferences/mode`  
**Auth:** Required (JWT Bearer token)

## Overview

User preference for application mode: `'work'` or `'leisure'`. Controls UI styling and behavior via CSS class `leisure-mode` on document root.

---

## GET `/preferences/mode`

Retrieves the current user's mode preference.

### Response

**Success (200):**

```json
{
  "success": true,
  "data": {
    "mode": "work"
  },
  "error": null
}
```

**Default:** If no preference exists, return `"work"`.

**Error (401):**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## POST `/preferences/mode`

Saves the user's mode preference.

### Request Body

```json
{
  "mode": "leisure"
}
```

**Validation:**

- `mode` must be exactly `"work"` or `"leisure"`
- Return `400` if invalid

### Response

**Success (200):**

```json
{
  "success": true,
  "data": null,
  "error": null
}
```

**Error (400):**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "mode must be 'work' or 'leisure'"
  }
}
```

---

## Implementation Notes

- **Storage:** User-scoped preference (tied to authenticated user ID)
- **Persistence:** Store in database (e.g., `user_preferences` table with `user_id`, `key`, `value`)
- **Default:** Return `"work"` if no preference exists (don't error)
- **Frontend Usage:** `ModeProvider` loads on app init; toggles via `toggleMode()`
