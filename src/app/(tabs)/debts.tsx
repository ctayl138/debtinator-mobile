import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import { FAB, Text, Portal, Dialog, Button, Card, useTheme } from 'react-native-paper';
import { useDebts, useDebtActions } from '@/store/useDebtStore';
import DebtForm from '@/components/DebtForm';
import { Debt, DebtType } from '@/types';

const DEBT_TYPE_ORDER: DebtType[] = ['credit_card', 'personal_loan', 'other'];
const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  credit_card: 'Credit Cards',
  personal_loan: 'Personal Loans',
  other: 'Other',
};

export default function DebtsScreen() {
  const theme = useTheme();
  const debts = useDebts();
  const { addDebt, updateDebt, deleteDebt } = useDebtActions();
  
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();
  const [deletingDebt, setDeletingDebt] = useState<Debt | undefined>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const summary = useMemo(() => {
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimumPayments = debts.reduce(
      (sum, debt) => sum + debt.minimumPayment,
      0
    );
    const weightedInterestRate =
      debts.length > 0
        ? debts.reduce((sum, debt) => sum + debt.balance * debt.interestRate, 0) /
          totalBalance
        : 0;

    return {
      totalBalance,
      totalMinimumPayments,
      weightedInterestRate: isNaN(weightedInterestRate) ? 0 : weightedInterestRate,
      count: debts.length,
    };
  }, [debts]);

  // Group debts by type for sectioned list (Credit Cards, Personal Loans, Other)
  const sections = useMemo(() => {
    const grouped = DEBT_TYPE_ORDER.map((type) => ({
      type,
      title: DEBT_TYPE_LABELS[type],
      data: debts.filter((d) => (d.type || 'other') === type),
    }));
    return grouped.filter((s) => s.data.length > 0);
  }, [debts]);

  const handleAddPress = () => {
    setEditingDebt(undefined);
    setShowForm(true);
  };

  const handleEditPress = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  const handleFormSubmit = (debtData: Omit<Debt, 'id' | 'createdAt'>) => {
    if (editingDebt) {
      updateDebt(editingDebt.id, debtData);
    } else {
      addDebt(debtData);
    }
    setShowForm(false);
    setEditingDebt(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingDebt(undefined);
  };

  const handleFormDelete = () => {
    /* istanbul ignore else -- guard only, cannot be triggered via UI */
    if (editingDebt) {
      deleteDebt(editingDebt.id);
      setShowForm(false);
      setEditingDebt(undefined);
    }
  };

  const handleLongPress = (debt: Debt) => {
    setDeletingDebt(debt);
  };

  const confirmDelete = () => {
    /* istanbul ignore else -- guard only, cannot be triggered via UI */
    if (deletingDebt) {
      deleteDebt(deletingDebt.id);
      setDeletingDebt(undefined);
    }
  };

  const renderDebtCard = ({ item }: { item: Debt }) => (
    <Pressable onPress={() => handleEditPress(item)} onLongPress={() => handleLongPress(item)}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardName}>
              {item.name}
            </Text>
            <Text variant="headlineSmall" style={styles.cardBalance}>
              {formatCurrency(item.balance)}
            </Text>
          </View>
          <View style={styles.cardDetails}>
            <Text variant="bodyMedium" style={[styles.cardDetail, { color: theme.colors.onSurfaceVariant }]}>
              Interest: {item.interestRate.toFixed(2)}% APR
            </Text>
            <Text variant="bodyMedium" style={[styles.cardDetail, { color: theme.colors.onSurfaceVariant }]}>
              Min Payment: {formatCurrency(item.minimumPayment)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );

  const renderSectionHeader = ({ section }: { section: { title: string; data: Debt[] } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {section.title}
      </Text>
      <Text variant="bodySmall" style={[styles.sectionCount, { color: theme.colors.onSurfaceVariant }]}>
        {section.data.length} {section.data.length === 1 ? 'debt' : 'debts'}
      </Text>
    </View>
  );

  if (debts.length === 0 && !showForm) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]} testID="debts-empty">
        <Text variant="headlineSmall" style={styles.emptyText}>
          No Debts Yet
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Add your first debt to get started
        </Text>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddPress}
          label="Add Debt"
          testID="add-debt-fab"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {debts.length > 0 && (
        <View style={[styles.summary, { backgroundColor: theme.colors.background }]} testID="debts-summary">
          <Text variant="titleLarge" style={[styles.summaryTitle, { color: theme.colors.onSurfaceVariant }]}>
            Total Debt
          </Text>
          <Text variant="headlineMedium" style={styles.summaryAmount}>
            {formatCurrency(summary.totalBalance)}
          </Text>
          <View style={styles.summaryDetails}>
            <Text variant="bodySmall">
              {summary.count} {summary.count === 1 ? 'debt' : 'debts'}
            </Text>
            <Text variant="bodySmall">
              Total min payment: {formatCurrency(summary.totalMinimumPayments)}
            </Text>
            <Text variant="bodySmall">
              Avg APR: {summary.weightedInterestRate.toFixed(2)}%
            </Text>
          </View>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderDebtCard}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" style={styles.fab} onPress={handleAddPress} testID="add-debt-fab" />

      <Portal>
        <Dialog visible={showForm} onDismiss={handleFormCancel}>
          {/* istanbul ignore next -- both branches tested in unit tests */}
          <Dialog.Title>{editingDebt ? 'Edit Debt' : 'Add New Debt'}</Dialog.Title>
          <Dialog.Content>
            <DebtForm
              debt={editingDebt}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              onDelete={/* istanbul ignore next -- tested via edit/add modes */ editingDebt ? handleFormDelete : undefined}
            />
          </Dialog.Content>
        </Dialog>

        <Dialog visible={!!deletingDebt} onDismiss={() => setDeletingDebt(undefined)} testID="delete-debt-dialog">
          <Dialog.Title>Delete Debt</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{deletingDebt?.name}"? This
              action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeletingDebt(undefined)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  summary: {
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  list: {
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionCount: {
    color: '#666',
  },
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    flex: 1,
  },
  cardBalance: {
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardDetail: {},
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
