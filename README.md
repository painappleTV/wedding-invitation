# 結婚式招待状 Web サイト

結婚式の招待状を Web サイトで実装。招待者ごとの固有 URL で名前・メッセージを出し分け、出欠確認と写真ギャラリーを提供します。

## 機能

- **パーソナライズ**: `/invite/{招待コード}` で名前とメッセージを出し分け
- **出欠確認**: 出席/欠席、同伴者人数、メッセージをフォームで送信
- **写真ギャラリー**: カップルの写真を表示

## 技術スタック

- フロントエンド: React (Vite) + TypeScript + Tailwind CSS
- バックエンド: AWS Lambda + API Gateway + DynamoDB
- デプロイ: AWS SAM

## クイックスタート

### ローカル開発（モックデータ）

```bash
# 依存関係インストール
npm install

# フロントエンドのみ（モックデータで動作）
npm run dev
# http://localhost:5173 でアクセス
# /invite/abc123 または /invite/xyz789 でパーソナライズページ
```

### ローカル開発（API サーバー連携）

```bash
# ターミナル1: API サーバー起動
npm run dev:api

# ターミナル2: フロントエンド起動
npm run dev
# Vite のプロキシで /api が localhost:3001 に転送されます
```

### 本番ビルド

```bash
# .env.production に VITE_API_URL を設定してから
npm run build
# dist/ に出力
```

## カスタマイズ

[src/config.ts](src/config.ts) で以下を編集してください:

- 新郎新婦の名前
- 式場名・住所・日時
- 写真ギャラリーの画像パス

写真は `public/images/` に配置し、`config.ts` の `galleryImages` にパスを追加します。

## AWS デプロイ

詳細は [infra/README.md](infra/README.md) を参照してください。

1. `sam build` → `sam deploy --guided` でバックエンドをデプロイ
2. `scripts/seed-guests.ts` でゲストデータを投入
3. フロントエンドを S3 + CloudFront または Amplify でデプロイ

## ディレクトリ構成

```
wedding-invitation/
├── src/                 # React アプリ
├── backend/             # Lambda 関数
├── server/              # ローカル開発用 API
├── scripts/             # ゲストデータ投入スクリプト
├── infra/               # デプロイ手順
└── template.yaml        # AWS SAM テンプレート
```
