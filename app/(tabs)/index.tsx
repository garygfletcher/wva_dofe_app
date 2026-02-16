import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChronicleFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { fetchSeaSkillsStatus, type SeaSkillsActivity } from '@/lib/sea-skills-status';
import { subscribeTabRefresh } from '@/lib/tab-refresh';

const introSlides = [
  {
    uri: 'https://www.wartimemaritime.org/images/youth_skills/into_carousel/2.jpg',
    alt: 'Sea Skills programme photo 1',
  },
  {
    uri: 'https://www.wartimemaritime.org/images/youth_skills/into_carousel/6.jpg',
    alt: 'Sea Skills programme photo 2',
  },
];

export default function HomeScreen() {
  const { session } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [programmeMap, setProgrammeMap] = useState<SeaSkillsActivity[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % introSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = useMemo(() => introSlides[currentSlide], [currentSlide]);

  const loadProgrammeMap = useCallback(async () => {
    if (!session?.user?.id || !session?.token) {
      setMapLoading(false);
      setMapError('Unable to load activities.');
      return;
    }

    setMapLoading(true);
    setMapError('');

    try {
      const response = await fetchSeaSkillsStatus({
        userId: session.user.id,
        token: session.token,
      });
      setProgrammeMap(response.activities);
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Unable to load activities.');
    } finally {
      setMapLoading(false);
    }
  }, [session?.token, session?.user?.id]);

  useEffect(() => {
    void loadProgrammeMap();
  }, [loadProgrammeMap]);

  useEffect(() => {
    return subscribeTabRefresh('index', () => {
      void loadProgrammeMap();
    });
  }, [loadProgrammeMap]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.paper}>
          <Text style={styles.masthead}>
            <Text style={styles.mastheadWva}>WVA </Text>
            <Text style={styles.mastheadChronicle}>Chronicle</Text>
          </Text>
          <Text style={styles.dateLine}>INTRODUCTION TO THE SEA SKILLS PROGRAMME</Text>

        <View style={styles.carouselWrap}>
          <Image source={{ uri: slide.uri }} contentFit="cover" style={styles.carouselImage} accessibilityLabel={slide.alt} />
          <View style={styles.dotRow}>
            {introSlides.map((_, index) => (
              <Pressable
                key={`dot-${index}`}
                style={[styles.dot, index === currentSlide && styles.dotActive]}
                onPress={() => setCurrentSlide(index)}
              />
            ))}
          </View>
        </View>

        <Text style={styles.headline}>Introduction to the Sea Skills programme</Text>
        <Text style={styles.subheadline}>
          {"Structured, flexible learning that fits the Duke of Edinburgh's Award Skills section."}
        </Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>WVA Maritime Heritage &amp; Sea Skills Programme</Text>
          <Text style={styles.noticeText}>{"Duke of Edinburgh's Award - Skills Section (Bronze | Silver | Gold)"}</Text>
          <Text style={styles.noticeText}>A low-cost, flexible Skills activity for young people aged 13+</Text>
        </View>

        <View style={styles.rule} />

        <Text style={styles.sectionTitle}>What is it?</Text>
        <Text style={styles.bodyText}>
          {"The WVA Maritime Heritage & Sea Skills Programme is a structured Skills activity designed to support young people completing the Skills section of the Duke of Edinburgh's Award. Delivered predominantly as an online, self-study programme, it enables participants to develop historical knowledge, research skills, digital literacy, and reflective learning through the study of Britain's wartime maritime heritage."}
        </Text>

        <Text style={styles.sectionTitle}>What participants will do</Text>
        <View style={styles.listBlock}>
          <Text style={styles.listItem}>- Wartime maritime history and heritage</Text>
          <Text style={styles.listItem}>- Naval and sea skills awareness</Text>
          <Text style={styles.listItem}>- Historical research and source evaluation</Text>
          <Text style={styles.listItem}>- Reflective learning and evidence building</Text>
        </View>
        <Text style={styles.bodyText}>
          All learning is self-paced and supported by trained assessors. Gold Award participants complete a
          substantial historical research project and written essay over a 12-month period.
        </Text>

        <Text style={styles.sectionTitle}>Award levels and duration</Text>
        <View style={styles.listBlock}>
          <Text style={styles.listItem}>- Bronze: minimum of 3 months</Text>
          <Text style={styles.listItem}>- Silver: minimum of 3 months (with a 6-month Physical section)</Text>
          <Text style={styles.listItem}>- Gold: minimum of 12 months, including a research project</Text>
        </View>
        <Text style={styles.bodyText}>
          This programme meets DofE Skills section requirements and is undertaken once only. Participants cannot
          repeat the programme for multiple Award levels.
        </Text>

        <View style={styles.rule} />

        <Text style={styles.sectionTitle}>How it is delivered</Text>
        <View style={styles.listBlock}>
          <Text style={styles.listItem}>- Predominantly online, accessible UK-wide</Text>
          <Text style={styles.listItem}>- Optional inductions or introductory sessions in schools, museums, or partner venues</Text>
          <Text style={styles.listItem}>- All face-to-face activity is fully risk assessed</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Sea Skills programme map</Text>
          <Text style={styles.panelBody}>
            Track the sequence of Sea Skills activities. Weeks with published content link straight to their Chronicle
            page so you can jump in and log your progress.
          </Text>

          {mapLoading && (
            <View style={styles.mapLoadingRow}>
              <ActivityIndicator size="small" color={ink} />
            </View>
          )}

          {!!mapError && !mapLoading && <Text style={styles.mapErrorText}>{mapError}</Text>}

          {!mapLoading &&
            !mapError &&
            programmeMap.map((item) => (
              <View key={item.activity_id} style={styles.mapRow}>
                <Text style={styles.mapWeek}>{item.week_number}</Text>
                <Text style={styles.mapTopic}>{item.title}</Text>
              </View>
            ))}
        </View>

        <View style={styles.rule} />

        <Text style={styles.sectionTitle}>Safeguarding and supervision</Text>
        <View style={styles.listBlock}>
          <Text style={styles.listItem}>- Students do not self-register</Text>
          <Text style={styles.listItem}>- All under-18s are registered by a parent or legal guardian</Text>
          <Text style={styles.listItem}>- Parents/guardians can view progress and messages</Text>
          <Text style={styles.listItem}>- All communication takes place within the WVA platform</Text>
          <Text style={styles.listItem}>- Assessment is carried out by trained, safeguarding-checked assessors</Text>
        </View>

        <Text style={styles.sectionTitle}>Cost and accessibility</Text>
        <View style={styles.listBlock}>
          <Text style={styles.listItem}>- Free to access online</Text>
          <Text style={styles.listItem}>- Optional small contribution may apply for printed materials only</Text>
          <Text style={styles.listItem}>- Designed as a low-cost Skills option</Text>
          <Text style={styles.listItem}>- Reasonable adjustments considered for participants with additional needs</Text>
        </View>

        <Text style={styles.sectionTitle}>Suitable for</Text>
        <View style={styles.listBlock}>
          <Text style={styles.listItem}>- Individual participants</Text>
          <Text style={styles.listItem}>- Schools and youth organisations</Text>
          <Text style={styles.listItem}>- Home-educated young people</Text>
        </View>

        <View style={styles.providerCard}>
          <Text style={styles.providerTitle}>Provider</Text>
          <Text style={styles.panelBody}>The Wartime Maritime Memorial Association C.I.C.</Text>
          <Text style={styles.panelBody}>Not-for-profit Approved Activity Provider (pending)</Text>
          <Text style={styles.panelBody}>https://www.wartimevessels.org</Text>
          <Text style={styles.panelBody}>dofe@wartimevessels.org</Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ink = '#2b1f12';

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#e8dbc0',
  },
  content: {
    padding: 14,
  },
  paper: {
    backgroundColor: '#f3ead6',
    padding: 16,
  },
  masthead: {
    textAlign: 'center',
    fontSize: 40,
    color: ink,
  },
  mastheadWva: {
    fontFamily: ChronicleFonts.headingBlack,
  },
  mastheadChronicle: {
    fontFamily: ChronicleFonts.blackletter,
  },
  dateLine: {
    textAlign: 'center',
    fontFamily: ChronicleFonts.heading,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
    color: ink,
    fontWeight: '700',
  },
  carouselWrap: {
    marginTop: 14,
    borderWidth: 3,
    borderColor: ink,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  carouselImage: {
    width: '100%',
    height: 240,
  },
  dotRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  headline: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 34,
    fontFamily: ChronicleFonts.headingBlack,
    color: ink,
  },
  subheadline: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6b5a46',
    fontFamily: ChronicleFonts.headingItalic,
    fontSize: 18,
  },
  noticeBox: {
    marginTop: 14,
    borderWidth: 2,
    borderColor: ink,
    padding: 12,
    backgroundColor: 'rgba(236,198,110,0.45)',
  },
  noticeText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  rule: {
    borderTopWidth: 2,
    borderTopColor: ink,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: ChronicleFonts.heading,
    color: ink,
    marginBottom: 8,
  },
  bodyText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 10,
  },
  listBlock: {
    marginBottom: 12,
    gap: 6,
  },
  listItem: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    borderWidth: 2,
    borderColor: ink,
    padding: 12,
    backgroundColor: 'rgba(243,234,214,0.6)',
  },
  panelTitle: {
    fontSize: 22,
    color: ink,
    fontFamily: ChronicleFonts.heading,
    marginBottom: 8,
  },
  panelBody: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  mapRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43,31,18,0.3)',
    paddingVertical: 8,
  },
  mapLoadingRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  mapErrorText: {
    color: '#7b1f1f',
    fontFamily: ChronicleFonts.bodySemiBold,
    paddingVertical: 8,
  },
  mapWeek: {
    width: 24,
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
  },
  mapTopic: {
    flex: 1,
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    lineHeight: 20,
  },
  panelFoot: {
    marginTop: 10,
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
  },
  providerCard: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.6)',
    padding: 12,
  },
  providerTitle: {
    fontSize: 22,
    color: ink,
    fontFamily: ChronicleFonts.heading,
    marginBottom: 8,
  },
});
