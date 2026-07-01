# backstage-playground

Backstage 1.51.0 をベースにした検証用 Developer Portal です。Software Catalog をルートページにし、Kubernetes、TechDocs、Snyk、Tech Radar、Scaffolder のローカルダウンロードテンプレートを組み込んでいます。

## 実装内容

- New Frontend System ベースの app 構成
- Catalog、Scaffolder、Search、TechDocs、Kubernetes、Notifications、User Settings
- Snyk frontend plugin と `/snyk` proxy
- Tech Radar の複数レーダー表示
  - `/tech-radar/platform`
  - `/tech-radar/data-ai`
  - `/tech-radar/security`
- `custom:zip-download` Scaffolder action
  - 生成された workspace を zip 化
  - `/static/scaffolder-downloads/<file>` からダウンロード
- Guest auth
- Permission backend は有効、現在の登録ポリシーは allow-all
- MCP Actions backend

## 必要条件

- Node.js 22 または 24
- Yarn 4.17.0

このリポジトリは `.yarn/releases/yarn-4.17.0.cjs` を使う設定です。

## ローカル起動

```sh
yarn install
yarn start
```

起動後は以下でアクセスします。

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:7007`

## 環境変数

`.env.sample` を参考に `.env` を作成してください。

```sh
GITHUB_TOKEN=github_pat_sample
```

必要に応じて以下も設定します。

```sh
SNYK_TOKEN=...
K8S_CLUSTER_URL=...
K8S_SERVICE_ACCOUNT_TOKEN=...
K8S_CLUSTER_CA_DATA=...
```

補足:

- `GITHUB_TOKEN` は GitHub integration と Scaffolder の GitHub action 用です。
- `SNYK_TOKEN` は Snyk plugin の API proxy で使います。
- Kubernetes は `app-config.yaml` の `kubernetes.clusterLocatorMethods` で service account 接続を使う設定です。
- ローカルで kube proxy を使う場合は、`app-config.yaml` の `localKubectlProxy` 設定コメントを参照してください。

## Catalog とサンプルデータ

`app-config.yaml` では以下を読み込みます。

- `examples/entities.yaml`
- `examples/fuga.yaml`
- `catalog-info.yaml`
- `examples/template/local-download.yaml`
- `examples/org.yaml`
- `https://github.com/rchaser53/sample-techdocs-service/blob/main/catalog-info.yaml`

`catalog-info.yaml` の `batch-services` component には Kubernetes、Snyk、TechDocs の annotation が付いています。

## Scaffolder

現在有効なテンプレートは `examples/template/local-download.yaml` です。

このテンプレートは `fetch:template` で `examples/template/content` を展開し、`custom:zip-download` action で生成物を zip にしてダウンロードリンクを返します。zip ファイルは backend 側の `/tmp/backstage-scaffolder-downloads` に作られ、`/static/scaffolder-downloads` で配信されます。

カスタム action の実装:

- `plugins/scaffolder-backend-module-zip-download/src/actions/zipDownload.ts`
- `plugins/scaffolder-backend-module-zip-download/src/module.ts`
- `packages/backend/src/index.ts`

## Tech Radar

Tech Radar は custom backend plugin と frontend module で複数データセットに対応しています。

設定:

- `techRadar.url`
- `techRadar.radars.platform`
- `techRadar.radars.data-ai`
- `techRadar.radars.security`

データ:

- `examples/tech-radar.json`
- `examples/tech-radar-data-ai.json`
- `examples/tech-radar-security.json`

実装:

- `packages/backend/src/index.ts`
- `packages/app/src/modules/techRadar`

## TechDocs

TechDocs は local builder / local publisher で動作します。

```yaml
techdocs:
  builder: local
  generator:
    runIn: local
  publisher:
    type: local
```

このリポジトリ自身も `catalog-info.yaml` の `backstage.io/techdocs-ref: dir:.` と `mkdocs.yml` により TechDocs 対象です。

## Kubernetes

Kubernetes plugin は frontend / backend ともに登録済みです。`catalog-info.yaml` の `batch-services` component は以下の annotation で Kubernetes resources と紐づきます。

```yaml
backstage.io/kubernetes-id: batch-services
backstage.io/kubernetes-namespace: default
backstage.io/kubernetes-cluster: local
```

動作確認用 manifest:

- `k8s-backstage-demo.yaml`
- `k8s/backstage-rdbc.yaml`

## よく使うコマンド

```sh
yarn start
yarn build:all
yarn build:backend
yarn build-image
yarn tsc
yarn test
yarn test:all
yarn test:e2e
yarn lint:all
yarn prettier:check
```

## 主要ディレクトリ

- `packages/app`: Backstage frontend
- `packages/backend`: Backstage backend
- `plugins/scaffolder-backend-module-zip-download`: custom Scaffolder backend module
- `examples`: Catalog、template、Tech Radar のサンプルデータ
- `docs`: TechDocs コンテンツ
- `k8s`: Kubernetes 検証用 manifest

## メモ

`packages/backend/src/authzPlaygroundPolicy.ts` には実験用の permission policy 実装がありますが、現在の `packages/backend/src/index.ts` では登録されていません。現状有効なのは `@backstage/plugin-permission-backend-module-allow-all-policy` です。
