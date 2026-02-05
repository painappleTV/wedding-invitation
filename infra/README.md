# AWS デプロイ手順

**初心者の方へ:** 詳しい手順は [AWSデプロイ手順_初心者向け.md](../AWSデプロイ手順_初心者向け.md) を参照してください。以下は簡易版です。

## 前提条件

- AWS CLI が設定済み（`aws configure`）
- AWS SAM CLI がインストール済み（[インストール手順](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)）

## 1. バックエンド（API + DynamoDB）のデプロイ

```bash
# プロジェクトルートで実行
cd wedding-invitation

# ビルド
sam build

# 初回デプロイ（対話形式）
sam deploy --guided

# 2回目以降
sam deploy
```

デプロイ後、出力される `ApiUrl` をメモしてください。

## 2. ゲストデータの投入

```bash
cd scripts
npm install
TABLE_NAME=wedding-guests npx tsx seed-guests.ts
```

`guests.example.json` を編集してゲストを追加し、スクリプトを拡張することも可能です。

## 3. フロントエンドのデプロイ

### オプションA: S3 + CloudFront

```bash
# ビルド（API URLを設定）
# .env.production に VITE_API_URL=https://xxx.execute-api.region.amazonaws.com/Prod を設定
npm run build

# S3バケット作成・アップロード
aws s3 mb s3://your-wedding-invitation-bucket
aws s3 sync dist/ s3://your-wedding-invitation-bucket --delete

# S3静的ウェブサイトホスティング有効化
aws s3 website s3://your-wedding-invitation-bucket --index-document index.html --error-document index.html

# CloudFront ディストリビューション作成（AWSコンソール推奨）
# オリジン: S3バケット
# エラーページ: 404,403 → index.html（SPA用）
```

### オプションB: AWS Amplify

1. AWS Amplify コンソールで「新しいアプリ」→「ホストされたウェブアプリ」
2. GitHub リポジトリを接続
3. ビルド設定で環境変数 `VITE_API_URL` を設定
4. デプロイ

## 4. 環境変数

| 変数 | 説明 |
|------|------|
| VITE_API_URL | API Gateway のベースURL（例: https://xxx.execute-api.ap-northeast-1.amazonaws.com/Prod） |
| TABLE_NAME | DynamoDB テーブル名（デフォルト: wedding-guests） |
