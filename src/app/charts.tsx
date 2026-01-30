import React, { useState, useMemo, useLayoutEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable, Platform } from 'react-native';
import { Text, SegmentedButtons, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, LineChart } from 'react-native-chart-kit';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation, useFocusEffect } from 'expo-router';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';
import { getPressedOpacity } from '@/utils/styles';

// Offset accounts for: container padding (16) + card content padding (16) on each side = 64
const CHART_WIDTH_OFFSET = 64;
const CHART_HEIGHT = 220;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/** Abbreviated y-axis label to save horizontal space: e.g. 44200 → "$44.2k", 1100000 → "$1.1M". */
export function formatYAxisLabel(value: number): string {
  if (value === 0) return '$0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

/** Month index 0 = current month, 1 = next month, etc. Returns short label for x-axis e.g. "Jan 2026". */
function getMonthYearLabel(monthIndex: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthIndex);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ChartsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const debts = useDebts();
  const { method, monthlyPayment } = usePayoffFormStore();
  const [chartView, setChartView] = useState<'pie' | 'line'>('pie');
  const [isLandscape, setIsLandscape] = useState(false);

  const lockPortrait = useCallback(async () => {
    /* istanbul ignore if -- platform-specific, tested in charts.web.test.tsx */
    if (Platform.OS === 'web') return;
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsLandscape(false);
    } /* istanbul ignore next -- catch for orientation API failure */ catch (_) {}
  }, []);

  const lockLandscape = useCallback(async () => {
    /* istanbul ignore if -- platform-specific, tested in charts.web.test.tsx */
    if (Platform.OS === 'web') return;
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
      setIsLandscape(true);
    } /* istanbul ignore next -- catch for orientation API failure */ catch (_) {}
  }, []);

  const toggleOrientation = useCallback(async () => {
    if (Platform.OS === 'web') return;
    if (isLandscape) await lockPortrait();
    else await lockLandscape();
  }, [isLandscape, lockPortrait, lockLandscape]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (Platform.OS !== 'web') {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
        }
      };
    }, [])
  );

  const totalMinimumPayments = useMemo(
    () => debts.reduce((sum, debt) => sum + debt.minimumPayment, 0),
    [debts]
  );

  const schedule = useMemo(() => {
    const payment = parseFloat(monthlyPayment) || 0;
    if (debts.length === 0 || payment < totalMinimumPayments) return null;
    const plan: PayoffPlan = { method, monthlyPayment: payment, debts };
    return calculatePayoffSchedule(plan);
  }, [debts, method, monthlyPayment, totalMinimumPayments]);

  const initialTotalBalance = useMemo(
    () => debts.reduce((sum, d) => sum + d.balance, 0),
    [debts]
  );

  const roundToCent = (n: number) => Math.round(n * 100) / 100;

  const legendTextColor = theme.colors.onSurfaceVariant;

  const pieChartData = useMemo(() => {
    if (!schedule) return null;
    const principal = Math.max(0, schedule.totalPayments - schedule.totalInterest);
    const interest = schedule.totalInterest;
    if (principal === 0 && interest === 0) return null;
    /* istanbul ignore next -- fallback for type safety, Paper theme always provides primary */
    const primary = (theme.colors as { primary?: string }).primary ?? '#4E7BA5';
    /* istanbul ignore next -- fallback for type safety, Paper theme always provides secondary */
    const secondary = (theme.colors as { secondary?: string }).secondary ?? '#6B8F71';
    return [
      {
        name: 'Principal',
        population: roundToCent(principal),
        color: primary,
        legendFontColor: legendTextColor,
      },
      {
        name: 'Interest',
        population: roundToCent(interest),
        color: secondary,
        legendFontColor: legendTextColor,
      },
    ].filter((d) => d.population > 0);
  }, [schedule, theme.colors, legendTextColor]);

  const lineChartData = useMemo(() => {
    if (!schedule || schedule.steps.length === 0) return null;
    const balances: number[] = [initialTotalBalance];
    for (let i = 0; i < schedule.steps.length; i++) {
      const total = schedule.steps[i].reduce((sum, s) => sum + s.remainingBalance, 0);
      balances.push(total);
    }
    const count = balances.length;
    const labels = balances.map((_, i) =>
      i % 10 === 0 || i === count - 1 ? getMonthYearLabel(i) : ''
    );
    return { labels, datasets: [{ data: balances }] };
  }, [schedule, initialTotalBalance]);

  /* istanbul ignore next -- chart library config with internal callbacks */
  const chartConfig = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      backgroundGradientFrom: theme.colors.surface,
      backgroundGradientTo: theme.colors.surface,
      decimalPlaces: 0,
      color: (opacity = 1) => {
        const c = (theme.colors as { primary?: string }).primary ?? '#4E7BA5';
        return `${c}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
      },
      labelColor: () => theme.colors.onSurfaceVariant,
      propsForLabels: { fontSize: 11 },
    }),
    [theme.colors]
  );

  const screenWidth = Dimensions.get('window').width - CHART_WIDTH_OFFSET;
  const headerBg = (theme.colors as { header?: string }).header ?? theme.colors.surface;
  const headerFg = (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: headerBg },
      headerTintColor: headerFg,
      headerTitleStyle: { color: headerFg },
      headerRight: () => (
        <Pressable
          onPress={toggleOrientation}
          style={({ pressed }) => [
            styles.orientationButton,
            getPressedOpacity(pressed),
          ]}
          accessibilityLabel={isLandscape ? 'Switch to portrait' : 'Switch to landscape'}
        >
          <MaterialCommunityIcons
            name={isLandscape ? 'crop-portrait' : 'crop-landscape'}
            size={22}
            color={headerFg}
          />
          <Text variant="labelMedium" style={[styles.orientationLabel, { color: headerFg }]}>
            {isLandscape ? 'Portrait' : 'Landscape'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, headerBg, headerFg, toggleOrientation, isLandscape]);

  if (debts.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Add debts first to see charts
        </Text>
      </View>
    );
  }

  if (!schedule) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          Set a monthly payment on the Payoff tab (at least {formatCurrency(totalMinimumPayments)}) to see charts
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={chartView}
            onValueChange={(v: string) => setChartView(v as 'pie' | 'line')}
            buttons={[
              { value: 'pie', label: 'Principal vs Interest' },
              { value: 'line', label: 'Balance Over Time' },
            ]}
            style={styles.segmented}
          />
          {chartView === 'pie' && pieChartData && pieChartData.length > 0 && (
            <View style={styles.chartWrapper}>
              <PieChart
                data={pieChartData}
                width={screenWidth}
                height={CHART_HEIGHT}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="12"
                absolute
              />
            </View>
          )}
          {chartView === 'line' && lineChartData && (
            <View style={styles.chartWrapper}>
              <LineChart
                data={lineChartData}
                width={screenWidth}
                height={CHART_HEIGHT}
                chartConfig={chartConfig}
                bezier
                withDots={Platform.OS !== 'web'}
                withInnerLines
                withOuterLines
                fromZero
                style={styles.lineChart}
                formatYLabel={(v: string) => formatYAxisLabel(Number(v))}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  orientationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    gap: 6,
  },
  orientationLabel: {
    fontSize: 13,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: { marginBottom: 16 },
  segmented: { marginBottom: 16 },
  chartWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  lineChart: {
    borderRadius: 8,
    marginVertical: 4,
  },
});
