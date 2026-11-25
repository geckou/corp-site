# 確認事項キュー

> 判断が必要になったとき、**セッションを止めずにここへ積む**ためのファイル。
> 積んだ作業は保留し、別の作業へ移る（判断の基準は CLAUDE.md「自律性の境界」）。
> ユーザーはここを見て**まとめて答える**（`/questions`）。回答済みの項目は下のセクションへ移す。

積むときのルール:

- **1項目 = 1判断**。「ついでに」を混ぜない（まとめて答えられなくなる）
- **推奨案を必ず書く**。ユーザーが「それで」と一言で返せる状態にする
- **ブロック**に「これが決まらないと何が進まないか」を書く。回答の優先順位はここで決まる
- 推測で決めて実装を進めない。保留した作業は、回答が出てから着手する

---

## 未回答

<!--
以下のテンプレートで追記する。回答が済んだら「回答済み」セクションの先頭へ移す。

### Q-001 一行で書いた問い

- 発生: YYYY-MM-DD / どの作業中に出たか
- 種別: 仕様 / データモデル / セキュリティ / 依存 / UI / その他
- 状況: 何をどこまで作っていて、なぜ判断が要るのか（2〜3行）
- 選択肢:
  - A) 案（推奨）— 理由
  - B) 案 — 理由
- ブロック: この回答が出るまで着手できない作業（機能名・タスク名）
- 進めた範囲: 保留の手前までに済ませたこと（あれば）
-->

（なし）

---

## 回答済み

### Q-004 層マニフェスト（layers.json）を持つか

- 回答: 2026-09-08 / **A（作る）を採用**
- 判断の理由: 持たないと Template Sync が「採用していない層」を機械的に外せず、
  同期 PR のたびに課金層前提のドキュメント・設定を手で外すことになる。作る手間は 1 回きり
- 反映済み: Issue #33（別ブランチ・別 PR）で実施。core / firebase / functions / mobile / billing の
  5 層で `layers.json` を作り、`.env.example` と `apps/functions/.env.example` に層マーカーを入れた。
  `node scripts/check-layers.mjs` が通る状態にし、`CLAUDE.md`「プロジェクト概要」も更新した
- 補足: `billing` 層は宣言する側に倒した。RevenueCat の配線が実際にリポジトリにあるため、
  宣言しないと `scripts/sync-layers.mjs` が Template Sync のたびにそれを削除対象と見なす。
  Stripe / `@geckou/billing` は入れていない
- 補足: `scripts/test-layers.sh`（層スクリプトの回帰テスト）はテンプレート本体のリポジトリの形を
  前提にしており派生では通らないため、同期対象から外して削除した（→ geckou/project-starter#326）

### Q-004 テンプレート（親）との差分を無くすか

- 回答: 2026-11-25 / **全て親版に揃える**（Q-002 / Q-003 と、Q-001 の Node 22 固定を置き換える）
- 反映済み（テンプレート同期 PR 内）:
  - `scripts/deploy.sh` / `scripts/use-env.sh` / `.github/workflows/deploy.yml` を親版に。
    固有の除外を `.templatesyncignore` から外し、親の `.templatesyncignore` をベースに
    固有分（`architecture.md` / `workflow.md` / `ci.yml` / `.claude/launch.json`）だけ残した
  - `firestore.rules` / `storage.rules` / `tests/` / `scripts/test-rules.sh` /
    `firebase.rules-test.json` を親版に（親の deploy.yml がルールテストを必須で走らせるため）
  - Node 24: `.nvmrc`、`firebase.json` の `runtime: nodejs24`、`apps/functions` の
    `engines` / esbuild target / `@types/node`
  - `TYPO_CHECK_API_KEY` / `REVENUECAT_WEBHOOK_AUTH` を Secret Manager（`defineSecret`）へ移し、
    `.env` から外した（親の use-env.sh には固有キーを足す口が無い）。`TYPO_CHECK_API_URL` は
    コードから参照されていなかったので削除
