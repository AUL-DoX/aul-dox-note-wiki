import noteMagazines from '../../data/note-magazines.json';

const magazineCategories = noteMagazines.magazines.map((magazine) => ({
  title: magazine.title,
  slug: magazine.key,
  description: `noteマガジン「${magazine.title}」に収録された記事。`,
}));

export const UNCATEGORIZED_SLUG = 'uncategorized';

export const categories = [
  ...magazineCategories,
  { title: '未分類', slug: UNCATEGORIZED_SLUG, description: 'マガジンに含まれていない記事（古い記事、単発の記事など）。' },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategorySlug(category: string, categorySlug?: string) {
  return categorySlug ?? categories.find((item) => item.title === category)?.slug ?? encodeURIComponent(category);
}
