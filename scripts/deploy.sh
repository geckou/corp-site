#!/bin/bash
set -e

# 使い方: bash scripts/deploy.sh [develop|staging|production] [--only functions|hosting]

ENV=${1:-develop}
ONLY_FLAG=""

if [ "$2" = "--only" ] && [ -n "$3" ]; then
  ONLY_FLAG="$3"
fi

echo "=== デプロイ: ${ENV} 環境 ==="
echo ""

# 環境の切り替え
bash scripts/use-env.sh "${ENV}"
echo ""

# デプロイ前チェック
echo "[check] 型チェック..."
yarn type-check

echo "[check] Lint..."
yarn lint

echo "[check] テスト..."
yarn test

echo "[check] ビルド..."
yarn build

echo ""
echo "[deploy] Firebase にデプロイ中..."

if [ -n "$ONLY_FLAG" ]; then
  if [ "$ONLY_FLAG" = "hosting" ]; then
    firebase deploy --only "hosting:${ENV}" --force
  else
    firebase deploy --only "${ONLY_FLAG}" --force
  fi
else
  firebase deploy --only "hosting:${ENV},functions" --force
fi

# SSR 関数の .env にアプリ環境変数をマージ（frameworksBackend が自動生成する .env に不足分を追記）
SITE_MAP_production="geckou-llc"
SITE_MAP_staging="stg-geckou-llc"
SITE_MAP_develop="dev-geckou-llc"
SITE_VAR="SITE_MAP_${ENV}"
SITE_NAME="${!SITE_VAR}"
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
    firebase deploy --only "hosting:${ENV}" --force
  fi
fi

echo ""
echo "=== デプロイ完了: ${ENV} ==="
