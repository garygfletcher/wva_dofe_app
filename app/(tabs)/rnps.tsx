import ExpoCheckbox from 'expo-checkbox';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChronicleFonts } from '@/constants/theme';

type QuizQuestion = {
  id: string;
  prompt: string;
  options: { key: string; label: string }[];
};

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: '1. Who supported the creation of the RNPS silver badge that recognised six months of hazardous patrol work?',
    options: [
      { key: 'A', label: 'King George VI alone' },
      { key: 'B', label: 'Winston Churchill as First Lord of the Admiralty' },
      { key: 'C', label: 'The Royal Air Force Board' },
      { key: 'D', label: 'Civilian lighthouse keepers' },
    ],
  },
  {
    id: 'q2',
    prompt: '2. What does RNPS stand for?',
    options: [
      { key: 'A', label: 'Royal Naval Protection Squadron' },
      { key: 'B', label: 'Royal Navy Patrol Service' },
      { key: 'C', label: 'Royal Northern Patrol Ships' },
      { key: 'D', label: 'Royal Naval Patrol Squadron' },
    ],
  },
  {
    id: 'q3',
    prompt: '3. About how many ships and boats did the RNPS operate during the Second World War?',
    options: [
      { key: 'A', label: 'About 600' },
      { key: 'B', label: 'About 1,500' },
      { key: 'C', label: 'About 6,000' },
      { key: 'D', label: 'About 20,000' },
    ],
  },
  {
    id: 'q4',
    prompt: '4. Which of these types of boats were used by the RNPS?',
    options: [
      { key: 'A', label: 'Submarines only' },
      { key: 'B', label: 'Aircraft carriers' },
      { key: 'C', label: 'Fishing trawlers and drifters' },
      { key: 'D', label: 'Cruise ships' },
    ],
  },
  {
    id: 'q5',
    prompt: '5. What was the main job of the Royal Navy Patrol Service?',
    options: [
      { key: 'A', label: 'Fighting large naval battles' },
      { key: 'B', label: 'Transporting aircraft' },
      { key: 'C', label: 'Keeping the seas safe' },
      { key: 'D', label: 'Exploring new sea routes' },
    ],
  },
  {
    id: 'q6',
    prompt: '6. Why was minesweeping so dangerous?',
    options: [
      { key: 'A', label: 'Mines were hard to see and could explode without warning' },
      { key: 'B', label: 'The ships were very fast' },
      { key: 'C', label: 'The sailors had no training' },
      { key: 'D', label: 'Mines could only be cleared at night' },
    ],
  },
  {
    id: 'q7',
    prompt: '7. Which of these operations did the RNPS support?',
    options: [
      { key: 'A', label: 'The Battle of Britain' },
      { key: 'B', label: 'Dunkirk' },
      { key: 'C', label: 'Pearl Harbour' },
      { key: 'D', label: 'El Alamein' },
    ],
  },
  {
    id: 'q8',
    prompt: '8. Where was the RNPS based?',
    options: [
      { key: 'A', label: 'Portsmouth' },
      { key: 'B', label: 'Plymouth' },
      { key: 'C', label: "Lowestoft at HMS Sparrow's Nest" },
      { key: 'D', label: 'Scapa Flow' },
    ],
  },
  {
    id: 'q9',
    prompt: "9. Why were some RNPS crews called 'Churchill's Pirates'?",
    options: [
      { key: 'A', label: 'They stole enemy ships' },
      { key: 'B', label: 'They wore pirate flags' },
      { key: 'C', label: 'They carried out bold missions near enemy coasts' },
      { key: 'D', label: 'They sailed without orders' },
    ],
  },
  {
    id: 'q10',
    prompt: "10. Why was the RNPS nicknamed 'Harry Tate's Navy'?",
    options: [
      { key: 'A', label: 'It was badly organised' },
      { key: 'B', label: 'It used only old ships' },
      { key: 'C', label: 'It had a mixed and unusual fleet of boats' },
      { key: 'D', label: 'It was based in London' },
    ],
  },
  {
    id: 'q11',
    prompt: '11. Why were fishermen well suited to RNPS service?',
    options: [
      { key: 'A', label: 'They were used to sailing large warships' },
      { key: 'B', label: 'They already knew the sea and tough conditions' },
      { key: 'C', label: 'They had flown aircraft before' },
      { key: 'D', label: 'They had never worked at sea' },
    ],
  },
  {
    id: 'q12',
    prompt: '12. Which officer from the RNPS received the Victoria Cross during the Norwegian campaign?',
    options: [
      { key: 'A', label: 'Admiral Bertram Ramsay' },
      { key: 'B', label: 'Lieut. Richard Been Stannard' },
      { key: 'C', label: 'Commodore Henry Harwood' },
      { key: 'D', label: 'Captain Edward Kennedy' },
    ],
  },
];

