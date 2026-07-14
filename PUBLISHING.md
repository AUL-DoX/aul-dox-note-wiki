# 公開手順書：note記事とHTML（ダッシュボード／レポート）

`ref.aul-dox.jp` に何かを公開するときの手順を、コンテンツの種類別にまとめたもの。
技術的な背景・設計判断は [README.md](./README.md) や
[handoff-dashboard-integration.md](./handoff-dashboard-integration.md) を参照。

前提：本番サイトはVercel上で常時稼働しており、`git push` した内容だけが反映される。
ローカルの `npm run dev` は公開前の確認用で、これ自体は本番に影響しない。

---

## 1. note記事を反映する

note.comに投稿した記事を、`ref.aul-dox.jp` トップの記事一覧に反映する手順。

### 一番簡単な方法

`scripts\publish.cmd` をダブルクリック（またはターミナルで実行）する。以下を自動で行う。

1. `npm run sync:note` — note.comのRSS・マガジン・ハッシュタグから新着記事を収集し、
   `data/note-links.json` 等をローカルで更新（この時点ではまだ本番に反映されない）
2. `npm run build` — ビルドエラーがないか確認
3. 変更があれば `git add` → `git commit` → `git push`（Vercelが自動ビルドし、数分後に本番反映）

実行中は「何かキーを押してください」と出るまで進行状況が表示される。**この時点で処理はすでに完了している**。
キーを押すとウィンドウが閉じるだけで、本番には影響しない（`Ctrl+C`で中断する場面とは別物）。

### 手動でやる場合

```bash
cd "C:\AUL DoX Reference"
npm run sync:note   # ①収集（ローカルのみ更新）
npm run build       # ②ビルド確認（任意）
git add data/note-links.json data/note-magazines.json data/note-hashtags.json
git commit -m "Update note links"
git push             # ③本番反映
```

### 記事とwikiページを紐付けたい場合（任意）

`sync:note`が`reports/note-link-suggestions.md`に候補を出力するので、それを見て
`src/content/wiki/*.md`の`noteArticles`に採用したいURLを手動転記する。

```md
---
title: "ページタイトル"
noteArticles:
  - title: "note記事タイトル"
    url: "https://note.com/chic_wren6567/n/xxxx"
draft: false
---
```

---

## 2. HTML（ダッシュボード／分析レポート）を公開する

`/data/` 一覧ページ（ヘッダーの「データ分析」ボタンから遷移）に、ダッシュボードと分析レポートの
両方が自動的にリストされる。**ファイルの形式によって置き場所が異なる**ので、最初に見分ける。

### 見分け方

| ファイルの先頭 | 種類 | 置き場所 |
|---|---|---|
| `<div class="aul-...">`（`<html>`タグなし） | ダッシュボード（スコープ付きフラグメント） | `src/dashboards/` |
| `<!doctype html>` または `<html` | 分析レポート（完結した1ページ） | `src/reports/` |

### 2-A. ダッシュボード（7Pipsパイプライン出力）

`C:\AUL 7Pips-welfare`（後継：`C:\AUL 7Pips-welfare REF`）が生成する自己完結HTML。
クラス名でスコープされているため、サイト共通のヘッダー・フッターの中に埋め込んで表示する。

1. `06_writer/{prefix}_report.html`（2026-07-11以降はサマリー統合済み。旧プロジェクトは
   `{prefix}_wordpress.html`）を `src/dashboards/` にコピー
2. わかりやすいスラッグ名にリネーム（例: `kaigo-keiei-chosa-22.html`）
3. `npm run dev` で `http://localhost:4321/data/<スラッグ>/` を確認
4. `git add src/dashboards/ src/pages/data/` → `git commit` → `git push`

注意：同一ページに複数ダッシュボードを並べるとID・クラス名が衝突する（現状1ページ1ダッシュボード前提）。

### 2-B. 分析レポート（完結した1ページHTML）

Codex・Claude等で生成する「Deep Research」系レポートのように、`<html>`から始まる独立ページ。
グローバルなCSSセレクタ（`body`、`h1`等）を使っているため、サイト共通レイアウトには埋め込まず、
**生ページとしてそのまま出力**する（ビルド時に`<body>`直後へ戻りリンクだけ自動挿入、元ファイルは無編集）。

1. 生成されたHTMLをそのまま `src/reports/` にコピー
2. わかりやすいスラッグ名にリネーム（例: `shogaisha-koyo-gap.html`）
3. `npm run dev` で `http://localhost:4321/reports/<スラッグ>/` を確認
4. `git add src/reports/ src/pages/reports/` → `git commit` → `git push`

### 共通の注意点

- **`src/dashboards/` か `src/reports/` のどちらかに置かないと、ページは生成されても
  `/data/`一覧にもヘッダーのボタンからも辿り着けない「孤立ページ」になる。**
  ファイルを置いたら、必ず `/data/` の一覧に表示されることを確認してから公開する
- `.gitignore`の`/reports/`はトップレベルの`reports/`（note-link-suggestions.md用）だけを除外する設定。
  `src/reports/`・`src/pages/reports/`とは別物なので、`.gitignore`を触るときは先頭の`/`を外さないこと
- Vercelのビルドには数分かかる。pushしてすぐは反映されていなくても、時間を置いてから
  強制リロード（`Ctrl+Shift+R`）で確認する
