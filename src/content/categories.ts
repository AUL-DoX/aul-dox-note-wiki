// Referenceのカテゴリ = Dataのタブ（data-categories.json）と同じ分類。
// 分析記事の frontmatter `category` にタブのslug（kaigo / shogai / keiei）を書く。
import { dataCategories } from '../data-categories';

export const categories = dataCategories.map((category) => ({
  title: category.label,
  slug: category.slug,
  description: `${category.label}のデータ分析結果を読み解く記事。`,
}));

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategorySlug(category: string, categorySlug?: string) {
  return categorySlug ?? categories.find((item) => item.title === category)?.slug ?? encodeURIComponent(category);
}
