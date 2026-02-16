const SITE_BASE_URL = 'https://www.wartimemaritime.org';
const API_BASE_URL = `${SITE_BASE_URL}/api`;

export type NewsStory = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  tags: string[] | null;
  image_url: string | null;
  video_url: string | null;
  published_at: string | null;
  category: NewsCategory | null;
};

export type NewsCategoryObject = {
  id?: number;
  name?: string | null;
  slug?: string | null;
};

export type NewsCategory = string | NewsCategoryObject;

export type NewsListMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type FetchNewsStoriesInput = {
  category?: string | null;
  page?: number;
  perPage?: number;
};

export async function fetchNewsStories(input: FetchNewsStoriesInput = {}) {
  const params = new URLSearchParams();

  if (input.category) {
    params.set('category', input.category);
  }

  if (input.page) {
    params.set('page', String(input.page));
  }

  if (input.perPage) {
    params.set('per_page', String(input.perPage));
  }

  const query = params.toString();
  const url = `${API_BASE_URL}/news${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch news (${response.status})`);
  }

  const payload = (await response.json()) as {
    data?: NewsStory[];
    meta?: {
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    };
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };

  const items = Array.isArray(payload.data) ? payload.data : [];
  const metaSource = payload.meta ?? payload;

  const meta: NewsListMeta = {
    currentPage: metaSource.current_page ?? input.page ?? 1,
    lastPage: metaSource.last_page ?? 1,
    perPage: metaSource.per_page ?? input.perPage ?? items.length,
    total: metaSource.total ?? items.length,
  };

  return { items, meta };
}

export async function fetchNewsStoryBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(slug)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch news story (${response.status})`);
  }

  const payload = (await response.json()) as { data?: NewsStory } | NewsStory;
  if ('data' in payload && payload.data) {
    return payload.data;
  }

  return payload as NewsStory;
}

export function normalizeNewsCategory(category: NewsStory['category']) {
  if (!category) {
    return { label: null, value: null };
  }

  if (typeof category === 'string') {
    const trimmed = category.trim();
    return { label: trimmed || null, value: trimmed || null };
  }

  const label = category.name?.trim() || category.slug?.trim() || null;
  const value = category.slug?.trim() || category.name?.trim() || null;

  return { label, value };
}

export function resolveNewsAssetUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return `${SITE_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}
