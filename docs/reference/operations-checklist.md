# Operations Checklist

定常運用で確認する項目を TechDocs に置く例です。

## Daily

- [ ] 失敗ジョブが通常範囲内か確認する
- [ ] Queue depth のピークを確認する
- [ ] Worker restart count を確認する
- [ ] 新しい重大 vulnerability がないか確認する

## Weekly

- [ ] Runbook の復旧手順が古くなっていないか確認する
- [ ] Alert threshold が実運用に合っているか確認する
- [ ] TechDocs の検索で主要キーワードが見つかるか確認する

## Release Freeze

| Check                          | Owner         | Evidence       |
| ------------------------------ | ------------- | -------------- |
| 重大インシデントが未解決でない | Service owner | Incident board |
| Migration が rollback 可能     | Developer     | Pull request   |
| Runbook が更新済み             | Operations    | TechDocs page  |

## Definition of Done

1. `catalog-info.yaml` の owner が正しい。
2. TechDocs に最新の起動手順がある。
3. API contract が実装と一致している。
4. Runbook に復旧コマンドと判断基準がある。
