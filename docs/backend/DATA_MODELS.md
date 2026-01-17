# DynamoDB Data Models

**Design Pattern:** Single-Table Design  
**Table Name:** `personal-os-{stage}` (e.g., `personal-os-dev`, `personal-os-prod`)

---

## Table Schema

### Primary Key

| Attribute | Type   | Description   |
| --------- | ------ | ------------- |
| `pk`      | String | Partition Key |
| `sk`      | String | Sort Key      |

### Global Secondary Indexes

#### GSI1: Entity Type + Status

| Attribute | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| `gsi1pk`  | String | Entity type (e.g., "TASK", "GOAL") |
| `gsi1sk`  | String | `{status}#{createdAt}`             |

**Use Case:** Query all tasks with status "InProgress" sorted by creation date.

#### GSI2: Area + Entity Type

| Attribute | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| `gsi2pk`  | String | Life area (e.g., "Health", "Wealth") |
| `gsi2sk`  | String | `{entityType}#{createdAt}`           |

**Use Case:** Query all Health-related entities sorted by type and date.

---

## Access Patterns

| Pattern                   | PK                    | SK                         | Index |
| ------------------------- | --------------------- | -------------------------- | ----- |
| Get user profile          | `USER#{userId}`       | `PROFILE`                  | Table |
| List user's tasks         | `USER#{userId}`       | `begins_with(TASK#)`       | Table |
| Get single task           | `USER#{userId}`       | `TASK#{taskId}`            | Table |
| List user's goals         | `USER#{userId}`       | `begins_with(GOAL#)`       | Table |
| Get single goal           | `USER#{userId}`       | `GOAL#{goalId}`            | Table |
| List user's metrics       | `USER#{userId}`       | `begins_with(METRIC#)`     | Table |
| List user's habits        | `USER#{userId}`       | `begins_with(HABIT#)`      | Table |
| List user's projects      | `USER#{userId}`       | `begins_with(PROJECT#)`    | Table |
| List user's logbook       | `USER#{userId}`       | `begins_with(LOGBOOK#)`    | Table |
| Get wallet                | `USER#{userId}`       | `WALLET`                   | Table |
| List rewards              | `USER#{userId}`       | `begins_with(REWARD#)`     | Table |
| List metric logs          | `METRIC#{metricId}`   | `begins_with(LOG#)`        | Table |
| List habit logs           | `HABIT#{habitId}`     | `begins_with(LOG#)`        | Table |
| List goal→task links      | `GOAL#{goalId}`       | `begins_with(TASK#)`       | Table |
| List goal→metric links    | `GOAL#{goalId}`       | `begins_with(METRIC#)`     | Table |
| List goal→habit links     | `GOAL#{goalId}`       | `begins_with(HABIT#)`      | Table |
| List task dependencies    | `TASK#{taskId}`       | `begins_with(DEP#)`        | Table |
| List project→task links   | `PROJECT#{projectId}` | `begins_with(TASK#)`       | Table |
| List milestones           | `METRIC#{metricId}`   | `begins_with(MILESTONE#)`  | Table |
| List AI insights (cached) | `METRIC#{metricId}`   | `begins_with(INSIGHT#)`    | Table |
| List goal activities      | `GOAL#{goalId}`       | `begins_with(ACTIVITY#)`   | Table |
| Query tasks by status     | `TASK`                | `{status}#{createdAt}`     | GSI1  |
| Query goals by status     | `GOAL`                | `{status}#{createdAt}`     | GSI1  |
| Query by area             | `{area}`              | `{entityType}#{createdAt}` | GSI2  |

---

## Entity Definitions

### Common Attributes

All entities include these base attributes:

