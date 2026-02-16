import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChronicleFonts } from '@/constants/theme';
import { fetchNewsStoryBySlug, normalizeNewsCategory, resolveNewsAssetUrl, type NewsStory } from '@/lib/news-stories';

export default function NewsStoryScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [story, setStory] = useState<NewsStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!slug) {
        setError('Missing story slug.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetchNewsStoryBySlug(slug);
        setStory(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load story.');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [slug]);

  const imageUrl = story ? resolveNewsAssetUrl(story.image_url) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.paper}>
          {loading && (
            <View style={styles.centerRow}>
              <ActivityIndicator size="large" color="#2b1f12" />
            </View>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && story && (
            <>
              {!!imageUrl && <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />}
              <Text style={styles.kicker}>{normalizeNewsCategory(story.category).label ?? 'News story'}</Text>
              <Text style={styles.title}>{story.title}</Text>
              <Text style={styles.meta}>{formatDate(story.published_at)}</Text>

              {!!story.excerpt && <Text style={styles.excerpt}>{story.excerpt}</Text>}
              {!!story.body && <Text style={styles.body}>{story.body}</Text>}
            </>
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
  centerRow: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  errorText: {
    color: '#8b0000',
    fontFamily: ChronicleFonts.bodySemiBold,
  },
  kicker: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.bodySemiBold,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderWidth: 1,
    borderColor: ink,
    backgroundColor: '#d9c9a8',
  },
  title: {
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 34,
    lineHeight: 40,
  },
  meta: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 13,
  },
  excerpt: {
    color: ink,
    fontFamily: ChronicleFonts.headingItalic,
    fontSize: 18,
    lineHeight: 25,
  },
  body: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 16,
    lineHeight: 25,
  },
});
