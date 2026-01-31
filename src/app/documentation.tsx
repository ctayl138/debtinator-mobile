import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { List, Divider, Text, useTheme, DataTable, Card, Surface } from 'react-native-paper';
import { useNavigation } from 'expo-router';

type AccordionId = string | number;

interface TableRow {
  cells: string[];
}

interface TableData {
  headers: string[];
  rows: TableRow[];
}

function DocTable({ data }: { data: TableData }) {
  const theme = useTheme();
  return (
    <Surface style={[styles.tableContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
      <DataTable>
        <DataTable.Header>
          {data.headers.map((header, index) => (
            <DataTable.Title key={index} style={styles.tableCell}>
              <Text variant="labelMedium" style={{ fontWeight: 'bold' }}>{header}</Text>
            </DataTable.Title>
          ))}
        </DataTable.Header>
        {data.rows.map((row, rowIndex) => (
          <DataTable.Row key={rowIndex}>
            {row.cells.map((cell, cellIndex) => (
              <DataTable.Cell key={cellIndex} style={styles.tableCell}>
                <Text variant="bodySmall">{cell}</Text>
              </DataTable.Cell>
            ))}
          </DataTable.Row>
        ))}
      </DataTable>
    </Surface>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DocParagraph({ children }: { children: React.ReactNode }) {
  return <Text variant="bodyMedium" style={styles.paragraph}>{children}</Text>;
}

function DocBullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text variant="bodyMedium" style={styles.bulletPoint}>•</Text>
      <Text variant="bodyMedium" style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function DocNote({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Card style={[styles.noteCard, { backgroundColor: theme.colors.secondaryContainer }]} mode="contained">
      <Card.Content>
        <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
          📝 Note: {children}
        </Text>
      </Card.Content>
    </Card>
  );
}

function DocWarning({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Card style={[styles.noteCard, { backgroundColor: theme.colors.errorContainer }]} mode="contained">
      <Card.Content>
        <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
          ⚠️ Warning: {children}
        </Text>
      </Card.Content>
    </Card>
  );
}

function DebtManagementContent() {
  const addDebtFields: TableData = {
    headers: ['Field', 'Description', 'Example'],
    rows: [
      { cells: ['Debt Name', 'A recognizable name for this debt', '"Chase Sapphire Card"'] },
      { cells: ['Debt Type', 'Category for organization', 'Credit Card, Personal Loan, Other'] },
      { cells: ['Interest Rate', 'Annual Percentage Rate (APR)', '19.99%'] },
      { cells: ['Current Balance', 'Amount currently owed', '$5,432.10'] },
      { cells: ['Minimum Payment', 'Required monthly minimum', '$150.00'] },
    ],
  };

  const debtTypes: TableData = {
    headers: ['Type', 'Description', 'Common Examples'],
    rows: [
      { cells: ['Credit Card', 'Revolving credit accounts', 'Visa, Mastercard, Store cards'] },
      { cells: ['Personal Loan', 'Fixed-term installment loans', 'Bank loans, Peer-to-peer loans'] },
      { cells: ['Other', 'Any other debt type', 'Medical bills, Family loans'] },
    ],
  };

  return (
    <View style={styles.accordionContent}>
      <DocParagraph>The Debts screen is your central hub for tracking all outstanding debts.</DocParagraph>

      <DocSection title="Adding a New Debt">
        <DocBullet>Navigate to the Debts tab</DocBullet>
        <DocBullet>Tap the floating action button (+) in the bottom right</DocBullet>
        <DocBullet>Fill in the debt details:</DocBullet>
        <DocTable data={addDebtFields} />
        <DocBullet>Tap "Add Debt" to save</DocBullet>
      </DocSection>

      <DocSection title="Debt Types">
        <DocParagraph>Debts are organized into three categories:</DocParagraph>
        <DocTable data={debtTypes} />
      </DocSection>

      <DocSection title="Viewing Debt Summary">
        <DocParagraph>When you have debts added, the summary section shows:</DocParagraph>
        <DocBullet>Total Debt: Combined balance of all debts</DocBullet>
        <DocBullet>Total Minimum Payment: Sum of all monthly minimums</DocBullet>
        <DocBullet>Average APR: Weighted average interest rate (by balance)</DocBullet>
        <DocBullet>Debt Count: Number of active debts</DocBullet>
      </DocSection>

      <DocSection title="Editing a Debt">
        <DocBullet>Tap on any debt card to open the edit form</DocBullet>
        <DocBullet>Modify the fields as needed</DocBullet>
        <DocBullet>Tap "Update Debt" to save changes</DocBullet>
      </DocSection>

      <DocSection title="Deleting a Debt">
        <DocParagraph>Option 1: From Edit Form</DocParagraph>
        <DocBullet>Tap the debt card to open edit mode</DocBullet>
        <DocBullet>Scroll down and tap "Delete Debt"</DocBullet>
        <DocBullet>Confirm deletion</DocBullet>
        <DocParagraph>Option 2: Long Press</DocParagraph>
        <DocBullet>Long-press on a debt card</DocBullet>
        <DocBullet>Confirm deletion in the dialog</DocBullet>
        <DocWarning>Deletion is permanent and cannot be undone.</DocWarning>
      </DocSection>
    </View>
  );
}

function PayoffPlanningContent() {
  const exampleTable: TableData = {
    headers: ['Method', 'Order', 'Time', 'Total Interest'],
    rows: [
      { cells: ['Snowball', 'A → B → Loan', '42 months', '$3,847'] },
      { cells: ['Avalanche', 'A → B → Loan', '41 months', '$3,412'] },
    ],
  };

  const summaryTable: TableData = {
    headers: ['Metric', 'Description'],
    rows: [
      { cells: ['Time to Payoff', 'Total months and years until debt-free'] },
      { cells: ['Total Interest', 'Total interest you\'ll pay over the payoff period'] },
      { cells: ['Total Payments', 'Combined principal + interest payments'] },
    ],
  };

  return (
    <View style={styles.accordionContent}>
      <DocParagraph>Create a strategic plan to become debt-free.</DocParagraph>

      <DocSection title="Snowball Method">
        <DocParagraph>Best for: People who need motivation and quick wins</DocParagraph>
        <DocParagraph>How it works:</DocParagraph>
        <DocBullet>Pay minimum payments on all debts</DocBullet>
        <DocBullet>Put extra money toward the smallest balance</DocBullet>
        <DocBullet>When that's paid off, roll that payment to the next smallest</DocBullet>
        <DocBullet>Repeat until debt-free</DocBullet>
        <DocParagraph>Pros:</DocParagraph>
        <DocBullet>Quick psychological wins as debts are eliminated</DocBullet>
        <DocBullet>Builds momentum and motivation</DocBullet>
        <DocBullet>Simplifies monthly payments over time</DocBullet>
        <DocParagraph>Cons:</DocParagraph>
        <DocBullet>May pay more total interest than Avalanche</DocBullet>
      </DocSection>

      <DocSection title="Avalanche Method">
        <DocParagraph>Best for: People who want to minimize total interest paid</DocParagraph>
        <DocParagraph>How it works:</DocParagraph>
        <DocBullet>Pay minimum payments on all debts</DocBullet>
        <DocBullet>Put extra money toward the highest interest rate</DocBullet>
        <DocBullet>When that's paid off, roll that payment to the next highest rate</DocBullet>
        <DocBullet>Repeat until debt-free</DocBullet>
        <DocParagraph>Pros:</DocParagraph>
        <DocBullet>Mathematically optimal - pays least total interest</DocBullet>
        <DocBullet>Saves money long-term</DocBullet>
        <DocBullet>Better for high-interest debt situations</DocBullet>
        <DocParagraph>Cons:</DocParagraph>
        <DocBullet>May take longer to see debts fully eliminated</DocBullet>
        <DocBullet>Requires more discipline without quick wins</DocBullet>
      </DocSection>

      <DocSection title="Setting Up Your Payoff Plan">
        <DocBullet>Navigate to the Payoff tab</DocBullet>
        <DocBullet>Select your preferred method (Snowball or Avalanche)</DocBullet>
        <DocBullet>Enter your Total Monthly Payment (must be at least the sum of all minimum payments)</DocBullet>
      </DocSection>

      <DocSection title="Reading the Payoff Summary">
        <DocParagraph>Once you enter a valid monthly payment, you'll see:</DocParagraph>
        <DocTable data={summaryTable} />
      </DocSection>

      <DocSection title="Example Scenario">
        <DocParagraph>Your Debts:</DocParagraph>
        <DocBullet>Credit Card A: $2,000 @ 22% APR, $50 min</DocBullet>
        <DocBullet>Credit Card B: $5,000 @ 18% APR, $100 min</DocBullet>
        <DocBullet>Personal Loan: $10,000 @ 8% APR, $200 min</DocBullet>
        <DocParagraph>Monthly Payment: $500 ($150 above minimums)</DocParagraph>
        <DocTable data={exampleTable} />
      </DocSection>
    </View>
  );
}

function DataVisualizationContent() {
  return (
    <View style={styles.accordionContent}>
      <DocSection title="Accessing Charts">
        <DocParagraph>From the Payoff tab (when you have a valid plan):</DocParagraph>
        <DocBullet>Tap the chart icon in the header</DocBullet>
        <DocBullet>Switch between chart types using the segmented buttons</DocBullet>
      </DocSection>

      <DocSection title="Principal vs. Interest Pie Chart">
        <DocParagraph>Shows the breakdown of your total payments:</DocParagraph>
        <DocBullet>Principal (Blue): Amount going toward actual debt reduction</DocBullet>
        <DocBullet>Interest (Green): Amount going to interest charges</DocBullet>
        <DocParagraph>This helps visualize how much of your money is "working for you" vs. going to the lender.</DocParagraph>
      </DocSection>

      <DocSection title="Balance Over Time Line Chart">
        <DocParagraph>Shows your combined debt balance decreasing over the payoff period:</DocParagraph>
        <DocBullet>X-Axis: Months (labeled every 10 months)</DocBullet>
        <DocBullet>Y-Axis: Total remaining balance</DocBullet>
        <DocBullet>Line: Your debt-free journey</DocBullet>
        <DocParagraph>Features:</DocParagraph>
        <DocBullet>Abbreviated Y-axis labels ($44.2k, $1.1M)</DocBullet>
        <DocBullet>Smooth bezier curves</DocBullet>
        <DocBullet>Shows starting balance to $0</DocBullet>
      </DocSection>

      <DocSection title="Screen Orientation">
        <DocParagraph>For better chart viewing:</DocParagraph>
        <DocBullet>Tap the orientation button in the header</DocBullet>
        <DocBullet>Switch between Portrait and Landscape modes</DocBullet>
        <DocBullet>Charts automatically resize to fill the screen</DocBullet>
        <DocNote>Orientation control is not available on web.</DocNote>
      </DocSection>

      <DocSection title="Payoff Timeline">
        <DocParagraph>Access the detailed month-by-month view:</DocParagraph>
        <DocBullet>Tap the calendar icon in the Payoff header</DocBullet>
        <DocBullet>Scroll through each month's payment breakdown</DocBullet>
        <DocParagraph>For each month, you'll see:</DocParagraph>
        <DocBullet>Which debts receive payments</DocBullet>
        <DocBullet>Payment amount per debt</DocBullet>
        <DocBullet>Remaining balance after payment</DocBullet>
        <DocParagraph>The timeline uses infinite scroll - keep scrolling to load more months.</DocParagraph>
      </DocSection>
    </View>
  );
}

function SettingsContent() {
  const themeTable: TableData = {
    headers: ['Option', 'Description'],
    rows: [
      { cells: ['Light', 'Bright theme with soft blue accents'] },
      { cells: ['Dark', 'Dark theme with purple accents'] },
      { cells: ['System', 'Automatically matches your device setting'] },
    ],
  };

  return (
    <View style={styles.accordionContent}>
      <DocSection title="Accessing Settings">
        <DocParagraph>Tap the menu icon (☰) in the header from any screen, then select Settings or Help.</DocParagraph>
      </DocSection>

      <DocSection title="Theme Mode">
        <DocTable data={themeTable} />
        <DocParagraph>Light theme colors:</DocParagraph>
        <DocBullet>Primary: Calm blue (#4E7BA5)</DocBullet>
        <DocBullet>Secondary: Sage green (#6B8F71)</DocBullet>
        <DocBullet>Background: Warm off-white (#F5F3F0)</DocBullet>
        <DocParagraph>Dark theme colors:</DocParagraph>
        <DocBullet>Primary: Soft purple (#D0BCFF)</DocBullet>
        <DocBullet>Secondary: Muted lavender (#CCC2DC)</DocBullet>
        <DocBullet>Background: Deep charcoal (#1C1B1F)</DocBullet>
      </DocSection>

      <DocSection title="Data Persistence">
        <DocParagraph>All your data is automatically saved locally using MMKV storage:</DocParagraph>
        <DocBullet>Debts are persisted across app restarts</DocBullet>
        <DocBullet>Theme preference is remembered</DocBullet>
        <DocBullet>Payoff method selection is maintained</DocBullet>
        <DocNote>Data is stored only on your device. There is currently no cloud backup.</DocNote>
      </DocSection>
    </View>
  );
}

function TipsContent() {
  return (
    <View style={styles.accordionContent}>
      <DocSection title="Getting Started">
        <DocBullet>Add all your debts - Include everything for accurate planning</DocBullet>
        <DocBullet>Use accurate APRs - Check your statements for exact rates</DocBullet>
        <DocBullet>Be realistic about payments - Only commit to what you can afford</DocBullet>
      </DocSection>

      <DocSection title="Maximizing Your Payoff">
        <DocBullet>Pay more than minimums - Even $50 extra can save months</DocBullet>
        <DocBullet>Review monthly - Update balances as you make progress</DocBullet>
        <DocBullet>Consider windfalls - Tax refunds and bonuses can accelerate payoff</DocBullet>
      </DocSection>

      <DocSection title="Choosing Your Method">
        <DocBullet>Snowball if you need motivation and have similar interest rates</DocBullet>
        <DocBullet>Avalanche if you have high-interest debt and strong discipline</DocBullet>
        <DocBullet>Either works - the best method is the one you'll stick with!</DocBullet>
      </DocSection>
    </View>
  );
}

function AccessibilityContent() {
  const keyboardTable: TableData = {
    headers: ['Shortcut', 'Action'],
    rows: [
      { cells: ['Tab', 'Navigate between form fields'] },
      { cells: ['Enter', 'Submit forms'] },
      { cells: ['Escape', 'Close dialogs'] },
    ],
  };

  return (
    <View style={styles.accordionContent}>
      <DocSection title="Keyboard Shortcuts (Web)">
        <DocParagraph>When running Debtinator in a web browser:</DocParagraph>
        <DocTable data={keyboardTable} />
      </DocSection>

      <DocSection title="Accessibility Features">
        <DocParagraph>Debtinator includes accessibility features:</DocParagraph>
        <DocBullet>Screen reader support with accessibility labels</DocBullet>
        <DocBullet>Keyboard navigation for all interactive elements</DocBullet>
        <DocBullet>High contrast themes with sufficient color contrast</DocBullet>
        <DocBullet>Touch targets sized for easy tapping (44x44 minimum)</DocBullet>
      </DocSection>
    </View>
  );
}

export default function DocumentationScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState<AccordionId>('debt-management');

  const headerBg = (theme.colors as { header?: string }).header ?? theme.colors.surface;
  const headerFg = (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: headerBg },
      headerTintColor: headerFg,
      headerTitleStyle: { color: headerFg },
    });
  }, [navigation, headerBg, headerFg]);

  const handleAccordionPress = (id: AccordionId) => {
    setExpandedId(expandedId === id ? '' : id);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="documentation-scroll-view"
    >
      <Text variant="headlineSmall" style={styles.mainTitle}>Features Guide</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Comprehensive guide to all features in Debtinator.
      </Text>

      <List.AccordionGroup expandedId={expandedId} onAccordionPress={handleAccordionPress}>
        <List.Accordion
          id="debt-management"
          title="Debt Management"
          left={(props) => <List.Icon {...props} icon="credit-card-outline" />}
          right={(props) => (
            <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />
          )}
          testID="accordion-debt-management"
        >
          <DebtManagementContent />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="payoff-planning"
          title="Payoff Planning"
          left={(props) => <List.Icon {...props} icon="calculator-variant-outline" />}
          right={(props) => (
            <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />
          )}
          testID="accordion-payoff-planning"
        >
          <PayoffPlanningContent />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="data-visualization"
          title="Data Visualization"
          left={(props) => <List.Icon {...props} icon="chart-line" />}
          right={(props) => (
            <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />
          )}
          testID="accordion-data-visualization"
        >
          <DataVisualizationContent />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="settings"
          title="Settings & Customization"
          left={(props) => <List.Icon {...props} icon="menu" />}
          right={(props) => (
            <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />
          )}
          testID="accordion-settings"
        >
          <SettingsContent />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="tips"
          title="Tips & Best Practices"
          left={(props) => <List.Icon {...props} icon="lightbulb-outline" />}
          right={(props) => (
            <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />
          )}
          testID="accordion-tips"
        >
          <TipsContent />
        </List.Accordion>

        <Divider />

        <List.Accordion
          id="accessibility"
          title="Accessibility"
          left={(props) => <List.Icon {...props} icon="human" />}
          right={(props) => (
            <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />
          )}
          testID="accordion-accessibility"
        >
          <AccessibilityContent />
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
  mainTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    opacity: 0.7,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 16,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  tableContainer: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  tableCell: {
    flex: 1,
  },
  noteCard: {
    marginVertical: 8,
  },
});