```python
class BaseEntity:
    pk: str                    # Partition key
    sk: str                    # Sort key
    entityType: str            # "TASK", "GOAL", "METRIC", etc.
    userId: str                # Owner user ID (Cognito sub)
    createdAt: str             # ISO 8601 timestamp
    updatedAt: str             # ISO 8601 timestamp
    gsi1pk: Optional[str]      # GSI1 partition key
    gsi1sk: Optional[str]      # GSI1 sort key
    gsi2pk: Optional[str]      # GSI2 partition key
    gsi2sk: Optional[str]      # GSI2 sort key
    ttl: Optional[int]         # TTL for cached data (epoch seconds)
```

---

### User Profile

| Attribute     | Type   | Description                             |
| ------------- | ------ | --------------------------------------- |
| `pk`          | String | `USER#{userId}`                         |
| `sk`          | String | `PROFILE`                               |
| `entityType`  | String | `"USER"`                                |
| `email`       | String | User email                              |
| `displayName` | String | Display name                            |
| `preferences` | Map    | User preferences (theme, notifications) |
| `createdAt`   | String | Account creation date                   |

```python
# Example
{
    "pk": "USER#abc-123",
    "sk": "PROFILE",
    "entityType": "USER",
    "email": "user@example.com",
    "displayName": "John Doe",
    "preferences": {
        "theme": "dark",
        "defaultArea": "Health"
    },
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-10T00:00:00Z"
}
```

---

### Task

| Attribute             | Type         | Description                                              |
| --------------------- | ------------ | -------------------------------------------------------- |
| `pk`                  | String       | `USER#{userId}`                                          |
| `sk`                  | String       | `TASK#{taskId}`                                          |
| `entityType`          | String       | `"TASK"`                                                 |
| `id`                  | String       | Task ID (same as in SK)                                  |
| `title`               | String       | Task title                                               |
| `description`         | String       | Optional description                                     |
| `extendedDescription` | String       | Extended notes                                           |
| `area`                | String       | Life area                                                |
| `subCategory`         | String       | Sub-category                                             |
| `priority`            | String       | P1, P2, P3, P4                                           |
| `status`              | String       | NotStarted, InProgress, Blocked, OnHold, Done, Cancelled |
| `size`                | Number       | Estimated minutes                                        |
| `dueDate`             | String       | ISO date                                                 |
| `scheduledDate`       | String       | ISO date                                                 |
| `completedDate`       | String       | ISO timestamp when completed                             |
| `isRecurring`         | Boolean      | Is recurring task                                        |
| `recurrenceRule`      | Map          | `{frequency, interval, endDate}`                         |
| `pointValue`          | Number       | Calculated point value                                   |
| `pointsAwarded`       | Boolean      | Whether points were awarded                              |
| `notes`               | String       | Additional notes                                         |
| `goalIds`             | List[String] | Linked goal IDs (embedded)                               |
| `projectIds`          | List[String] | Linked project IDs (embedded)                            |
| `gsi1pk`              | String       | `"TASK"`                                                 |
| `gsi1sk`              | String       | `{status}#{createdAt}`                                   |
| `gsi2pk`              | String       | `{area}`                                                 |
| `gsi2sk`              | String       | `TASK#{createdAt}`                                       |

```python
# Example
{
    "pk": "USER#abc-123",
    "sk": "TASK#task-xyz-789",
    "entityType": "TASK",
    "id": "task-xyz-789",
    "title": "Review Q1 financials",
    "description": "Analyze quarterly spending",
    "area": "Wealth",
    "subCategory": "Income",
    "priority": "P2",
    "status": "InProgress",
    "size": 60,
    "dueDate": "2026-01-15",
    "scheduledDate": "2026-01-14",
    "completedDate": None,
    "isRecurring": False,
    "recurrenceRule": None,
    "pointValue": 120,
    "pointsAwarded": False,
    "goalIds": ["goal-abc"],
    "projectIds": ["project-def"],
    "gsi1pk": "TASK",
    "gsi1sk": "InProgress#2026-01-10T10:00:00Z",
    "gsi2pk": "Wealth",
    "gsi2sk": "TASK#2026-01-10T10:00:00Z",
    "userId": "abc-123",
    "createdAt": "2026-01-10T10:00:00Z",
    "updatedAt": "2026-01-10T12:00:00Z"
}
```

