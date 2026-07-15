// 分析レポート（src/reports/配下）のカテゴリ定義。
// フォルダ名（ローマ字スラッグ）と画面表示名（日本語）を紐付ける。
// 新しい親カテゴリを増やすときは、ここに1行足してから src/reports/<slug>/ フォルダを作る。

export interface ReportCategory {
  slug: string;
  label: string;
}

export const reportCategories: ReportCategory[] = [
  { slug: 'kaigo', label: '介護分野' },
  { slug: 'shogai', label: '障がい分野' },
];

export function getReportCategoryLabel(slug: string): string {
  return reportCategories.find((c) => c.slug === slug)?.label ?? slug;
}

// "2026-07" -> "2026年7月"。想定外の形式はそのまま返す。
export function formatYearMonth(ym: string): string {
  const match = ym.match(/^(\d{4})-(\d{2})$/);
  if (!match) return ym;
  return `${match[1]}年${Number(match[2])}月`;
}
