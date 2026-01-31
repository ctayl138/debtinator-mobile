import React, { useMemo, useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, SegmentedButtons, TextInput, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import HeaderMenuButton from '@/components/HeaderMenuButton';
import { useDebts } from '@/store/useDebtStore';
import { usePayoffFormStore } from '@/store/usePayoffFormStore';
import { useIncomeStore } from '@/store/useIncomeStore';
import { PayoffMethod, PayoffPlan } from '@/types';
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';
import { createPressedStyle } from '@/utils/styles';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function PayoffScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const debts = useDebts();
  const { method, monthlyPayment, setMethod, setMonthlyPayment } = usePayoffFormStore();
  const monthlyIncome = useIncomeStore((s) => s.monthlyIncome);

  const totalMinimumPayments = useMemo(
    () => debts.reduce((sum, debt) => sum + debt.minimumPayment, 0),
    [debts]
  );

  // Schedule uses monthlyPayment directly; ScrollView (not FlatList) keeps input in same tree so no focus loss
  const schedule = useMemo(() => {
    const payment = parseFloat(monthlyPayment) || 0;
    if (debts.length === 0 || payment < totalMinimumPayments) {
      return null;
    }

    const plan: PayoffPlan = {
      method,
      monthlyPayment: payment,
      debts,
    };

    return calculatePayoffSchedule(plan);
  }, [debts, method, monthlyPayment, totalMinimumPayments]);

  const headerColor = (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface;
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          {schedule != null && (
            <>
              <Pressable
                onPress={() => router.push('/payoff-timeline')}
                style={createPressedStyle({ padding: 8 })}
                accessibilityLabel="Open payoff timeline"
              >
                <MaterialCommunityIcons
                  name={'calendar-month-outline' as const}
                  size={24}
                  color={headerColor}
                />
              </Pressable>
              <Pressable
                onPress={() => router.push('/charts')}
                style={createPressedStyle({ padding: 8 })}
                accessibilityLabel="Open charts"
              >
                <MaterialCommunityIcons name={'chart-pie' as const} size={24} color={headerColor} />
              </Pressable>
            </>
          )}
          <HeaderMenuButton color={headerColor} style={{ padding: 8, marginRight: 8 }} />
        </View>
      ),
    });
  }, [navigation, router, headerColor, schedule]);

  if (debts.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]} testID="payoff-empty">
        <Text variant="headlineSmall" style={styles.emptyText}>
          No Debts to Plan
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Add some debts first to create a payoff plan
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator
    >
      <View style={styles.content}>
        <Card style={styles.card} testID="payoff-method-card">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Payoff Method
            </Text>
            <SegmentedButtons
              value={method}
              onValueChange={(value) => setMethod(value as PayoffMethod)}
              buttons={[
                { value: 'snowball', label: 'Snowball' },
                { value: 'avalanche', label: 'Avalanche' },
                { value: 'custom', label: 'Custom' },
              ]}
              style={styles.segmentedButtons}
            />
            <Text variant="bodySmall" style={[styles.methodDescription, { color: theme.colors.onSurfaceVariant }]}>
              {method === 'snowball' &&
                'Pay off smallest balances first for quick wins'}
              {method === 'avalanche' &&
                'Pay off highest interest rates first to save money'}
              {method === 'custom' &&
                'Choose your own payoff order (coming soon)'}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Monthly Payment
            </Text>
            <TextInput
              label="Total Monthly Payment"
              value={monthlyPayment}
              onChangeText={setMonthlyPayment}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0.00"
              left={<TextInput.Affix text="$" />}
              testID="monthly-payment-input"
            />
            <Text variant="bodySmall" style={styles.hint}>
              Minimum payments total: {formatCurrency(totalMinimumPayments)}
            </Text>
            {monthlyIncome === 0 && (
              <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Add your income in Settings to see debt-to-income insights
              </Text>
            )}
          </Card.Content>
        </Card>

        {monthlyIncome > 0 && (
          <Card style={styles.card} testID="income-insights-card">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Income Insights
              </Text>
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Minimum payments:</Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {((totalMinimumPayments / monthlyIncome) * 100).toFixed(1)}% of income
                </Text>
              </View>
              {schedule && parseFloat(monthlyPayment) > 0 && (
                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge">Your payment:</Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    {((parseFloat(monthlyPayment) / monthlyIncome) * 100).toFixed(1)}% of income
                  </Text>
                </View>
              )}
              <Text variant="bodySmall" style={[styles.incomeHint, { color: theme.colors.onSurfaceVariant }]}>
                Experts suggest keeping debt payments under 36% of gross income
              </Text>
            </Card.Content>
          </Card>
        )}

        {schedule && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Payoff Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Time to Payoff:</Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {schedule.totalMonths} months (
                  {(schedule.totalMonths / 12).toFixed(1)} years)
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Total Interest:</Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {formatCurrency(schedule.totalInterest)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="bodyLarge">Total Payments:</Text>
                <Text variant="bodyLarge" style={styles.summaryValue}>
                  {formatCurrency(schedule.totalPayments)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  methodDescription: {
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  hint: {},
  incomeHint: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
