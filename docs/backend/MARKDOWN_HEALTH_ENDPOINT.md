# Markdown Health Endpoint

## Endpoint

```
GET /health/markdown
```

## Expected Response

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## Response Schema

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
}

// For this endpoint:
ApiResponse<{ status: string }>;
```

## Notes

- Frontend considers backend "online" when `success === true` and `data` is present
- `status` field should be a string (e.g., `"ok"`, `"healthy"`, `"operational"`)
- On error, return `success: false` with an `error` object