---

### Task Dependency (Separate Item)

| Attribute         | Type   | Description             |
| ----------------- | ------ | ----------------------- |
| `pk`              | String | `TASK#{taskId}`         |
| `sk`              | String | `DEP#{dependsOnTaskId}` |
| `entityType`      | String | `"TASK_DEPENDENCY"`     |
| `taskId`          | String | Blocked task ID         |
| `dependsOnTaskId` | String | Blocking task ID        |

```python
# Example: Task A depends on Task B
{
    "pk": "TASK#task-A",
    "sk": "DEP#task-B",
    "entityType": "TASK_DEPENDENCY",
    "taskId": "task-A",
    "dependsOnTaskId": "task-B",
    "createdAt": "2026-01-10T10:00:00Z"
}
```

---

### Goal

| Attribute         | Type      | Description                                            |
| ----------------- | --------- | ------------------------------------------------------ |
| `pk`              | String    | `USER#{userId}`                                        |
| `sk`              | String    | `GOAL#{goalId}`                                        |
| `entityType`      | String    | `"GOAL"`                                               |
| `id`              | String    | Goal ID                                                |
| `title`           | String    | Goal title                                             |
| `description`     | String    | Goal description                                       |
| `area`            | String    | Life area                                              |
| `subCategory`     | String    | Sub-category                                           |
| `timeHorizon`     | String    | Yearly, Quarterly, Monthly, Weekly, Daily              |
| `priority`        | String    | P1-P4                                                  |
| `status`          | String    | Planning, Active, OnTrack, AtRisk, Achieved, Abandoned |
| `targetDate`      | String    | Target completion date                                 |
| `completedDate`   | String    | Actual completion date                                 |
| `successCriteria` | List[Map] | Embedded success criteria                              |
| `progressConfig`  | Map       | Weight configuration                                   |
| `cachedProgress`  | Number    | Cached progress percentage (0-100)                     |
| `parentGoalId`    | String    | Parent goal for hierarchy                              |
| `lastActivityAt`  | String    | Last activity timestamp                                |
| `notes`           | String    | Notes                                                  |

#### Success Criterion (Embedded)

```python
{
    "id": "criteria-1",
    "text": "Reach 180 lbs",
    "isCompleted": False,
    "completedAt": None,
    "linkedMetricId": "metric-weight",
    "linkedTaskId": None,
    "targetDate": "2026-06-01",
    "order": 1
}
```

#### Progress Config (Embedded)

```python
{
    "criteriaWeight": 40,
    "tasksWeight": 30,
    "metricsWeight": 20,
    "habitsWeight": 10,
    "manualOverride": None
}
```

---

### Goal-Entity Links (Separate Items)

#### Goal → Task Link

| Attribute    | Type   | Description     |
| ------------ | ------ | --------------- |
| `pk`         | String | `GOAL#{goalId}` |
| `sk`         | String | `TASK#{taskId}` |
| `entityType` | String | `"GOAL_TASK"`   |

#### Goal → Metric Link

| Attribute    | Type   | Description         |
| ------------ | ------ | ------------------- |
| `pk`         | String | `GOAL#{goalId}`     |
| `sk`         | String | `METRIC#{metricId}` |
| `entityType` | String | `"GOAL_METRIC"`     |

#### Goal → Habit Link

| Attribute    | Type   | Description       |
| ------------ | ------ | ----------------- |
| `pk`         | String | `GOAL#{goalId}`   |
| `sk`         | String | `HABIT#{habitId}` |
| `entityType` | String | `"GOAL_HABIT"`    |

---

### Goal Activity (Separate Items)

