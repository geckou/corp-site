#!/bin/bash
set -e

# 使い方: bash scripts/deploy.sh [develop|staging|production] [--only functions|hosting]

cd "$(dirname "$0")/.."

ENV=${1:-develop}
DEPLOY_ONLY=""

if [ "$2" = "--only" ] && [ -n "$3" ]; then
  DEPLOY_ONLY="$3"
fi

# 環境 → Hosting サイト ID
SITE_MAP_production="geckou-llc"
SITE_MAP_staging="stg-geckou-llc"
SITE_MAP_develop="dev-geckou-llc"
SITE_VAR="SITE_MAP_${ENV}"
SITE_NAME="${!SITE_VAR}"

if [ -z "$SITE_NAME" ]; then
  echo "[error] 未知の環境: ${ENV}（develop|staging|production のいずれか）"
  exit 1
fi

# production は production ブランチからのみデプロイ可（FORCE_DEPLOY=1 で回避可能）
if [ "$ENV" = "production" ] && [ "${FORCE_DEPLOY:-0}" != "1" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ] && [ "$CURRENT_BRANCH" != "production" ]; then
    echo "[error] production へのデプロイは production ブランチからのみ実行できます（現在: ${CURRENT_BRANCH}）"
    echo "  → どうしても必要な場合は FORCE_DEPLOY=1 を付けて実行してください"
    exit 1
  fi
fi

echo "=== デプロイ: ${ENV} 環境 ==="
echo ""

# 環境の切り替え
bash scripts/use-env.sh "${ENV}"
echo ""

# デプロイ前チェック（CI 環境では check ジョブで済んでいるのでスキップ）
if [ "${CI:-}" != "true" ]; then
  echo "[check] 型チェック..."
  yarn type-check

  echo "[check] Lint..."
  yarn lint

  echo "[check] テスト..."
  yarn test

  echo "[check] ビルド..."
  yarn build
else
  echo "[skip] CI 環境のためチェックをスキップ（check ジョブで実行済み）"
  echo "[build] ビルド..."
  yarn build
fi

echo ""

# workspace 依存を一時削除（Cloud Build が npm registry から取得しようとするのを防ぐ）
BACKUP_DIR=$(mktemp -d)
cp apps/web/package.json "${BACKUP_DIR}/web-package.json"
cp apps/functions/package.json "${BACKUP_DIR}/functions-package.json"

cleanup_workspace_deps() {
  echo "[cleanup] workspace 依存を復元中..."
  cp "${BACKUP_DIR}/web-package.json" apps/web/package.json
  cp "${BACKUP_DIR}/functions-package.json" apps/functions/package.json
  rm -rf "${BACKUP_DIR}"
}
trap cleanup_workspace_deps EXIT

echo "[predeploy] workspace 依存を一時削除..."
node -e "
  const fs = require('fs');
  ['apps/web/package.json', 'apps/functions/package.json'].forEach(p => {
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const dep of Object.keys(pkg.dependencies || {})) {
      if (dep.startsWith('@geckou/')) delete pkg.dependencies[dep];
    }
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
  });
"

echo "[deploy] Firebase にデプロイ中..."

# framework-backed hosting (firebase.json の frameworksBackend) に必要
firebase experiments:enable webframeworks

# 対象環境の Hosting サイトのみデプロイする。
# frameworksBackend 構成では全ターゲットが同一 source を共有するため、
# 全ターゲットをループすると意図しない環境にも本番ビルドが配られる。
# ENV に対応するサイト ID を直指定して 1 サイトのみデプロイする。
# （複数の framework-backed ターゲットを 1 回の deploy に同梱すると
#   Next アダプタが next build で停止するため、いずれにせよ単一指定が安全）
deploy_hosting_per_target() {
  echo "[deploy] hosting:${SITE_NAME}..."
  firebase deploy --only "hosting:${SITE_NAME}" --force
}

case "$DEPLOY_ONLY" in
  hosting)
    deploy_hosting_per_target
    ;;
  "")
    # 全体デプロイ: hosting 以外を先に、hosting はターゲットごとに
    firebase deploy --only functions,firestore --force
    deploy_hosting_per_target
    ;;
  *)
    firebase deploy --only "$DEPLOY_ONLY" --force
    ;;
esac

# SSR 関数の .env にアプリ環境変数をマージ（frameworksBackend が自動生成する .env に不足分を追記）
SSR_ENV=".firebase/${SITE_NAME}/functions/.env"

if [ -f "$SSR_ENV" ] && [ -f ".env.${ENV}" ]; then
  PATCHED=false
  while IFS= read -r line; do
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    KEY="${line%%=*}"
    [[ "$KEY" == NEXT_PUBLIC_* ]] && continue
    grep -q "^${KEY}=" "$SSR_ENV" && continue
    echo "$line" >> "$SSR_ENV"
    echo "  [patch] + ${KEY}"
    PATCHED=true
  done < ".env.${ENV}"

  if [ "$PATCHED" = true ]; then
    echo "[patch] SSR 関数の環境変数をパッチしました。再デプロイ中..."
    deploy_hosting_per_target
  fi
fi

echo ""
echo "=== デプロイ完了: ${ENV} ==="
