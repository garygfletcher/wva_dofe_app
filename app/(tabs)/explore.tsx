import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChronicleFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchSeaSkillsStatus,
  type SeaSkillsActivity,
} from '@/lib/sea-skills-status';
import { subscribeTabRefresh } from '@/lib/tab-refresh';

export default function ExploreScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [activities, setActivities] = useState<SeaSkillsActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStatus = useCallback(async (isRefresh = false) => {
    if (!session?.user?.id || !session?.token) {
      setError('No active session. Please sign in again.');
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await fetchSeaSkillsStatus({
        userId: session.user.id,
        token: session.token,
      });

      setActivities(response.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lesson status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.token, session?.user?.id]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    return subscribeTabRefresh('explore', () => {
      void loadStatus(true);
    });
  }, [loadStatus]);

  const totals = useMemo(() => {
    const finished = activities.filter((a) => a.status === 'finished').length;
    const pending = activities.length - finished;
    const minutes = activities.reduce((acc, a) => acc + (a.minutes_spent ?? 0), 0);
    return { finished, pending, minutes };
  }, [activities]);

  const openActivity = (activity: SeaSkillsActivity) => {
    if (activity.code.toLowerCase() === 'rnps') {
      router.push('/(tabs)/rnps');
      return;
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadStatus(true)} />}>
        <View style={styles.paper}>
          <Text style={styles.headline}>Sea Skills Status</Text>
          <Text style={styles.subheadline}>Track your lesson progress and open available modules.</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Finished</Text>
              <Text style={styles.summaryValue}>{totals.finished}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{totals.pending}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Minutes</Text>
              <Text style={styles.summaryValue}>{totals.minutes}</Text>
            </View>
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color="#2b1f12" />
            </View>
          )}

          {!!error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={() => void loadStatus()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {!loading && !error && activities.length === 0 && (
            <Text style={styles.emptyText}>No lessons returned from the status API yet.</Text>
          )}

          {!loading && !error && activities.length > 0 && (
            <View style={styles.listWrap}>
              {activities.map((activity) => {
                const isFinished = activity.status === 'finished';
                const isRnposLesson = activity.code.toLowerCase() === 'rnps';

                return (
                  <View key={activity.activity_id} style={styles.activityCard}>
                    <View style={styles.activityTopRow}>
                      <Text style={styles.weekLabel}>Week {activity.week_number}</Text>
                      <View style={[styles.badge, isFinished ? styles.badgeFinished : styles.badgePending]}>
                        <Text style={styles.badgeText}>{isFinished ? 'Finished' : 'Pending'}</Text>
                      </View>
                    </View>

                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityMeta}>Code: {activity.code.toUpperCase()}</Text>
                    <Text style={styles.activityMeta}>Minutes spent: {activity.minutes_spent ?? 0}</Text>

                    {isRnposLesson ? (
                      <Pressable style={styles.lessonButton} onPress={() => openActivity(activity)}>
                        <Text style={styles.lessonButtonText}>Open Week 1 Lesson</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.placeholderText}>Lesson page not yet added in-app.</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    gap: 12,
  },
  headline: {
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 34,
  },
  subheadline: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.headingItalic,
    fontSize: 18,
    lineHeight: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: 92,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 28,
    marginTop: 2,
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorCard: {
    borderWidth: 2,
    borderColor: '#7b1f1f',
    backgroundColor: 'rgba(255,234,234,0.7)',
    padding: 12,
    gap: 10,
  },
  errorText: {
    color: '#7b1f1f',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 14,
  },
  retryButton: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.85)',
    borderRadius: 4,
    paddingVertical: 9,
    alignItems: 'center',
  },
  retryText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  emptyText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 15,
  },
  listWrap: {
    gap: 10,
  },
  activityCard: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.75)',
    padding: 12,
    gap: 6,
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  weekLabel: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: ink,
  },
  badgeFinished: {
    backgroundColor: 'rgba(76,175,80,0.24)',
  },
  badgePending: {
    backgroundColor: 'rgba(255,193,7,0.25)',
  },
  badgeText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 12,
  },
  activityTitle: {
    color: ink,
    fontFamily: ChronicleFonts.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  activityMeta: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 14,
  },
  lessonButton: {
    marginTop: 6,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.85)',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lessonButtonText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.7,
  },
  placeholderText: {
    marginTop: 6,
    color: '#6b5a46',
    fontFamily: ChronicleFonts.body,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
