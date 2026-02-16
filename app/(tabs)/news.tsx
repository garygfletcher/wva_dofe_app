import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChronicleFonts } from '@/constants/theme';
import { fetchNewsStories, normalizeNewsCategory, resolveNewsAssetUrl, type NewsStory } from '@/lib/news-stories';
import { subscribeTabRefresh } from '@/lib/tab-refresh';

const PAGE_SIZE = 50;
const TOP_FILTERS = [
  { label: 'For Sale', value: 'tag:for sale' },
  { label: 'Loss Report', value: 'tag:loss report' },
];

export default function NewsTabScreen() {
  const router = useRouter();

  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const loadFirstPage = useCallback(
    async (filter?: string | null, asRefresh = false) => {
      if (asRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const selectedFilter = filter ?? activeFilter;
      try {
        const { items, meta } = await fetchNewsStories({
          category: getCategoryFilterValue(selectedFilter),
          page: 1,
          perPage: PAGE_SIZE,
        });

        setStories(items);
        setPage(meta.currentPage);
        setLastPage(meta.lastPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load news stories.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    void loadFirstPage(activeFilter);
  }, [activeFilter, loadFirstPage]);

  useEffect(() => {
    return subscribeTabRefresh('news', () => {
      setActiveFilter(null);
      void loadFirstPage(null, true);
    });
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (loadingMore || loading || refreshing || page >= lastPage) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const { items, meta } = await fetchNewsStories({
        category: getCategoryFilterValue(activeFilter),
        page: nextPage,
        perPage: PAGE_SIZE,
      });

      setStories((prev) => [...prev, ...items]);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load more stories.');
    } finally {
      setLoadingMore(false);
    }
  };

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const items: { label: string; value: string }[] = [];

    for (const story of stories) {
      const normalized = normalizeNewsCategory(story.category);
      if (!normalized.label || !normalized.value || seen.has(normalized.value)) {
        continue;
      }

      seen.add(normalized.value);
      items.push({ label: normalized.label, value: normalized.value });
    }

    return items;
  }, [stories]);

  const filterChips = useMemo(() => {
    const seen = new Set<string>();
    const chips: { label: string; value: string | null }[] = [{ label: 'All', value: null }];

    for (const topFilter of TOP_FILTERS) {
      if (seen.has(topFilter.value)) {
        continue;
      }
      seen.add(topFilter.value);
      chips.push({ label: topFilter.label, value: topFilter.value });
    }

    for (const category of categories) {
      const value = `category:${category.value}`;
      if (seen.has(value)) {
        continue;
      }
      seen.add(value);
      chips.push({ label: category.label, value });
    }

    return chips;
  }, [categories]);

  const activeFilterLabel = useMemo(
    () => filterChips.find((chip) => chip.value === activeFilter)?.label ?? null,
    [activeFilter, filterChips]
  );

  const visibleStories = useMemo(() => {
    const tagFilter = getTagFilterValue(activeFilter);
    if (!tagFilter) {
      return stories;
    }

    return stories.filter((story) =>
      Array.isArray(story.tags) &&
      story.tags.some((tag) => normalizeTagValue(tag) === normalizeTagValue(tagFilter))
    );
  }, [activeFilter, stories]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadFirstPage(activeFilter, true)} />}>
        <View style={styles.paper}>
          <Text style={styles.headline}>News Stories</Text>

          {filterChips.length > 0 && (
            <View style={styles.categoryRow}>
              {filterChips.map((category) => (
                <Pressable
                  key={category.value ?? 'all'}
                  style={[styles.categoryChip, activeFilter === category.value && styles.categoryChipActive]}
                  onPress={() => setActiveFilter(category.value)}>
                  <Text style={styles.categoryChipText}>{category.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {!!activeFilterLabel && <Text style={styles.activeFilter}>Filtering: {activeFilterLabel}</Text>}

          {loading && (
            <View style={styles.centerRow}>
              <ActivityIndicator size="large" color="#2b1f12" />
            </View>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && visibleStories.length === 0 && (
            <Text style={styles.emptyText}>No approved stories found for this filter.</Text>
          )}

          {!loading && !error && visibleStories.length > 0 && (
            <View style={styles.listWrap}>
              {visibleStories.map((story) => {
                const storyImageUrl = resolveNewsAssetUrl(story.image_url);

                return (
                  <Pressable
                    key={story.id}
                    style={styles.storyCard}
                    onPress={() => router.push((`/news/${story.slug}`) as never)}>
                    {!!storyImageUrl && (
                      <Image source={{ uri: storyImageUrl }} style={styles.storyImage} resizeMode="cover" />
                    )}
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    {!!story.excerpt && <Text style={styles.storyExcerpt}>{story.excerpt}</Text>}
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{normalizeNewsCategory(story.category).label ?? 'uncategorized'}</Text>
                      <Text style={styles.metaText}>{formatDate(story.published_at)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {!loading && !error && page < lastPage && (
            <Pressable style={styles.loadMoreButton} onPress={() => void loadMore()}>
              <Text style={styles.loadMoreText}>{loadingMore ? 'Loading...' : 'Load more stories'}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function getCategoryFilterValue(filter: string | null | undefined) {
  if (!filter || !filter.startsWith('category:')) {
    return null;
  }
  const value = filter.replace('category:', '').trim();
  return value || null;
}

function getTagFilterValue(filter: string | null | undefined) {
  if (!filter || !filter.startsWith('tag:')) {
    return null;
  }
  const value = filter.replace('tag:', '').trim();
  return value || null;
}

function normalizeTagValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const ink = '#2b1f12';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8dbc0',
  },
  content: {
    padding: 14,
  },
  paper: {
    backgroundColor: '#f3ead6',
    padding: 14,
    gap: 10,
  },
  headline: {
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 34,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: ink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(243,234,214,0.9)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(236,198,110,0.85)',
  },
  categoryChipText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  activeFilter: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 13,
  },
  centerRow: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  errorText: {
    color: '#8b0000',
    fontFamily: ChronicleFonts.bodySemiBold,
  },
  emptyText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
  },
  listWrap: {
    gap: 10,
  },
  storyCard: {
    borderWidth: 1,
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.75)',
    padding: 12,
    gap: 6,
  },
  storyImage: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderColor: ink,
    backgroundColor: '#d9c9a8',
  },
  storyTitle: {
    color: ink,
    fontFamily: ChronicleFonts.heading,
    fontSize: 23,
    lineHeight: 28,
  },
  storyExcerpt: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  loadMoreButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.85)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loadMoreText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 12,
  },
});
