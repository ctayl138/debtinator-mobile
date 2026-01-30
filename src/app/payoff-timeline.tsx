import React, { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';

const INITIAL_MONTHS_TO_SHOW = 12;
const MONTHS_TO_LOAD = 12;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

function getMonthYearForPayoffMonth(monthIndex: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthIndex);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function PayoffTimelineScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const debts = useDebts();
  const { method, monthlyPayment } = usePayoffFormStore();
  const [visibleMonths, setVisibleMonths] = useState(INITIAL_MONTHS_TO_SHOW);

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

  React.useEffect(() => {
    setVisibleMonths(INITIAL_MONTHS_TO_SHOW);
  }, [schedule]);

  const displayedMonths = useMemo(() => {
    if (!schedule) return [];
    return schedule.steps.slice(0, visibleMonths);
  }, [schedule, visibleMonths]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const padding = 100;
      const nearBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - padding;
      if (nearBottom && schedule && visibleMonths < schedule.steps.length) {
        setVisibleMonths((prev) =>
          Math.min(prev + MONTHS_TO_LOAD, schedule.steps.length)
        );
      }
    },
    [schedule, visibleMonths]
  );

  const hasMore = schedule ? visibleMonths < schedule.steps.length : false;
  const headerBg = (theme.colors as { header?: string }).header ?? theme.colors.surface;
  const headerFg = (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: headerBg },
      headerTintColor: headerFg,
      headerTitleStyle: { color: headerFg },
    });
  }, [navigation, headerBg, headerFg]);

  if (debts.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Add debts first to see the timeline
        </Text>
      </View>
    );
  }

  if (!schedule) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.background }]}>
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          Set a monthly payment on the Payoff tab (at least{' '}
          {formatCurrency(totalMinimumPayments)}) to see the timeline
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={200}
      showsVerticalScrollIndicator
      testID="payoff-timeline"
    >
      {displayedMonths.map((monthSteps, index) => (
        <View
          key={index}
          style={[styles.monthBlock, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Text variant="titleSmall" style={styles.monthHeader}>
            Month {index + 1} – {getMonthYearForPayoffMonth(index + 1)}
          </Text>
          {monthSteps.map((step, stepIndex) => (
            <View key={stepIndex} style={styles.stepRow}>
              <Text variant="bodyMedium" style={styles.stepDebt}>
                {step.debtName}
              </Text>
              <View style={styles.stepDetails}>
                <Text variant="bodySmall">
                  Payment: {formatCurrency(step.payment)}
                </Text>
                <Text variant="bodySmall">
                  Remaining: {formatCurrency(step.remainingBalance)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {hasMore && (
        <View style={styles.footer}>
          <ActivityIndicator size="small" />
          <Text
            variant="bodySmall"
            style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
          >
            Scroll for more months
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  monthBlock: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  monthHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepRow: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  stepDebt: {
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: 8 },
});
