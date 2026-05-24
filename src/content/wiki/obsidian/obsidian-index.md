---
title: "Obsidian活用メモ"
description: "Obsidianで公開用ノートと非公開ノートを分けながら、wiki素材を育てるための運用メモ"
category: "Obsidian活用"
categorySlug: "obsidian"
tags: ["Obsidian", "Markdown", "ノート管理", "公開wiki"]
date: "2026-05-23"
updated: "2026-05-23"
updateNote: "公開ノートと非公開ノートを分ける運用ルールを整理。"
draft: false
---

# Obsidian活用メモ

Obsidianで作成したMarkdownノートを、公開できる内容だけ選んでこのwikiに配置するためのメモです。

## 基本方針

- 公開するノートだけを `src/content/wiki/` に置く
- 個人情報、顧客名、契約情報、管理URLは含めない
- note本文と重複させすぎず、目次と補足に寄せる
- frontmatterを整えてカテゴリとタグで探せるようにする

## 下書き管理

まだ公開しないページはfrontmatterに `draft: true` を入れます。本番サイトの一覧と詳細ページには表示されません。