| Attribute           | Type   | Description                               |
| ------------------- | ------ | ----------------------------------------- |
| `pk`                | String | `GOAL#{goalId}`                           |
| `sk`                | String | `ACTIVITY#{timestamp}`                    |
| `entityType`        | String | `"GOAL_ACTIVITY"`                         |
| `type`              | String | criterion_completed, task_completed, etc. |
| `title`             | String | Activity title                            |
| `description`       | String | Activity description                      |
| `relatedEntityType` | String | Related entity type                       |
| `relatedEntityId`   | String | Related entity ID                         |

---

### Metric

| Attribute       | Type   | Description                              |
| --------------- | ------ | ---------------------------------------- |
| `pk`            | String | `USER#{userId}`                          |
| `sk`            | String | `METRIC#{metricId}`                      |
| `entityType`    | String | `"METRIC"`                               |
| `id`            | String | Metric ID                                |
| `name`          | String | Metric name                              |
| `description`   | String | Description                              |
| `area`          | String | Life area                                |
| `subCategory`   | String | Sub-category                             |
| `unit`          | String | count, hours, dollars, kg, percent, etc. |
| `customUnit`    | String | Custom unit label                        |
| `direction`     | String | Higher, Lower, Target                    |
| `targetValue`   | Number | Target value                             |
| `thresholdLow`  | Number | Low threshold for alerts                 |
| `thresholdHigh` | Number | High threshold for alerts                |
| `source`        | String | Manual, App, Device                      |
| `status`        | String | Active, Paused, Archived                 |
| `cachedStreak`  | Number | Current streak (cached)                  |
| `cachedTrend`   | String | Improving, Declining, Stable             |

---

### Metric Log (Separate Items)

| Attribute    | Type   | Description           |
| ------------ | ------ | --------------------- |
| `pk`         | String | `METRIC#{metricId}`   |
| `sk`         | String | `LOG#{timestamp}`     |
| `entityType` | String | `"METRIC_LOG"`        |
| `id`         | String | Log ID                |
| `metricId`   | String | Parent metric ID      |
| `value`      | Number | Logged value          |
| `notes`      | String | Optional notes        |
| `loggedAt`   | String | When value was logged |

```python
# Example
{
    "pk": "METRIC#metric-steps",
    "sk": "LOG#2026-01-10T18:00:00Z",
    "entityType": "METRIC_LOG",
    "id": "log-abc",
    "metricId": "metric-steps",
    "value": 10500,
    "notes": "Walked to work",
    "loggedAt": "2026-01-10T18:00:00Z",
    "userId": "abc-123",
    "createdAt": "2026-01-10T18:00:00Z"
}
```

---

### Metric Milestone (Separate Items)

| Attribute       | Type   | Description                                      |
| --------------- | ------ | ------------------------------------------------ |
| `pk`            | String | `METRIC#{metricId}`                              |
| `sk`            | String | `MILESTONE#{milestoneId}`                        |
| `entityType`    | String | `"METRIC_MILESTONE"`                             |
| `id`            | String | Milestone ID                                     |
| `metricId`      | String | Parent metric ID                                 |
| `type`          | String | target_reached, streak, improvement, consistency |
| `value`         | Number | Milestone value (e.g., 7 for streak_7)           |
| `achievedAt`    | String | When milestone was achieved                      |
| `pointsAwarded` | Number | Points awarded                                   |

---

### Metric Insight (Cached AI Results)

| Attribute    | Type   | Description                                 |
| ------------ | ------ | ------------------------------------------- |
| `pk`         | String | `METRIC#{metricId}`                         |
| `sk`         | String | `INSIGHT#{type}#{timestamp}`                |
| `entityType` | String | `"METRIC_INSIGHT"`                          |
| `type`       | String | pattern, anomaly, correlation, prediction   |
| `content`    | Map    | AI result payload                           |
| `cachedAt`   | String | When cached                                 |
| `expiresAt`  | String | Cache expiration                            |
| `ttl`        | Number | TTL in epoch seconds (DynamoDB auto-delete) |

---

### Habit

