import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import { useThemeStore } from '@/store/useThemeStore';
import type { ThemeMode } from '@/theme/tokens';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System (match device)' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const [expandedId, setExpandedId] = useState<string | number>('appearance');

  const headerBg = (theme.colors as { header?: string }).header ?? theme.colors.surface;
  const headerFg = (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: headerBg },
      headerTintColor: headerFg,
      headerTitleStyle: { color: headerFg },
    });
  }, [navigation, headerBg, headerFg]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <List.AccordionGroup
        expandedId={expandedId}
        onAccordionPress={(id) => setExpandedId(expandedId === id ? '' : id)}
      >
        <List.Accordion
          id="appearance"
          title="Appearance"
          left={(props) => <List.Icon {...props} icon="palette-outline" />}
          right={(props) => (
            <List.Icon
              {...props}
              icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
            />
          )}
        >
          {THEME_OPTIONS.map((opt) => (
            <List.Item
              key={opt.value}
              title={opt.label}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    opt.value === 'light'
                      ? 'white-balance-sunny'
                      : opt.value === 'dark'
                        ? 'weather-night'
                        : 'cellphone'
                  }
                />
              )}
              right={() =>
                mode === opt.value ? (
                  <List.Icon icon="check" color={theme.colors.primary} />
                ) : null
              }
              onPress={() => setMode(opt.value)}
            />
          ))}
        </List.Accordion>

        <Divider />

        {/* Placeholder for future settings groups – add more List.Accordion sections here */}
      </List.AccordionGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
});
