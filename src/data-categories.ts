// /dataページのタブ定義。フォルダ名（ローマ字スラッグ）と画面表示名（日本語）を紐付ける。
// 新しい分野を増やすときは、ここに1行足してから
// src/dashboards/<slug>/ と src/Deep-Research/<slug>/ にフォルダを作る。

export interface DataCategory {
  slug: string;
  label: string;
}

// dashboards（7Pips）のカテゴリタブ。
export const dataCategories: DataCategory[] = [
  { slug: 'kaigo', label: '介護分野' },
  { slug: 'shogai', label: '障がい分野' },
  { slug: 'keiei', label: '経営の見える化' },
];

// Deep-Research（Codex等）配下のサブフォルダ名 -> 表示タグ（一覧内のラベルとして使う）。
export const deepResearchTags: DataCategory[] = [
  { slug: 'kaigo', label: '介護' },
  { slug: 'shogai', label: '障がい' },
  { slug: 'keiei', label: '経営' },
];

export function getCategoryLabel(slug: string): string {
  return dataCategories.find((c) => c.slug === slug)?.label ?? slug;
}

// "2026-07" -> "2026年7月"。想定外の形式はそのまま返す。
export function formatYearMonth(ym: string): string {
  const match = ym.match(/^(\d{4})-(\d{2})$/);
  if (!match) return ym;
  return `${match[1]}年${Number(match[2])}月`;
}
