# アーキテクチャ詳細

## API 方針

バックエンド API は **Firebase Cloud Functions**（`apps/functions/src/api.ts`）に集約する。
Next.js の API Routes（`app/api/`）は使わない。

理由: Mobile アプリからも同じ API を呼ぶため。
Cloud Functions なら Web・Mobile・外部サービス（Webhook 等）全てから共通で使える。

## Firebase の使い分け

| 場面 | ファイル | SDK | 説明 |
|---|---|---|---|
| クライアント（ログイン UI 等） | `apps/web/src/lib/firebase.ts` | `firebase` | `'use client'` 必須 |
| サーバー（SSR / Server Actions） | `apps/web/src/lib/firebase-admin.ts` | `firebase-admin` | `server-only` で保護 |
| Functions | `apps/functions/src/` | `firebase-admin` | `initializeApp()` は `index.ts` で1回のみ |

## 認証フロー

```
1. /login ページ（Client Component）で Firebase Auth のログイン
2. middleware.ts でセッション Cookie をチェックしルート保護
3. Server Component では firebase-admin でトークン検証
4. クライアントでは onAuthStateChanged で認証状態を監視
```

参考実装:
- ログインページ: `apps/web/src/app/login/page.tsx`
- ミドルウェア: `apps/web/src/middleware.ts`

## データ取得パターン

Server Component で Firestore からデータを取得する（SSR）:

```typescript
// apps/web/src/app/dashboard/page.tsx
import { adminDb } from '@/lib/firebase-admin'

export default async function DashboardPage() {
  const snapshot = await adminDb.collection('users').limit(10).get()
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return <ul>{users.map(user => <li key={user.id}>{user.id}</li>)}</ul>
}
```

クライアントでリアルタイム更新が必要な場合のみ `'use client'` + Firebase クライアント SDK を使う。

## ページの基本構成

```
app/<path>/
├── page.tsx      # メインコンテンツ（Server Component 推奨）
├── loading.tsx   # Suspense 用のローディング UI
└── error.tsx     # エラーバウンダリ（'use client' 必須）
```

## 環境変数の配置

| 種類 | ファイル | 例 |
|---|---|---|
| Web クライアント用 | `.env.local`（ルート） | `NEXT_PUBLIC_FIREBASE_*` |
| Mobile 用 | `.env.local`（ルート） | `FIREBASE_*`（app.json の extra 経由） |
| サーバー専用 | `.env.local`（ルート） | `FIREBASE_SERVICE_ACCOUNT_KEY` |
| Functions 専用 | `apps/functions/.env` | `REVENUECAT_WEBHOOK_SECRET` |

`NEXT_PUBLIC_` プレフィックスはブラウザに露出する。サーバー用の値には絶対に付けない。

## 状態管理（Zustand）

グローバル状態は Zustand で管理。store は `packages/shared/src/stores/` に置き、Web・Mobile で共有する。

```typescript
import { useAuthStore } from '@geckou/shared/stores'
const { user, loading } = useAuthStore()
```

新しい store は `packages/shared/src/stores/` に作成し、`index.ts` から export する。

## Firebase Storage

ヘルパーは `packages/shared/src/storage/` に集約。

```typescript
import { uploadFile, deleteFile, getFileUrl } from '@geckou/shared/storage'
```

## プッシュ通知（FCM）

| 場面 | ファイル |
|---|---|
| Mobile受信 | `apps/mobile/src/lib/push-notifications.ts` |
| Server送信 | `apps/functions/src/lib/push-notifications.ts` |

## エラー監視（Sentry）

| 場所 | ファイル | パッケージ |
|---|---|---|
| Web | `apps/web/src/lib/sentry.ts` | `@sentry/nextjs` |
| Mobile | `apps/mobile/src/lib/sentry.ts` | `@sentry/react-native` |
| Functions | `apps/functions/src/lib/sentry.ts` | `@sentry/node` |

※ Sentry パッケージインストール後に各ファイルの `@ts-nocheck` を削除すること。

## i18n（多言語対応）

翻訳ファイルは `packages/shared/src/i18n/` に集約。Web・Mobile で共有する。

```typescript
import { getTranslation, ja, en } from '@geckou/shared/i18n'
getTranslation(ja, 'common.loading') // → '読み込み中...'
```

新しい翻訳キーを追加する場合は `ja.ts` と `en.ts` の両方に追加すること。

## 課金（RevenueCat）

| プラットフォーム | ファイル |
|---|---|
| Mobile | `apps/mobile/src/lib/revenuecat.ts` |
| Web | `apps/web/src/lib/revenuecat.ts`（`'use client'`） |
| Functions | `apps/functions/src/revenuecat-webhook.ts` |

## コンポーネントの整理方針

```
components/
├── icons/        # アイコンコンポーネント
├── ui/           # 汎用 UI（Button, Modal, Input 等）
├── auth/         # 認証関連（LoginForm, AuthGuard 等）
└── <feature>/    # 機能別（dashboard/, settings/ 等）
```

小規模なうちは `components/` 直下でよい。増えてきたら機能別に分ける。
