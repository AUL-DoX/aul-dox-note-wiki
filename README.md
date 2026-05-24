# AUL DoX note-wiki

Obsidianで管理しているMarkdownノートをもとに、Vercelで公開するための静的なnote-wikiサイトです。

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Content

公開記事は `src/content/wiki/` にMarkdownで追加します。

```md
---
title: "ページタイトル"
description: "ページ説明"
category: "福祉DX"
categorySlug: "welfare-dx"
tags: ["福祉DX"]
noteUrl: "https://note.com/chic_wren6567"
noteArticles:
  - title: "note記事タイトル"
    url: "https://note.com/chic_wren6567/n/xxxx"
date: "2026-05-23"
updated: "2026-05-23"
updateNote: "このページで何を追加・修正したかを短く書く"
draft: false
---

本文
```

`draft: true` の記事は一覧と詳細ページに表示されません。

## note Links

note記事URL一覧を更新します。

```bash
npm run sync:note
```

`sync:note` はRSSの新着・更新記事を `data/note-links.json` にマージし、wikiページごとの候補レポートを再生成します。

個別に実行する場合:

```bash
npm run fetch:note
npm run fetch:note:google
npm run suggest:note-links
```

ブラウザで開いたGoogle検索結果をHTML保存した場合は、そのHTMLも取り込めます。

```bash
npm run fetch:note:google -- path/to/google-results.html
```

生成物:

- `data/note-links.json`: RSSとGoogle site searchから取得した記事一覧
- `reports/note-link-suggestions.md`: wikiページごとのリンク候補

候補を確認して、採用するURLだけ各Markdownの `noteArticles` に転記します。
サイト上では `/notes/` でRSS取得済みの記事一覧と紐づけ状態を確認できます。

通常運用:

1. `npm run sync:note`
2. `reports/note-link-suggestions.md` を確認
3. 採用する記事だけMarkdownの `noteArticles` に転記
4. `npm run build`
5. GitHubへpushしてVercelへ反映

## Do Not Publish

- 顧客名
- 個人情報
- メールアドレス
- 契約情報
- 未公開の業務資料
- APIキー
- Apps Scriptの機密URL
- Googleフォームの管理URL
- 個別法人の内部情報