| Attribute             | Type         | Description                     |
| --------------------- | ------------ | ------------------------------- |
| `pk`                  | String       | `USER#{userId}`                 |
| `sk`                  | String       | `HABIT#{habitId}`               |
| `entityType`          | String       | `"HABIT"`                       |
| `id`                  | String       | Habit ID                        |
| `name`                | String       | Habit name                      |
| `description`         | String       | Description                     |
| `area`                | String       | Life area                       |
| `subCategory`         | String       | Sub-category                    |
| `habitType`           | String       | Build, Maintain, Reduce, Quit   |
| `frequency`           | String       | Daily, Weekly, Monthly, Custom  |
| `trigger`             | String       | Habit trigger                   |
| `action`              | String       | Habit action                    |
| `reward`              | String       | Habit reward                    |
| `frictionUp`          | String       | Increase friction (bad habits)  |
| `frictionDown`        | String       | Decrease friction (good habits) |
| `status`              | String       | Active, Paused, Archived        |
| `cachedStreak`        | Number       | Current streak                  |
| `cachedLongestStreak` | Number       | Longest streak                  |
| `goalIds`             | List[String] | Linked goal IDs (embedded)      |

---

### Habit Log (Separate Items)

| Attribute    | Type    | Description                  |
| ------------ | ------- | ---------------------------- |
| `pk`         | String  | `HABIT#{habitId}`            |
| `sk`         | String  | `LOG#{date}`                 |
| `entityType` | String  | `"HABIT_LOG"`                |
| `habitId`    | String  | Parent habit ID              |
| `date`       | String  | Completion date (YYYY-MM-DD) |
| `completed`  | Boolean | Whether completed            |
| `notes`      | String  | Optional notes               |

---

### Project

| Attribute        | Type         | Description                                    |
| ---------------- | ------------ | ---------------------------------------------- |
| `pk`             | String       | `USER#{userId}`                                |
| `sk`             | String       | `PROJECT#{projectId}`                          |
| `entityType`     | String       | `"PROJECT"`                                    |
| `id`             | String       | Project ID                                     |
| `name`           | String       | Project name                                   |
| `description`    | String       | Description                                    |
| `area`           | String       | Life area                                      |
| `subCategory`    | String       | Sub-category                                   |
| `priority`       | String       | P1-P4                                          |
| `status`         | String       | Planning, Active, OnHold, Completed, Cancelled |
| `impact`         | Number       | Impact score 1-5                               |
| `startDate`      | String       | Start date                                     |
| `endDate`        | String       | Target end date                                |
| `completedDate`  | String       | Actual completion date                         |
| `notes`          | String       | Notes                                          |
| `cachedHealth`   | String       | green, yellow, red (cached)                    |
| `cachedProgress` | Number       | Completion percentage                          |
| `goalIds`        | List[String] | Linked goal IDs (embedded)                     |

---

### Project → Task Link (Separate Items)

| Attribute    | Type   | Description           |
| ------------ | ------ | --------------------- |
| `pk`         | String | `PROJECT#{projectId}` |
| `sk`         | String | `TASK#{taskId}`       |
| `entityType` | String | `"PROJECT_TASK"`      |

---

### Logbook Entry

| Attribute          | Type         | Description                   |
| ------------------ | ------------ | ----------------------------- |
| `pk`               | String       | `USER#{userId}`               |
| `sk`               | String       | `LOGBOOK#{date}`              |
| `entityType`       | String       | `"LOGBOOK"`                   |
| `id`               | String       | Entry ID                      |
| `date`             | String       | Entry date (YYYY-MM-DD)       |
| `title`            | String       | Entry title                   |
| `notes`            | String       | Markdown content              |
| `mood`             | String       | Low, Steady, High             |
| `energy`           | Number       | 1-10 scale                    |
| `linkedTaskIds`    | List[String] | Linked task IDs (embedded)    |
| `linkedGoalIds`    | List[String] | Linked goal IDs (embedded)    |
| `linkedHabitIds`   | List[String] | Linked habit IDs (embedded)   |
| `linkedProjectIds` | List[String] | Linked project IDs (embedded) |

