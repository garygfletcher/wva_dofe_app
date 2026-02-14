import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChronicleFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function AccountScreen() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const bundleVersion = Constants.expoConfig?.ios?.buildNumber ?? '-';

  const openExternal = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const onSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.paper}>
          <Text style={styles.title}>My Account</Text>

          <Text style={styles.rowLabel}>Name</Text>
          <Text style={styles.rowValue}>{session?.user?.name ?? '-'}</Text>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{session?.user?.email ?? '-'}</Text>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>{bundleVersion}</Text>

          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>Contact Details</Text>
            <Text style={styles.blockText}>The Wartime Vessels Association</Text>
            <Pressable onPress={() => void openExternal('mailto:signals@wartimevessels.org')}>
              <Text style={styles.linkText}>signals@wartimevessels.org</Text>
            </Pressable>
            <Pressable onPress={() => void openExternal('https://www.wartimemaritime.org/contact')}>
              <Text style={styles.linkText}>Contact form</Text>
            </Pressable>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>Privacy Policy</Text>
            <Pressable onPress={() => void openExternal('https://www.wartimemaritime.org/privacy')}>
              <Text style={styles.linkText}>View privacy policy</Text>
            </Pressable>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.blockTitle}>Complaints Process</Text>
            <Text style={styles.blockText}>
              Complaints and related policy details are listed in the WVA policy register.
            </Text>
            <Pressable onPress={() => void openExternal('https://www.wartimemaritime.org/policies/policy-register')}>
              <Text style={styles.linkText}>View complaints process</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.signOutButton}
            onPress={() => void onSignOut()}
            accessibilityRole="button"
            accessibilityLabel="Sign out of your account">
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>

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
    padding: 14,
  },
  content: {
    paddingBottom: 24,
  },
  paper: {
    backgroundColor: '#f3ead6',
    padding: 16,
    gap: 8,
  },
  title: {
    color: ink,
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 34,
    marginBottom: 8,
  },
  rowLabel: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowValue: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 18,
    marginBottom: 6,
  },
  infoBlock: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(43,31,18,0.35)',
    backgroundColor: 'rgba(243,234,214,0.72)',
    padding: 10,
    gap: 4,
  },
  blockTitle: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 15,
  },
  blockText: {
    color: ink,
    fontFamily: ChronicleFonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  linkText: {
    color: '#1d4c8f',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signOutButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: ink,
    backgroundColor: 'rgba(236,198,110,0.85)',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  signOutText: {
    color: ink,
    fontFamily: ChronicleFonts.bodySemiBold,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.6,
  },
});
