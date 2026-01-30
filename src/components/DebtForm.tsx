import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, RadioButton, Text, Divider, useTheme } from 'react-native-paper';
import { Debt, DebtType } from '../types';

interface DebtFormProps {
  debt?: Debt;
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function DebtForm({ debt, onSubmit, onCancel, onDelete }: DebtFormProps) {
  const theme = useTheme();
  const [name, setName] = useState(debt?.name || '');
  const [type, setType] = useState<DebtType>(debt?.type || 'other');
  const [balance, setBalance] = useState(debt?.balance.toString() || '');
  const [interestRate, setInterestRate] = useState(
    debt?.interestRate.toString() || ''
  );
  const [minimumPayment, setMinimumPayment] = useState(
    debt?.minimumPayment.toString() || ''
  );

  const handleSubmit = () => {
    // Validation is already handled by the disabled button state via isValid
    // This function is only called when form data is valid
    onSubmit({
      name: name.trim(),
      type,
      balance: parseFloat(balance),
      interestRate: parseFloat(interestRate),
      minimumPayment: parseFloat(minimumPayment),
    });
  };

  const isValid =
    name.trim().length > 0 &&
    parseFloat(balance) > 0 &&
    parseFloat(interestRate) >= 0 &&
    parseFloat(minimumPayment) > 0;

  return (
    <ScrollView style={styles.container} testID="debt-form">
      <View style={styles.form}>
        <TextInput
          label="Debt Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Credit Card, Car Loan"
          testID="debt-form-name"
        />

        <View style={styles.typeContainer}>
          <Text variant="bodyLarge" style={styles.typeLabel}>
            Debt Type
          </Text>
          <RadioButton.Group
            onValueChange={(value) => setType(value as DebtType)}
            value={type}
          >
            <RadioButton.Item 
              label="Credit Card" 
              value="credit_card" 
              style={styles.radioItem}
              labelStyle={styles.radioLabel}
            />
            <RadioButton.Item 
              label="Personal Loan" 
              value="personal_loan" 
              style={styles.radioItem}
              labelStyle={styles.radioLabel}
            />
            <RadioButton.Item 
              label="Other" 
              value="other" 
              style={styles.radioItem}
              labelStyle={styles.radioLabel}
            />
          </RadioButton.Group>
        </View>

        <TextInput
          label={type === 'credit_card' ? 'Interest Rate (APR %)' : 'Interest Rate (%)'}
          value={interestRate}
          onChangeText={setInterestRate}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="0.00"
          right={<TextInput.Affix text="%" />}
        />

        <TextInput
          label="Current Balance"
          value={balance}
          testID="debt-form-balance"
          onChangeText={setBalance}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="0.00"
          left={<TextInput.Affix text="$" />}
        />

        <TextInput
          label="Minimum Payment"
          value={minimumPayment}
          onChangeText={setMinimumPayment}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="0.00"
          left={<TextInput.Affix text="$" />}
        />

        {debt && onDelete && (
          <>
            <Divider style={styles.divider} />
            <Button
              mode="outlined"
              onPress={onDelete}
              style={styles.deleteButton}
              textColor={theme.colors.error}
              icon="delete"
            >
              Delete Debt
            </Button>
          </>
        )}

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.button, { marginRight: 8 }]}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            disabled={!isValid}
            testID="debt-form-submit"
          >
            {debt ? 'Update' : 'Add'} Debt
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  radioItem: {
    paddingVertical: 2,
  },
  radioLabel: {},
  divider: {
    marginVertical: 16,
  },
  deleteButton: {
    marginBottom: 16,
    borderColor: '#d32f2f',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