---

### Reward

| Attribute                | Type    | Description                                     |
| ------------------------ | ------- | ----------------------------------------------- |
| `pk`                     | String  | `USER#{userId}`                                 |
| `sk`                     | String  | `REWARD#{rewardId}`                             |
| `entityType`             | String  | `"REWARD"`                                      |
| `id`                     | String  | Reward ID                                       |
| `title`                  | String  | Reward title                                    |
| `description`            | String  | Description                                     |
| `category`               | String  | Quick Treat, Daily Delight, Weekly Reward, etc. |
| `pointCost`              | Number  | Cost in points                                  |
| `icon`                   | String  | Emoji icon                                      |
| `imageUrl`               | String  | Optional image URL                              |
| `isAutomated`            | Boolean | Can be automated                                |
| `automationInstructions` | String  | Automation details                              |
| `cooldownHours`          | Number  | Cooldown between redemptions                    |
| `maxRedemptionsPerDay`   | Number  | Max daily redemptions                           |
| `status`                 | String  | Active, Archived                                |

---

### Wallet

| Attribute        | Type   | Description           |
| ---------------- | ------ | --------------------- |
| `pk`             | String | `USER#{userId}`       |
| `sk`             | String | `WALLET`              |
| `entityType`     | String | `"WALLET"`            |
| `balance`        | Number | Current point balance |
| `lifetimeEarned` | Number | Total points earned   |
| `lifetimeSpent`  | Number | Total points spent    |

---

### Wallet Transaction (Separate Items)

| Attribute    | Type   | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| `pk`         | String | `USER#{userId}`                                  |
| `sk`         | String | `WALLET_TXN#{timestamp}`                         |
| `entityType` | String | `"WALLET_TRANSACTION"`                           |
| `id`         | String | Transaction ID                                   |
| `amount`     | Number | Points (positive for earned, negative for spent) |
| `type`       | String | earned, spent, manual                            |
| `reason`     | String | Transaction reason                               |
| `taskId`     | String | Related task ID (if applicable)                  |
| `metricId`   | String | Related metric ID (if applicable)                |
| `rewardId`   | String | Related reward ID (if applicable)                |

---

## Query Examples (boto3)

### List User's Tasks

```python
response = table.query(
    KeyConditionExpression=Key('pk').eq(f'USER#{user_id}') & Key('sk').begins_with('TASK#')
)
tasks = response['Items']
```

### Get Tasks by Status (GSI1)

```python
response = table.query(
    IndexName='GSI1',
    KeyConditionExpression=Key('gsi1pk').eq('TASK') & Key('gsi1sk').begins_with('InProgress#')
)
```

### Get Goal's Linked Tasks

```python
response = table.query(
    KeyConditionExpression=Key('pk').eq(f'GOAL#{goal_id}') & Key('sk').begins_with('TASK#')
)
linked_task_ids = [item['sk'].replace('TASK#', '') for item in response['Items']]
```

### Get Metric Logs (Time Range)

```python
response = table.query(
    KeyConditionExpression=Key('pk').eq(f'METRIC#{metric_id}') &
                           Key('sk').between(f'LOG#{start_date}', f'LOG#{end_date}')
)
logs = response['Items']
```

---

## Capacity Planning

### On-Demand Mode (Recommended for Start)

- Pay per request
- Auto-scales
- No capacity planning needed
- Best for unpredictable workloads

### Provisioned Mode (Cost Optimization Later)

Estimate for single user with moderate activity:

| Operation      | Frequency | RCU/WCU   |
| -------------- | --------- | --------- |
| Read tasks     | 50/day    | ~0.01 RCU |
| Create task    | 10/day    | ~0.01 WCU |
| Log metric     | 20/day    | ~0.01 WCU |
| Read dashboard | 10/day    | ~0.01 RCU |

**Recommendation:** Start with On-Demand, switch to Provisioned (1 RCU, 1 WCU) after usage patterns are clear.
