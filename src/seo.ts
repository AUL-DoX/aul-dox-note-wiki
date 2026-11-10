// 構造化データ（JSON-LD）の部品。WikiLayout の jsonLd に渡す。
const SITE_URL = 'https://aul-dox.jp';

export const abs = (path: string) => new URL(path, SITE_URL).toString();

export const publisher = {
  '@type': 'Organization',
  name: 'AUL DoX',
  url: abs('/'),
  logo: { '@type': 'ImageObject', url: abs('/favicon.png') },
};

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AUL DoX',
  url: abs('/'),
  inLanguage: 'ja',
  publisher,
};

const iso = (value: Date | string) => new Date(value).toISOString().slice(0, 10);

export function articleLd(opts: { title: string; description: string; path: string; published: Date | string; modified?: Date | string; keywords?: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    inLanguage: 'ja',
    datePublished: iso(opts.published),
    dateModified: iso(opts.modified ?? opts.published),
    mainEntityOfPage: abs(opts.path),
    image: abs('/og-image.png'),
    keywords: opts.keywords?.join(','),
    author: publisher,
    publisher,
  };
}

export function webPageLd(opts: { title: string; description: string; path: string; modified?: string | null }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    description: opts.description,
    inLanguage: 'ja',
    url: abs(opts.path),
    ...(opts.modified ? { dateModified: opts.modified } : {}),
    isPartOf: { '@type': 'WebSite', name: 'AUL DoX', url: abs('/') },
    publisher,
  };
}
