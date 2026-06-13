# Runbook

このページは、障害対応や日次運用で TechDocs をどう使うかを示すサンプルです。

## Symptoms

| Symptom                        | First check      | Escalation     |
| ------------------------------ | ---------------- | -------------- |
| バッチが遅延している           | Worker backlog   | Platform team  |
| 同じジョブが再実行される       | `idempotencyKey` | Service owner  |
| Kubernetes の Pod が再起動する | Pod events       | Infra rotation |

## Triage

1. Backstage の Entity ページで Kubernetes タブを開きます。
2. `batch-services` に関連する Pod の restart count を確認します。
3. Snyk タブで直近の高重大度 issue が増えていないか確認します。
4. TechDocs のこの Runbook から復旧手順を実行します。

!!! warning "Do not skip idempotency checks"
バッチを手動で再実行する前に、対象ジョブの `idempotencyKey` と出力先を確認してください。

## Commands

```bash
kubectl get pods -l backstage.io/kubernetes-id=batch-services
```

```bash
kubectl describe pod <pod-name>
```

```bash
kubectl logs deployment/batch-services --tail=200
```

## Retry Policy

| Error class      | Retry       | Notes                       |
| ---------------- | ----------- | --------------------------- |
| Network timeout  | Yes         | Exponential backoff         |
| Validation error | No          | 入力データを修正する        |
| Partial write    | Conditional | Downstream の重複排除を確認 |

## Recovery Decision

```text
Is the queue growing?
  yes -> Are workers healthy?
    yes -> Check downstream rate limits
    no  -> Restart unhealthy workers
  no  -> Check alert threshold and close incident if stable
```

## Post-Incident Notes

インシデント後は以下を残します。

- 発生日時と検知経路
- 影響を受けたジョブ ID
- 復旧に使ったコマンド
- 恒久対応の issue link