- 挙動の変化: feat/fix 等の push で develop へ自動デプロイしなくなる（develop は `yarn deploy:develop` で手動）。
  Functions・ルールは production だけが配る（相乗り構成）ため、stg/dev のフォームも本番の `api` を呼ぶなら
  本番の `ALLOWED_ORIGINS` に stg/dev のオリジンを含める
- `.templatesyncignore` の `firestore.rules` / `storage.rules` / `tests/` は親のベースどおり除外のまま。
  中身は 37ba79b の親版で、親が変えても自動では追従しない（親のルールテストを更新したら手で取り込む）
- `/contact-sample` の専用 Basic 認証（`CONTACT_TEST_AUTH`）は親版の use-env.sh では SSR に届かず、全環境で 404 になる。
  テストページは使わないので削除する（2026-11-25 回答。hotfix の PR で削除）
- マージ前に必要な作業（人）: PR 本文を参照

### Q-002 Firestore ルールのテストを持つか（→ Q-004 で置き換え）

- 回答: 2026-09-08 / **B（`test:rules` を消して、ルールテストを持たないことを明示する）を採用**
- 判断の理由: このサイトは Firestore を実質使っていない。
  使っていないもののテストを整備するより、持たない方針を明示するほうが実態に合う
- 反映済み:
  - `package.json` の `test:rules` を削除（実在しないルールテストのファイルを指していた）
  - `CLAUDE.md`「テスト方針」の Firestore ルールの行を「テスト不要」に変更
  - `.claude/hooks/config.sh` の `HOOK_WATCH_PATHS` を、
    `firestore.rules` 変更時にエミュレーターでの手動確認を促す文言に変更
  - テンプレートのルールテスト一式（`tests/` / `scripts/test-rules.sh` /
    `firebase.rules-test.json`）は `.templatesyncignore` で同期対象外のまま
- 再考の目安: Firestore に認証付きの読み書きを実際に持たせるとき。その時点で A に切り替える

### Q-001 Node を 20 から 22 へ上げるか

- 回答: 2026-09-08 / **A（22 へ上げる）を採用**
- 判断の理由: Node 20 は 2026-04 に EOL。テンプレートも CI の実行環境も 22 で揃う。
  `@commitlint/*` を v19 に固定している理由（v20 以降が Node >=22.12 を要求する）も消える
- 反映済み: Issue #32（別ブランチ・別 PR）で実施。
  `.nvmrc` を 22 に、`firebase.json` の `runtime` を `nodejs22` に、`apps/functions` の
  `engines` / esbuild target / `@types/node` を 22 系に、`deploy.yml` の `setup-node` を
  `.nvmrc` 参照に変更。`@commitlint/*` の v19 固定（`resolutions` と `cli` のレンジ）を解除し、
  `.templatesyncignore` から `.nvmrc` の除外を削除した

### Q-003 デプロイ経路をテンプレートに寄せるか（→ Q-004 で置き換え）

- 回答: 2026-09-08 / **A（当面このまま同期対象から外しておく）を採用**
- 判断の理由: 本番デプロイ経路なので、寄せるなら develop で通してからにしたい。
  テンプレート側の実体で上書きすると 1 プロジェクト 3 サイト構成の全ターゲットへ配ってしまう
- 反映済み: `.templatesyncignore` に `.github/workflows/deploy.yml` と `scripts/deploy.sh` を
  除外として記載。理由もそこに書いた。
  テンプレート側には geckou/project-starter#323 として報告済み
  （全ターゲットへ配る問題、Cloud Build 向けの `NEXT_PUBLIC_*` 書き出し、SSR 関数の `.env` パッチ）
- 再考の目安: geckou/project-starter#323 が直ったら、同期対象へ戻せるか見直す

<!--
### Q-000 問い

- 回答: YYYY-MM-DD / ユーザーの判断
- 反映: 実装・spec.md への反映内容
-->
