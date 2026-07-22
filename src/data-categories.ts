// /dataページのタブ定義。フォルダ名（ローマ字スラッグ）と画面表示名（日本語）を紐付ける。
// 実データは data-categories.json（唯一の情報源）。scripts/admin-server.mjs も同じJSONを読む。
// 新しい分野を増やすときは data-categories.json に1行足してから
// src/dashboards/<slug>/ と src/Deep-Research/<slug>/ にフォルダを作る。

import raw from './data-categories.json';

export interface DataCategory {
  slug: string;
  label: string;
}

export const dataCategories: DataCategory[] = raw.dataCategories;
export const deepResearchTags: DataCategory[] = raw.deepResearchTags;

export function getCategoryLabel(slug: string): string {
  return dataCategories.find((c) => c.slug === slug)?.label ?? slug;
}

// "2026-07" -> "2026年7月"。想定外の形式はそのまま返す。
export function formatYearMonth(ym: string): string {
  const match = ym.match(/^(\d{4})-(\d{2})$/);
  if (!match) return ym;
  return `${match[1]}年${Number(match[2])}月`;
}
