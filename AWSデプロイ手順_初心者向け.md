# AWS デプロイ手順（初心者向け）

AWS や React の経験がなくても、この手順に沿って進めればデプロイできます。焦らず、1ステップずつ進めてください。

---

## 全体の流れ（3ステップ）

```
ステップ1: AWS の準備（アカウント・ツール）
    ↓
ステップ2: バックエンドをデプロイ（API・データベース）
    ↓
ステップ3: フロントエンドをデプロイ（サイト本体）
```

---

## ステップ1: AWS の準備

### 1-1. AWS アカウントを作る

1. https://aws.amazon.com/jp/ にアクセス
2. 「アカウント作成」をクリック
3. メールアドレス、パスワード、クレジットカード情報などを入力
4. 無料枠内で使えば、月数百円程度（場合によっては無料）で運用できます

### 1-2. AWS CLI をインストール

AWS をコマンドから操作するためのツールです。

**Windows の場合:**
1. https://aws.amazon.com/jp/cli/ から「Windows 用の AWS CLI をインストール」をダウンロード
2. インストーラーを実行してインストール
3. 新しい PowerShell またはコマンドプロンプトを開き、次を実行して確認：
   ```
   aws --version
   ```
   バージョンが表示されれば OK です。

### 1-3. AWS CLI を設定する

1. AWS コンソール（https://console.aws.amazon.com/）にログイン
2. 右上のアカウント名をクリック → 「セキュリティ認証情報」
3. 「アクセスキー」→「アクセスキーを作成」
4. 表示された「アクセスキー ID」と「シークレットアクセスキー」をメモ（シークレットは再表示できません）
5. ターミナルで次を実行：
   ```
   aws configure
   ```
6. 次のように入力（Enter で次へ）：
   - AWS Access Key ID: （メモしたアクセスキー ID）
   - AWS Secret Access Key: （メモしたシークレット）
   - Default region name: `ap-northeast-1`（東京リージョン）
   - Default output format: `json`（そのまま Enter で OK）

### 1-4. AWS SAM CLI をインストール

バックエンド（API・データベース）をデプロイするためのツールです。

**Windows の場合:**
1. https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html を開く
2. 「Windows」の手順に従い、インストーラーをダウンロード・実行
3. 新しいターミナルを開き、次で確認：
   ```
   sam --version
   ```

---

## ステップ2: バックエンドをデプロイ

### バックエンドって何？

バックエンドは、**サイトの裏側で動く仕組み**です。具体的には：

- **API**: ゲストの名前・メッセージを取得したり、出欠情報を受け取ったりする窓口
- **DynamoDB**: ゲスト情報や出欠データを保存するデータベース

サイトの見た目（フロントエンド）は後でデプロイします。まずはこの「裏側」を AWS 上に用意します。

---

### 2-1. プロジェクトフォルダに移動

**やること:** ターミナルで、プロジェクトのフォルダに移動します。

1. PowerShell またはコマンドプロンプトを開く
2. 次のコマンドを実行：
   ```
   cd C:\Users\super\wedding-invitation
   ```
   （パスは、あなたの PC で `wedding-invitation` フォルダがある場所に合わせてください）

3. 現在のフォルダを確認：
   ```
   dir
   ```
   `template.yaml`、`backend`、`src` などのフォルダが見えれば OK です。

---

### 2-2. ビルドする

**やること:** バックエンドのコードを、AWS で動かせる形に変換します。

1. 次のコマンドを実行：
   ```
   sam build
   ```

2. 表示される内容の例：
   ```
   Building codeuri: backend\...
   Building function 'GetGuestFunction'
   Building function 'SubmitRSVPFunction'
   ...
   Build Succeeded
   ```

3. **「Build Succeeded」** と出れば成功です。初回は 30 秒〜1 分ほどかかることがあります。

**エラーが出た場合:**
- 「sam は認識されていません」→ SAM CLI が入っているか、ターミナルを開き直したか確認
- 「Cannot find esbuild」→ 次のコマンドを実行してから再度 `sam build`：
  ```
  cd backend
  npm install
  cd ..
  ```
  （backend フォルダに esbuild が含まれています）
