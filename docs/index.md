# batch-services TechDocs Sample

このドキュメントは TechDocs の基本機能を一通り確認するためのサンプルです。
ナビゲーション、ページ内目次、検索、コードブロック、表、画像、注意書き、Runbook、API 仕様風のページを含めています。

## What to Try

| Feature            | Where to try it                        | What you should see                                |
| ------------------ | -------------------------------------- | -------------------------------------------------- |
| 左ナビゲーション   | すべてのページ                         | `mkdocs.yml` の `nav` に沿った階層メニュー         |
| ページ内目次       | 長いページ                             | 見出しから自動生成された右側の目次                 |
| コピー可能なコード | [Runbook](guides/runbook.md)           | コードブロックのコピー操作                         |
| 画像プレビュー     | [Architecture](guides/architecture.md) | 画像クリック時の Lightbox                          |
| 文字サイズ変更     | TechDocs 右上の設定                    | TextSize addon による表示サイズ変更                |
| フィードバック     | 任意の本文選択                         | `repo_url` と `edit_uri` を使った issue 作成リンク |

## Sample Component Context

`batch-services` はバッチ処理群を表す Backstage Component として登録されています。
TechDocs は `catalog-info.yaml` の `backstage.io/techdocs-ref: dir:.` アノテーションから、このリポジトリ直下の `mkdocs.yml` と `docs/` を読み取ります。

```yaml
metadata:
  name: batch-services
  annotations:
    backstage.io/techdocs-ref: dir:.
```

!!! note "Local generation"
このサンプルは `app-config.yaml` の `techdocs.builder: local` と `publisher.type: local` で動く想定です。
本番では CI/CD で生成して外部ストレージへ publish する構成に寄せると、アプリ起動時の負荷を抑えられます。

## Reader Flow

1. [Overview](getting-started/overview.md) で TechDocs の構成を確認します。
2. [Authoring Patterns](getting-started/authoring-patterns.md) で Markdown 表現を試します。
3. [Runbook](guides/runbook.md) で運用手順とコマンドを確認します。
4. [Architecture](guides/architecture.md) で画像と設計メモを確認します。
5. [API Contract](reference/api-contract.md) と [Operations Checklist](reference/operations-checklist.md) を検索対象として試します。
