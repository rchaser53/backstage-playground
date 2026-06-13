# Overview

TechDocs は Backstage のカタログ Entity にドキュメントを紐付ける仕組みです。
このサンプルでは、1 つの Component に複数ページのドキュメントを持たせています。

## Files

| File                | Role                                          |
| ------------------- | --------------------------------------------- |
| `catalog-info.yaml` | Backstage Entity と TechDocs 参照を定義       |
| `mkdocs.yml`        | サイト名、ナビゲーション、Markdown 拡張を定義 |
| `docs/index.md`     | TechDocs のトップページ                       |
| `docs/guides/*.md`  | 手順書や設計説明などの本文                    |

## Generation Flow

```text
catalog-info.yaml
  -> backstage.io/techdocs-ref: dir:.
  -> mkdocs.yml
  -> docs/
  -> generated static site
  -> TechDocs reader
```

## Entity Annotation

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: batch-services
  annotations:
    backstage.io/techdocs-ref: dir:.
spec:
  type: website
  owner: user:guest
  lifecycle: experimental
```

!!! tip "TechDocs tab"
`@backstage/plugin-techdocs` を frontend features に登録すると、カタログ Entity の `TechDocs` タブと `/docs` ページから読めるようになります。

## Search Keywords

TechDocs の全文検索を試すため、以下のキーワードを各ページに散らしています。

| Keyword           | Expected page        |
| ----------------- | -------------------- |
| `retry policy`    | Runbook              |
| `idempotency key` | API Contract         |
| `worker pool`     | Architecture         |
| `release freeze`  | Operations Checklist |

## Ownership Model

Definition list の表示確認用です。

Service owner
: `user:guest`

Operational contact
: Batch operations rotation

Documentation source
: This repository's `docs/` directory
