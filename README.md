# GAS Web Seminar System

Google Apps Script (GAS) をバックエンド、Vue 3 をフロントエンド、決済に Square API を使用した、Webセミナー予約システムです。
Vite と esbuild を使用してモダンな開発体験を実現し、GASの制限（単一ファイル構成）をクリアしています。

## 特徴 (Features)

- **セミナー一覧・予約**: 開催予定のセミナーを一覧表示し、残り枠数を確認して予約が可能。
- **排他制御 (Concurrency Control)**: `LockService` を使用し、同枠への同時申し込みによる定員オーバーを防止。
- **オンライン決済 (Square決済)**: Square API (Checkout Links) を使用したクレジットカード決済連携。
- **マイページ機能**: ログインID/PW不要。予約時に発行される「マジックリンク」で予約状況やZoom URLを確認。
- **自動メール通知**: 支払リンク通知、予約確定（Zoom URL）通知を自動送信。
- **モダンな開発環境**: TypeScript, Vue 3 (Composition API), Vite, Prettier/ESLint。

## プロジェクト構成 (Project Structure)

```plaintext
gas-web-seminar/
├── src/
│   ├── client/             # Vue 3 フロントエンド
│   │   ├── main.ts         # エントリーポイント
│   │   ├── views/          # 画面コンポーネント (SeminarList, BookingForm, MyPage)
│   │   └── api/            # google.script.run ラッパー
│   ├── server/             # GAS バックエンド
│   │   ├── main.ts         # GASエントリーポイント (doGet, doPost)
│   │   └── services/       # ビジネスロジック (SheetService, SquareService 等)
│   └── shared/             # フロント/バック共通の型定義
├── dist/                   # ビルド出力 (clasp push 対象)
├── public/                 # 静的アセット (必要に応じて)
└── appsscript.json         # GASマニフェスト設定
```

## デプロイ方法 (Deployment)

### 前提条件
- Node.js installed
- Google Account
- Square Developer Account (Sandbox環境推奨)

### 1. セットアップ
```bash
# 依存関係のインストール
npm install

# Claspログイン
npx clasp login
```

### 2. GASプロジェクトの作成（または紐付け）
```bash
# 新規作成の場合
npx clasp create --type webapp --title "GAS Web Seminar System" --rootDir ./dist

# 既存プロジェクトの場合
# .clasp.json を作成し、scriptId を設定してください
```

### 3. ビルドとデプロイ
```bash
# ビルド (Vue -> index.html, TS -> code.js) と Push
npm run deploy
```

### 4. 環境変数の設定 (Script Properties)
GASエディタの「プロジェクトの設定」>「スクリプト プロパティ」に以下を設定してください：
* `SQUARE_ACCESS_TOKEN`: Square Access Token
* `SQUARE_LOCATION_ID`: Square Location ID
* `SQUARE_ENV`: `sandbox` (本番は production)

### 5. Webアプリとして公開
GASエディタから「デプロイ」>「新しいデプロイ」を選択し、以下のように設定してデプロイします：
* 種類: ウェブアプリ
* 次のユーザーとして実行: 自分
* アクセスできるユーザー: 全員 (Anyone)

## 使い方 (Usage)

1. **セミナーデータの準備**:
   初回アクセス時、スプレッドシートに `Seminars` と `Bookings` シートが自動生成されます。
   `Seminars` シートにセミナー情報を入力してください（id, title, date, capacity, price 等）。

2. **Webhook設定**:
   Squareの決済完了を検知するため、デプロイされたWebアプリのURLを Square Developer Dashboard の Webhooks に設定してください。
   * Event: `payment.updated`

## 開発 (Development)

```bash
# 開発サーバー (フロントエンドのみ)
npm run dev
# ※ GAS関数（google.script.run）はモックが動きます
```
