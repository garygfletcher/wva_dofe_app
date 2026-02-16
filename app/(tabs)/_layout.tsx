import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { emitTabRefresh } from '@/lib/tab-refresh';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3ead6',
        }}>
        <ActivityIndicator size="large" color="#2b1f12" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => emitTabRefresh('index'),
        }}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        listeners={{
          tabPress: () => emitTabRefresh('explore'),
        }}
        options={{
          title: 'Activities',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        listeners={{
          tabPress: () => emitTabRefresh('news'),
        }}
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        listeners={{
          tabPress: () => emitTabRefresh('account'),
        }}
        options={{
          title: 'My Account',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rnps"
        options={{
          title: 'Week 1',
          href: null,
        }}
      />
    </Tabs>
  );
}
