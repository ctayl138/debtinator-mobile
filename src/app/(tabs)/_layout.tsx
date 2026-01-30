import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { createPressedStyle } from '@/utils/styles';

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const headerRight = () => (
    <Pressable
      onPress={() => router.push('/settings')}
      style={createPressedStyle({ padding: 8, marginRight: 8 })}
      accessibilityLabel="Open settings"
    >
      <MaterialCommunityIcons
        name="cog-outline"
        size={24}
        color={(theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface}
      />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        headerStyle: {
          backgroundColor: (theme.colors as { header?: string }).header ?? theme.colors.surface,
        },
        headerTintColor: (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface,
        headerTitleStyle: {
          color: (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface,
        },
        headerShadowVisible: false,
        headerRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: 'My Debts',
          tabBarLabel: 'Debts',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'credit-card' : 'credit-card-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payoff"
        options={{
          title: 'Payoff Plan',
          tabBarLabel: 'Payoff',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chart-line' : 'chart-line-variant'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