- 「npm install が必要」→ プロジェクトフォルダで `npm install` を実行してから再度 `sam build`

---

### 2-3. デプロイする（初回）

**やること:** ビルドしたものを AWS にアップロードし、API とデータベースを作成します。

1. 次のコマンドを実行：
   ```
   sam deploy --guided
   ```

2. 順番に質問が出るので、次の表を参考に入力します。**何も入力せず Enter だけ**で進む項目は、表の「入力例」の通りです。

| # | 質問（英語） | 入力例 | 補足 |
|---|--------------|--------|------|
| 1 | Stack Name | `wedding-invitation` | プロジェクトの識別名。そのまま Enter で OK |
| 2 | AWS Region | `ap-northeast-1` | 東京リージョン。そのまま Enter で OK |
| 3 | Confirm changes before deploy | `y` | デプロイ前に変更内容を確認するか。`y` 推奨 |
| 4 | Allow SAM CLI IAM role creation | `y` | 必要な権限を自動作成するか。必ず `y` |
| 5 | Disable rollback | `n` | 失敗時に元に戻すか。`n` 推奨 |
| 6 | Save arguments to config file | `y` | 次回から同じ設定を使うか。`y` 推奨 |
| 7 | SAM configuration file | `samconfig.toml` | そのまま Enter |
| 8 | SAM configuration environment | `default` | そのまま Enter |

3. 最後に **「Deploy this changeset? [y/N]:」** と聞かれたら、`y` を入力して Enter を押します。

4. デプロイが始まります。2〜5 分ほどかかることがあります。次のような表示が流れます：
   ```
   CloudFormation stack changeset
   -----------------------------------------
   ...
   Deploying with following values
   ...
   Successfully created/updated stack - wedding-invitation in ap-northeast-1
   ```

5. **「Successfully created/updated stack」** と出れば成功です。

**2回目以降のデプロイ:**  
コードを変更したときは、`sam build` のあとに `sam deploy` だけ実行すれば OK です（`--guided` は不要）。

---

### 2-4. API の URL をメモする

**やること:** デプロイ後に表示される API の URL を控えます。フロントエンドの設定で使います。

1. デプロイが終わると、最後に **Outputs** というブロックが表示されます：
   ```
   Outputs
   -----------------------------------------
   Key                 ApiUrl
   Description         API Gateway endpoint URL
   Value               https://a1b2c3d4e5.execute-api.ap-northeast-1.amazonaws.com/Prod/

   Key                 GuestsTableName
   Description         DynamoDB table name
   Value               wedding-guests
   ```

2. **ApiUrl** の **Value** の URL をメモします。  
   例: `https://a1b2c3d4e5.execute-api.ap-northeast-1.amazonaws.com/Prod`  
   （末尾の `/` はあってもなくても構いません。フロントエンド設定では `/` なしで書くことが多いです）

3. メモ帳などに貼り付けておき、ステップ3 で使います。

---

### 2-5. ゲストデータを登録する

**やること:** 空のデータベースに、招待するゲストの情報を登録します。

1. `scripts` フォルダに移動：
   ```
   cd scripts
   ```

2. 依存関係をインストール（初回のみ）：
   ```
   npm install
   ```
   「added XX packages」と出れば OK です。

3. ゲストデータを投入：
   ```
   npx tsx seed-guests.ts
   ```

4. 次のような表示が出れば成功です：
   ```
   Seeding table: wedding-guests
     Added: 山田太郎 -> /invite/abc123xy
     Added: 佐藤花子 -> /invite/def456zw
     Added: 鈴木一郎 -> /invite/ghi789uv
   Done!
   ```

5. **招待コード**（`abc123xy` など）をメモしておきます。  
   招待ページの URL は `https://あなたのサイトのURL/invite/招待コード` になります。

**ゲストを追加・変更したい場合:**
- `scripts/seed-guests.ts` を開く
- `SAMPLE_GUESTS` の配列に、名前・メッセージ・customText などを追加・編集
- もう一度 `npx tsx seed-guests.ts` を実行

**注意:** 同じ招待コードのゲストを再度投入すると上書きされます。招待コードを変えたい場合は、`inviteCode` を指定するか、削除してから再投入してください。

---

