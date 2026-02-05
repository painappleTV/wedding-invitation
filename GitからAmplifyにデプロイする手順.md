# Git から Amplify にデプロイする手順（初心者向け）

Git の使い方がわからない方向けに、ゼロから順番に説明します。

---

## 全体の流れ

```
1. Git をインストール
2. GitHub アカウントを作成
3. GitHub にリポジトリを作成
4. プロジェクトを GitHub にアップロード（プッシュ）
5. Amplify で GitHub と連携してデプロイ
```

---

## ステップ1: Git をインストール

1. https://git-scm.com/download/win にアクセス
2. 「64-bit Git for Windows Setup」をダウンロード
3. インストーラーを実行
   - 基本的にそのまま「Next」で進めて OK
   - 「Choosing the default editor」は「Use Visual Studio Code」または「Vim」で OK
4. インストール後、**新しい** PowerShell またはコマンドプロンプトを開く
5. 次で確認：
   ```
   git --version
   ```
   バージョンが表示されれば OK です。

---

## ステップ2: GitHub アカウントを作成

1. https://github.com にアクセス
2. 「Sign up」をクリック
3. メールアドレス、パスワード、ユーザー名を入力してアカウント作成
4. メール認証があれば完了

---

## ステップ3: GitHub にリポジトリを作成

1. GitHub にログインした状態で、右上の「+」→「New repository」をクリック
2. 次のように入力：
   - **Repository name:** `wedding-invitation`（任意の名前で OK）
   - **Description:** 空欄で OK
   - **Public** を選択
   - **「Add a README file」はチェックしない**（既にプロジェクトがあるため）
3. 「Create repository」をクリック
4. 作成後、表示されるページの URL（例: `https://github.com/あなたのユーザー名/wedding-invitation`）をメモ

---

## ステップ4: プロジェクトを GitHub にアップロード（プッシュ）

### 4-1. 初回のみ：Git のユーザー名とメールを設定

PowerShell またはコマンドプロンプトで、次を実行（1回だけ）：

```
git config --global user.name "あなたの名前"
git config --global user.email "あなたのGitHubのメールアドレス"
```

（ダブルクォート内を自分の情報に置き換えてください）

### 4-2. プロジェクトフォルダで Git を初期化

1. プロジェクトフォルダに移動：
   ```
   cd C:\Users\super\wedding-invitation
   ```

2. Git を初期化：
   ```
   git init
   ```

3. 全ファイルを追加：
   ```
   git add .
   ```

4. 最初のコミット（保存）を作成：
   ```
   git commit -m "初回コミット"
   ```

### 4-3. GitHub と接続してプッシュ

1. ブランチ名を `main` に変更（GitHub のデフォルトに合わせる）：
   ```
   git branch -M main
   ```

2. GitHub のリポジトリを「リモート」として登録：
   ```
   git remote add origin https://github.com/あなたのユーザー名/wedding-invitation.git
   ```
   （URL はステップ3で作成したリポジトリの URL に合わせてください）

3. プッシュ（アップロード）：
   ```
   git push -u origin main
   ```

4. ユーザー名とパスワードを聞かれた場合：
   - **ユーザー名:** GitHub のユーザー名
   - **パスワード:** GitHub のパスワードは使えません。**Personal Access Token** が必要です（下記参照）

### Personal Access Token の作成（パスワードの代わり）

1. GitHub で右上のアイコン → 「Settings」
2. 左メニュー最下部の「Developer settings」
3. 「Personal access tokens」→「Tokens (classic)」
4. 「Generate new token (classic)」
5. Note: `amplify-deploy` など適当な名前
6. Expiration: 90 days または No expiration
7. Scope: `repo` にチェック
8. 「Generate token」をクリック
9. 表示されたトークン（`ghp_xxxx...`）を**コピーして安全な場所に保存**
10. パスワードを聞かれたら、このトークンを貼り付けてください

---

## ステップ5: Amplify で GitHub と連携してデプロイ

1. https://console.aws.amazon.com/amplify/ にアクセス（AWS にログイン済みのこと）

2. 「新規作成」→「アプリ」→「ホストされたウェブアプリ」

3. 「GitHub」を選択し、「GitHub に接続」をクリック
   - 初回は GitHub の認証画面が表示されます。「Authorize」で許可

4. リポジトリを選択：
   - 「リポジトリを選択」で `wedding-invitation` を選ぶ
   - 「ブランチを選択」で `main` を選ぶ

5. ビルド設定を入力：
   - 「ビルド設定を編集する」をクリック
   - 次のように入力：

   | 項目 | 入力値 |
   |------|--------|
   | アプリ名 | wedding-invitation |
   | ビルドコマンド | `npm run build` |
   | 出力ディレクトリ | `dist` |
   | ベースディレクトリ | （空欄のまま） |

6. **環境変数を追加：**
   - 「高度な設定」を展開
   - 「環境変数を管理」をクリック
   - 変数名: `VITE_API_URL`
   - 値: バックエンドの API URL（例: `https://xxxx.execute-api.ap-northeast-1.amazonaws.com/Prod`）
   - 「保存」をクリック

7. 「次へ」→「保存してデプロイ」をクリック

8. デプロイが開始されます。5〜10 分ほどかかることがあります。

9. 完了すると、`https://main.xxxxx.amplifyapp.com` のような URL が表示されます。これがあなたのサイトです。

---

## 以降：コードを変更したとき

1. ファイルを編集して保存
2. プロジェクトフォルダで次を実行：
   ```
   git add .
   git commit -m "変更の説明（例: 写真を追加）"
   git push
   ```
3. Amplify が自動で検知して、再デプロイが始まります

---

## 用語の簡単な説明

| 用語 | 説明 |
|------|------|
| Git | ファイルの変更履歴を管理するツール |
| GitHub | Git のリポジトリをオンラインで保存・共有するサービス |
| リポジトリ | プロジェクトのファイルと履歴をまとめたもの |
| コミット | 変更を「保存」すること |
| プッシュ | ローカルの変更を GitHub にアップロードすること |
| プル | GitHub の変更をローカルに取り込むこと |

---

## トラブルシューティング

### 「git は認識されていません」
- Git をインストールした後、ターミナルを開き直してください

### 「Permission denied」や「Authentication failed」
- Personal Access Token を使っていますか？パスワードでは認証できません
- Token の `repo` スコープが付いているか確認してください

### 「failed to push」
- `git remote -v` でリモート URL を確認
- URL が間違っている場合: `git remote set-url origin https://github.com/ユーザー名/リポジトリ名.git`

### Amplify のビルドが失敗する
- ビルドログを確認し、エラー内容をチェック
- `VITE_API_URL` が正しく設定されているか確認
- ローカルで `npm run build` が成功するか確認
