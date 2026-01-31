import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { List, Divider, useTheme, TextInput, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useThemeStore } from '@/store/useThemeStore';
import { useIncomeStore } from '@/store/useIncomeStore';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import {
  createExportWorkbook,
  workbookToBase64,
  workbookToBinary,
} from '@/utils/exportToExcel';
import type { ThemeMode } from '@/theme/tokens';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System (match device)' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const monthlyIncome = useIncomeStore((s) => s.monthlyIncome);
  const setMonthlyIncome = useIncomeStore((s) => s.setMonthlyIncome);
  const debts = useDebts();
  const { method: payoffMethod, monthlyPayment } = usePayoffFormStore();
  const [expandedId, setExpandedId] = useState<string | number>('appearance');
  const [isExporting, setIsExporting] = useState(false);
  const [incomeInput, setIncomeInput] = useState(
    monthlyIncome > 0 ? monthlyIncome.toString() : ''
  );

  useEffect(() => {
    setIncomeInput(monthlyIncome > 0 ? monthlyIncome.toString() : '');
  }, [monthlyIncome]);

  const handleIncomeBlur = () => {
    const parsed = parseFloat(incomeInput);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setMonthlyIncome(value);
    setIncomeInput(value > 0 ? value.toString() : '');
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const wb = createExportWorkbook({
        debts,
        monthlyIncome,
        payoffMethod,
        monthlyPayment: parseFloat(String(monthlyPayment)) || 0,
      });

      const filename = `debtinator-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

      /* istanbul ignore if */
      if (Platform.OS === 'web') {
        const bin = workbookToBinary(wb);
        const blob = new Blob([bin], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const base64 = workbookToBase64(wb);
        const uri = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Export debt data for counseling',
          });
        } else {
          Alert.alert(
            'Export Complete',
            `File saved to ${uri}. Use a file manager to share it.`
          );
        }
      }
    } catch (err) {
      Alert.alert(
        'Export Failed',
        err instanceof Error ? err.message : 'Could not export data'
      );
    } finally {
      setIsExporting(false);
    }
  };

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

        <List.Accordion
          id="income"
          title="Income"
          left={(props) => <List.Icon {...props} icon="cash" />}
          right={(props) => (
            <List.Icon
              {...props}
              icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
            />
          )}
        >
          <TextInput
            label="Monthly Income (optional)"
            value={incomeInput}
            onChangeText={setIncomeInput}
            onBlur={handleIncomeBlur}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="0.00"
            left={<TextInput.Affix text="$" />}
            style={styles.incomeInput}
            testID="income-input"
          />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="export"
          title="Export Data"
          left={(props) => <List.Icon {...props} icon="file-export" />}
          right={(props) => (
            <List.Icon
              {...props}
              icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
            />
          )}
        >
          <List.Item
            title="Export to Excel"
            description="Share your debt data with a counselor or advisor for analysis"
            left={(props) => <List.Icon {...props} icon="file-excel" />}
            right={(props) =>
              isExporting ? (
                <ActivityIndicator size="small" style={styles.exportSpinner} />
              ) : (
                <List.Icon {...props} icon="download" />
              )
            }
            onPress={handleExportExcel}
            disabled={isExporting}
            testID="export-excel-button"
            style={styles.exportItem}
          />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="help"
          title="Help"
          left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
          right={(props) => (
            <List.Icon
              {...props}
              icon={props.isExpanded ? 'chevron-up' : 'chevron-down'}
            />
          )}
        >
          <List.Item
            title="Features Guide"
            description="Learn how to use all app features"
            left={(props) => <List.Icon {...props} icon="book-open-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/documentation')}
            testID="help-documentation-link"
          />
        </List.Accordion>
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
  incomeInput: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  exportItem: {
    paddingVertical: 8,
  },
  exportSpinner: {
    marginRight: 8,
  },
});
