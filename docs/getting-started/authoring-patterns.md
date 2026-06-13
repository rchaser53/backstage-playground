# Authoring Patterns

このページは、TechDocs の本文でよく使う Markdown 表現のサンプルです。

## Admonitions

!!! note "Note"
補足情報や背景です。読み飛ばしても手順は進められます。

!!! warning "Warning"
作業前に確認すべきリスクです。運用手順や破壊的操作の前に置くと効果的です。

!!! failure "Failure"
失敗時の原因や復旧条件をまとめる場所として使えます。

## Tables

| Environment | Builder    | Publisher              | Intended use            |
| ----------- | ---------- | ---------------------- | ----------------------- |
| Local       | `local`    | `local`                | 開発者の動作確認        |
| CI          | `external` | `awsS3` or `googleGcs` | 本番向けの事前生成      |
| Preview     | `local`    | `local`                | Pull Request 単位の確認 |

## Code Blocks

```bash
yarn start
```

```yaml
techdocs:
  builder: local
  generator:
    runIn: local
  publisher:
    type: local
```

```ts
type BatchJob = {
  id: string;
  queue: 'default' | 'priority';
  idempotencyKey: string;
};
```

## Task Lists

- [x] Entity に `backstage.io/techdocs-ref` を付与する
- [x] `mkdocs.yml` を配置する
- [x] `docs/index.md` を配置する
- [ ] CI/CD で TechDocs を publish する

## Footnotes

TechDocs は MkDocs ベースなので、Markdown の表現を利用して運用知識を読みやすくできます。[^mkdocs]

[^mkdocs]: このサンプルでは追加の外部 MkDocs plugin を必要としない基本機能を中心にしています。

## HTML Details

<details>
<summary>詳細なメモを開く</summary>

長い背景説明や、普段は隠しておきたい補足を折りたたんで配置できます。

</details>