const answers: Record<string, string> = {
  q1: 'B',
  q2: 'B',
  q3: 'C',
  q4: 'C',
  q5: 'C',
  q6: 'A',
  q7: 'B',
  q8: 'C',
  q9: 'C',
  q10: 'C',
  q11: 'B',
  q12: 'B',
};

const upcomingDates = [
  {
    title: 'Battle of the Atlantic (September 1939 - May 1945)',
    detail:
      "Trace the longest continuous naval campaign of the war, following convoy routes, escort screens and patrol zones that protected Britain's survival against U-boats and surface raiders.",
  },
  {
    title: 'Operation Dynamo (26 May - 4 June 1940)',
    detail:
      "Plot the Royal Navy and Royal Naval Patrol Service escort lanes, mineswept channels and small-craft routes that enabled the evacuation of over 338,000 Allied troops from Dunkirk's beaches and the Mole.",
  },
  {
    title: 'Attack on Taranto (11-12 November 1940)',
    detail:
      'Explore the pioneering Royal Navy carrier strike in which aircraft from HMS Illustrious crippled the Italian battle fleet at anchor, transforming naval warfare.',
  },
  {
    title: 'Arctic Convoys to Russia (August 1941 - May 1945)',
    detail:
      'Track the perilous northern routes to the Soviet Union, highlighting escort operations and minesweeping under extreme weather and constant enemy threat.',
  },
  {
    title: 'D-Day - Normandy Landings (6 June 1944)',
    detail:
      'Map the pre-assault minesweeping, navigation marking and close-in patrol work that allowed thousands of Allied ships and landing craft to cross the Channel safely.',
  },
  {
    title: 'Operation Neptune (June 1944)',
    detail:
      'Rehearse the sustained coastal sweeps, harbour clearance and escort duties that protected the seaborne build-up and resupply of the Normandy bridgehead.',
  },
];

const assessItems = [
  'Shown understanding of the role and purpose of the Royal Navy Patrol Service',
  'Identified a plausible RNPS task (e.g. patrol, minesweeping, escort duty)',
  'Described realistic conditions or challenges faced at sea',
  'Explained at least one relevant skill, habit or value used by RNPS crews (teamwork, vigilance, seamanship, resilience)',
  'Recorded clear signals, hazards, and habits in the escort debrief',
  "Applied learning in the participant's own words, rather than copying text",
  'Produced work that reflects appropriate effort and reflection for the time claimed',
];

