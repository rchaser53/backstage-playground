# API Contract

TechDocs を API 仕様や運用契約の置き場所として使う例です。

## Create Job

```http
POST /api/jobs
Content-Type: application/json
Idempotency-Key: 2d4b6b2c-9e34-4e4f-9b21-5d9f43d5f515
```

```json
{
  "jobType": "daily-report",
  "queue": "default",
  "payload": {
    "targetDate": "2026-06-13"
  }
}
```

## Response

```json
{
  "id": "job_01JZ0000000000000000000000",
  "status": "queued",
  "idempotencyKey": "2d4b6b2c-9e34-4e4f-9b21-5d9f43d5f515"
}
```

## Fields

| Field            | Required | Description                 |
| ---------------- | -------- | --------------------------- |
| `jobType`        | Yes      | 実行するバッチ種別          |
| `queue`          | Yes      | `default` または `priority` |
| `payload`        | Yes      | ジョブごとの入力            |
| `idempotencyKey` | Yes      | 重複実行を避けるためのキー  |

## Error Codes

| Code  | Meaning                   | Retry |
| ----- | ------------------------- | ----- |
| `400` | Invalid payload           | No    |
| `409` | Duplicate idempotency key | No    |
| `429` | Rate limited              | Yes   |
| `500` | Internal error            | Yes   |

!!! tip "Search sample"
TechDocs 検索で `idempotency key` を検索すると、このページが見つかる想定です。
