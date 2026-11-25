import { defineSecret } from 'firebase-functions/params'

// 秘密は関数の環境変数（apps/functions/.env）に載せず Secret Manager に置く。
// .env の値は閲覧者ロールでも Cloud Console / gcloud functions describe から読めるため
// （scripts/use-env.sh の FUNCTIONS_ENV_KEYS のコメント参照）。
// 登録: firebase functions:secrets:set <名前>
// 関数から読むには、onRequest の secrets に渡したうえで .value() を呼ぶ
export const TYPO_CHECK_API_KEY = defineSecret('TYPO_CHECK_API_KEY')
export const REVENUECAT_WEBHOOK_AUTH = defineSecret('REVENUECAT_WEBHOOK_AUTH')