## ステップ3: フロントエンドをデプロイ

フロントエンド = 実際に表示される Web サイトです。ここでは **AWS Amplify** を使う方法（比較的簡単）を説明します。

### 3-1. フロントエンドをビルドする

1. プロジェクトのルートフォルダ（`wedding-invitation`）に戻る：
   ```
   cd ..
   ```

2. 環境変数用のファイルを作成：  
   プロジェクトフォルダに `.env.production` というファイルを作り、次の1行を書いて保存：
   ```
   VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod
   ```
   （`xxxxxxxxxx` の部分は、ステップ2-4でメモした API の URL の `Prod` の直前までです。末尾の `/` は付けません）

3. ビルドを実行：
   ```
   npm run build
   ```

4. `dist` フォルダが作成されていれば OK です。

### 3-2. AWS Amplify でデプロイする

**方法A: 手動でアップロード（Git を使わない場合）**

1. https://console.aws.amazon.com/amplify/ にアクセス
2. 「新規作成」→「アプリ」→「ホストされたウェブアプリ」
3. 「デプロイしない」を選択してアプリを作成
4. 左メニュー「ホスティング」→「ホスティングの設定」
5. 「手動デプロイ」で `dist` フォルダの中身（`index.html` と `assets` フォルダ）を ZIP にしてアップロード

**方法B: GitHub と連携（おすすめ）**

1. プロジェクトを GitHub にプッシュする（詳しくは [GitからAmplifyにデプロイする手順.md](GitからAmplifyにデプロイする手順.md) を参照）
2. https://console.aws.amazon.com/amplify/ で「新規作成」→「アプリ」→「ホストされたウェブアプリ」
3. 「GitHub」を選択し、リポジトリを接続
4. ビルド設定で以下を入力：
   - ビルドコマンド: `npm run build`
   - 出力ディレクトリ: `dist`
   - 環境変数: `VITE_API_URL` = `https://xxxx.../Prod`（ステップ2-4の URL）
5. 「保存してデプロイ」をクリック

### 3-3. 表示される URL を確認する

デプロイが完了すると、`https://main.xxxxx.amplifyapp.com` のような URL が発行されます。この URL をブラウザで開いて、サイトが表示されるか確認してください。

招待ページは `https://main.xxxxx.amplifyapp.com/invite/（招待コード）` でアクセスできます。

---

## トラブルシューティング

### 「Cannot find esbuild」と表示される
SAM が esbuild を見つけられていません。次のコマンドで **グローバルに esbuild をインストール**してください：

```
npm install -g esbuild
```

インストール後、新しいターミナルを開いてから `sam build` を再度実行してください。

### 「sam コマンドが見つからない」
- SAM CLI をインストールした後、ターミナルを一度閉じて開き直してください
- パスが通っていない場合は、インストール手順の「環境変数」の設定を確認してください

### 「Access Denied」などのエラー
- `aws configure` で入力したアクセスキーが正しいか確認してください
- IAM ユーザーに必要な権限（Lambda, API Gateway, DynamoDB など）があるか確認してください

### 出欠フォームを送信するとエラーになる
- フロントエンドの `VITE_API_URL` が正しく設定されているか確認してください
- API の URL の末尾に `/` を付けないでください（`/Prod` で終わる形）

### 404 や「招待が見つかりません」
- ゲストデータが正しく投入されているか、DynamoDB のコンソールで確認してください
- 招待コードが URL と一致しているか確認してください

---

## 用語の説明

| 用語 | 説明 |
|------|------|
| AWS | Amazon が提供するクラウドサービス |
| Lambda | サーバーを用意せずにプログラムを実行できるサービス |
| API Gateway | 外部から API を呼び出せるようにするサービス |
| DynamoDB | データを保存するデータベース |
| S3 | ファイルを保存するストレージ |
| Amplify | フロントエンドを簡単にデプロイできるサービス |
| リージョン | AWS のデータセンターの所在地（ap-northeast-1 = 東京） |

---

## 次のステップ

- カスタムドメイン（例: wedding.example.com）を使いたい場合は、Amplify の「ドメイン管理」から設定できます
- ゲストの追加・文言の変更は、DynamoDB のコンソールから直接編集することもできます