export default function ExploreScreen() {
  const videoViewRef = useRef<VideoView>(null);
  const videoPlayer = useVideoPlayer(
    {
      uri: 'https://www.wartimemaritime.org/images/youth_skills/rnps.mp4',
    },
    (player) => {
      player.loop = false;
    }
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [missionLog, setMissionLog] = useState('');
  const [minutesSpent, setMinutesSpent] = useState('');
  const [status, setStatus] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalQuestions = quizQuestions.length;

  const score = useMemo(
    () =>
      quizQuestions.reduce(
        (count, question) => (selectedAnswers[question.id] === answers[question.id] ? count + 1 : count),
        0
      ),
    [selectedAnswers]
  );

  const submitQuiz = () => {
    setSubmitted(true);
    if (score === totalQuestions) {
      setShowSuccessModal(true);
      setStatus('Activity marked complete.');
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setShowSuccessModal(false);
  };

  const saveLog = () => {
    if (!missionLog.trim()) {
      setStatus('Please enter your mission report before saving.');
      return;
    }
    setStatus('Mission report saved locally.');
  };

  const sendProgressSignal = () => {
    const minutes = Number.parseInt(minutesSpent, 10);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setStatus('Please enter the minutes spent as a positive number.');
      return;
    }
    setStatus('Time logged locally and progress signal sent.');
  };

  const markComplete = () => {
    setStatus('Activity marked complete.');
  };

  const playVideoFullscreen = async () => {
    if (!videoViewRef.current) return;

    try {
      videoPlayer.play();
      await videoViewRef.current.enterFullscreen();
    } catch {
      // Ignore player errors and keep the lesson usable.
    }
  };

  const scoreText = `Score: ${score} / ${totalQuestions}`;

  return (
    <>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.paper}>
          <Text style={styles.masthead}>
            <Text style={styles.mastheadWva}>WVA </Text>
            <Text style={styles.mastheadChronicle}>Chronicle</Text>
          </Text>
          <View style={styles.headerRow}>
            <Image source={{ uri: 'https://www.wartimemaritime.org/images/youth_skills/rnps_logo.png' }} contentFit="contain" style={styles.crest} />
            <Text style={styles.headline}>Week 1 - The Royal Navy Patrol Service</Text>
          </View>
          <Text style={styles.subheadline}>
            Coastal defence, convoy guardianship, and the small ships that made giant rescues possible.
          </Text>

          <View style={styles.ruleThick} />

          <Text style={styles.bodyText}>
            {"The Royal Navy Patrol Service (RNPS) kept Britain breathing during the Second World War. Working from converted trawlers, drifters, yachts, and rescue craft, crews swept mines, escorted convoys, guarded ports, and stood by for major operations like the Dunkirk evacuation. Their reputation for persistence earned them the nickname 'Churchill's Pirates', and their mixed fleet became affectionately known as 'Harry Tate's Navy'."}
          </Text>

          <Text style={styles.bodyText}>
            Minesweeping was relentless and dangerous. Mines could detonate without warning, and keeping sea lanes open
            demanded calm drill, teamwork, and courage. Many RNPS sailors were former fishermen, already used to hard
            weather and long nights - skills that translated directly into wartime patrols and hazardous inshore work.
          </Text>

          <Text style={styles.bodyText}>
            {"HMS Sparrow's Nest in Lowestoft became the heart of the service, where crews trained before deploying. From there, they supported Operation Dynamo, threading through smoke and fire to bring troops off the beaches between 26 May and 4 June 1940. That rescue lifted more than 338,000 Allied troops from the sands and the Mole."}
          </Text>

          <View style={styles.featureCard}>
            <Text style={styles.sectionTitle}>News Feature - Lieut. Richard Been Stannard VC</Text>
            <Image
              source={{ uri: 'https://www.wartimemaritime.org/images/youth_skills/stannard.jpg' }}
              contentFit="cover"
              style={styles.stannardImage}
            />
            <Text style={styles.caption}>Lieut. Richard Been Stannard VC - leadership under relentless fire.</Text>
            <Text style={styles.bodyText}>
              Lieut. Richard Been Stannard commanded the armed trawler HMS Arab during the Norwegian campaign. Under
              sustained air attack at Namsos in April 1940, he kept his ship alongside a burning jetty to fight flames,
              then stayed to rescue soldiers and sailors who would otherwise have been trapped.
            </Text>
            <Text style={styles.bodyText}>
              For thirteen days of continuous action he showed calm judgement, tireless leadership, and an insistence
              on bringing others home first. His Victoria Cross was the only VC awarded to an RNPS member during the
              Second World War.
            </Text>
            <Text style={styles.kicker}>Discussion prompts</Text>
            <Text style={styles.listItem}>- How did Stannard balance ship safety with his determination to protect others?</Text>
            <Text style={styles.listItem}>- Which RNPS habits helped him hold the line?</Text>
            <Text style={styles.listItem}>- What modern coastal missions still rely on RNPS skills?</Text>
          </View>

          <Image source={{ uri: 'https://www.wartimemaritime.org/images/youth_skills/3.jpg' }} contentFit="cover" style={styles.heroImage} />
          <View style={styles.videoWrap}>
            <VideoView
              ref={videoViewRef}
              player={videoPlayer}
              style={styles.video}
              nativeControls
              contentFit="contain"
            />
            <Pressable
              style={styles.videoOverlayButton}
              onPress={() => void playVideoFullscreen()}
              accessibilityRole="button"
              accessibilityLabel="Play video fullscreen">
              <Text style={styles.videoOverlayIcon}>▶</Text>
              <Text style={styles.videoOverlayText}>Play</Text>
            </Pressable>
          </View>
          <Text style={styles.caption}>
            Note: This video is a dramatisation, an AI recreation, and a historical interpretation, created for the
            Youth Programme for educational purposes.
          </Text>

          <Text style={styles.kicker}>{"This month's focus"}</Text>
          <Text style={styles.bodyText}>
            Patrol craft readiness: clearing mines, marking safe channels, and coordinating with beach evacuation teams.
            Operation Dynamo drill: how small crews embarked evacuees, kept station under air attack, and returned
            safely.
          </Text>

          <Text style={styles.kicker}>From the directorship</Text>
          <Text style={styles.quote}>
            {'"The RNPS combined fishing knowledge with naval discipline. Their steady hands brought thousands home from Dunkirk and kept convoys alive. Study their methods; they are the roots of modern coastal security."'}
          </Text>

          <View style={styles.adCard}>
            <Text style={styles.adTop}>Week 2 - Operation Dynamo</Text>
            <Text style={styles.adMain}>Dunkirk</Text>
            <Text style={styles.adBottom}>Plan | Signal | Steer Home</Text>
          </View>

          <View style={styles.ruleThick} />

          <Text style={styles.sectionTitle}>Knowledge Check - Royal Navy Patrol Service</Text>
          {submitted && <Text style={styles.scoreText}>{scoreText}</Text>}

          {quizQuestions.map((question) => {
            const selected = selectedAnswers[question.id];
            const isCorrect = selected === answers[question.id];

            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader} accessibilityRole="radiogroup">
                  <Text style={styles.questionTitle}>{question.prompt}</Text>
                  {submitted && <Text style={[styles.mark, isCorrect ? styles.correctMark : styles.wrongMark]}>{isCorrect ? '✓' : '✗'}</Text>}
                </View>

                {question.options.map((option) => {
                  const isSelected = selected === option.key;

                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.optionRow, isSelected && styles.optionSelected]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      onPress={() => setSelectedAnswers((prev) => ({ ...prev, [question.id]: option.key }))}>
                      <ExpoCheckbox
                        value={isSelected}
                        onValueChange={() => setSelectedAnswers((prev) => ({ ...prev, [question.id]: option.key }))}
                        color={isSelected ? ink : undefined}
                        style={styles.checkbox}
                      />
                      <Text style={styles.optionText}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}

          <Pressable style={styles.submitButton} onPress={submitQuiz}>
            <Text style={styles.submitText}>Send a signal with your answers</Text>
          </Pressable>

          {submitted && <Text style={[styles.scoreText, styles.bottomScore]}>{scoreText}</Text>}

          <View style={styles.ruleThick} />

          <Text style={[styles.sectionTitle, styles.reportHeading]}>Mission Brief - RNPS Patrol Log</Text>
          <View style={styles.reportCard}>
            <Text style={styles.reportText}>
              Imagine you are serving aboard an RNPS vessel during the Second World War. Create a short mission log
              describing a typical patrol or operation.
            </Text>
            <Text style={styles.reportText}>Your mission log should include:</Text>
            <Text style={styles.reportText}>- Name of the vessel (real or plausible)</Text>
            <Text style={styles.reportText}>- Where you are operating</Text>
            <Text style={styles.reportText}>- The task your vessel is carrying out</Text>
            <Text style={styles.reportText}>- The conditions or challenges faced</Text>
            <Text style={styles.reportText}>- One skill, habit or value that helped the crew succeed</Text>

            <TextInput
              multiline
              value={missionLog}
              onChangeText={setMissionLog}
              placeholder="Enter your mission report"
              style={styles.reportInput}
              textAlignVertical="top"
            />

            <Pressable style={styles.submitButton} onPress={saveLog}>
              <Text style={styles.submitText}>Save report</Text>
            </Pressable>
          </View>

          <View style={styles.reportCard}>
            <Text style={[styles.sectionTitle, styles.reportHeading]}>Signal and send my progress to HQ</Text>
            <Text style={styles.reportText}>
              Enter how many minutes you spent on this activity (60 minutes is the recommended target) so your work
              can be saved and signalled to HQ.
            </Text>

            <TextInput
              value={minutesSpent}
              onChangeText={setMinutesSpent}
              keyboardType="numeric"
              placeholder="e.g. 60"
              style={styles.minutesInput}
            />

            <View style={styles.buttonRow}>
              <Pressable style={styles.submitButtonCompact} onPress={sendProgressSignal}>
                <Text style={styles.submitText}>Send progress signal</Text>
              </Pressable>
              <Pressable style={styles.submitButtonCompact} onPress={markComplete}>
                <Text style={styles.submitText}>Mark activity complete</Text>
              </Pressable>
            </View>

            {!!status && <Text style={styles.status}>{status}</Text>}
          </View>

          <View style={styles.ruleThick} />

          <Text style={styles.sectionTitle}>Upcoming Dates</Text>
          {upcomingDates.map((item) => (
            <View key={item.title} style={styles.dateCard}>
              <Text style={styles.dateTitle}>{item.title}</Text>
              <Text style={styles.dateDetail}>{item.detail}</Text>
            </View>
          ))}

          <View style={styles.ruleThick} />

          <Text style={styles.sectionTitle}>Assessor Note</Text>
          <Text style={styles.bodyText}>
            This activity demonstrates active engagement with historical and maritime subject matter. The participant
            has read and interpreted source material, completed a knowledge check, and produced a mission report that
            applies learning in a reflective and structured way.
          </Text>
          <Text style={styles.kicker}>What to look for in reports</Text>
          {assessItems.map((item) => (
            <Text key={item} style={styles.listItem}>
              - {item}
            </Text>
          ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Signal received - mission complete!</Text>
            <Image
              source={{ uri: 'https://www.wartimemaritime.org/images/mission_complete.png' }}
              contentFit="contain"
              style={styles.modalImage}
            />
            <Text style={styles.modalText}>All answers correct. Secure your charts and prepare for the next sortie.</Text>
            <Pressable style={styles.submitButton} onPress={resetQuiz}>
              <Text style={styles.submitText}>Play again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
    padding: 14,
    gap: 12,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  crest: {
    width: 80,
    height: 80,
  },
  headline: {
    flex: 1,
    minWidth: 220,
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 32,
    lineHeight: 38,
  },
  subheadline: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.headingItalic,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  ruleThick: {
    borderTopWidth: 4,
    borderTopColor: ink,
    marginTop: 4,
  },
  featureCard: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.65)',
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: ink,
    fontFamily: ChronicleFonts.heading,
    fontSize: 28,
  },
  stannardImage: {
    width: '100%',
    height: 240,
    borderWidth: 2,
    borderColor: ink,
  },
  caption: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.body,
    fontSize: 13,
    fontStyle: 'italic',
  },
  kicker: {
    color: ink,
    fontFamily: ChronicleFonts.heading,
    fontSize: 22,
    marginTop: 6,
  },
  listItem: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  heroImage: {
    width: '100%',
    height: 190,
    borderWidth: 2,
    borderColor: ink,
  },
  videoWrap: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 220,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#000',
  },
  videoOverlayButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    transform: [{ translateY: -24 }],
    minHeight: 48,
    minWidth: 96,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  videoOverlayIcon: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
  },
  videoOverlayText: {
    color: '#fff',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quote: {
    color: '#4f3d2c',
    fontFamily: ChronicleFonts.body,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 23,
  },
  adCard: {
    borderWidth: 2,
    borderColor: ink,
    padding: 12,
    backgroundColor: 'rgba(236,198,110,0.5)',
    alignItems: 'center',
  },
  adTop: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
  },
  adMain: {
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 34,
  },
  adBottom: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 12,
    letterSpacing: 1,
  },
  scoreText: {
    textAlign: 'right',
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 34,
  },
  bottomScore: {
    marginTop: 2,
  },
  questionCard: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.5)',
    padding: 12,
    gap: 8,
    borderRadius: 6,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionTitle: {
    flex: 1,
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  mark: {
    fontSize: 22,
    fontWeight: '800',
  },
  correctMark: {
    color: 'green',
  },
  wrongMark: {
    color: 'darkred',
  },
  optionRow: {
    borderWidth: 1,
    borderColor: 'rgba(43,31,18,0.35)',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 9,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(236,198,110,0.35)',
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  optionText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 4,
    borderRadius: 4,
  },
  submitButtonCompact: {
    flex: 1,
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 4,
  },
  submitText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  reportCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.72)',
    padding: 12,
    gap: 10,
  },
  reportHeading: {
    fontFamily: ChronicleFonts.typewriter,
    letterSpacing: 0.6,
  },
  reportText: {
    color: ink,
    fontFamily: ChronicleFonts.typewriter,
    fontSize: 15,
    lineHeight: 22,
  },
  reportInput: {
    minHeight: 130,
    borderWidth: 2,
    borderColor: ink,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 10,
    fontFamily: ChronicleFonts.typewriter,
    fontSize: 15,
    color: ink,
  },
  minutesInput: {
    borderWidth: 2,
    borderColor: ink,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: ChronicleFonts.typewriter,
    fontSize: 15,
    color: ink,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  status: {
    color: ink,
    fontFamily: ChronicleFonts.typewriter,
    fontSize: 14,
  },
  dateCard: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: 'rgba(243,234,214,0.55)',
    padding: 10,
    gap: 6,
  },
  dateTitle: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 15,
  },
  dateDetail: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'rgba(243,234,214,0.98)',
    borderWidth: 3,
    borderColor: ink,
    padding: 16,
    borderRadius: 8,
    gap: 10,
  },
  modalTitle: {
    color: ink,
    fontFamily: ChronicleFonts.heading,
    fontSize: 26,
    textAlign: 'center',
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderColor: ink,
  },
  modalText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
