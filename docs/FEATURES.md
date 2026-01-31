# Features Guide

Comprehensive guide to all features in Debtinator.

## Table of Contents

- [Debt Management](#debt-management)
- [Payoff Planning](#payoff-planning)
- [Data Visualization](#data-visualization)
- [Settings & Customization](#settings--customization)

---

## Debt Management

The Debts screen is your central hub for tracking all outstanding debts.

### Adding a New Debt

1. Navigate to the **Debts** tab
2. Tap the floating action button (+) in the bottom right
3. Fill in the debt details:

| Field | Description | Example |
|-------|-------------|---------|
| **Debt Name** | A recognizable name for this debt | "Chase Sapphire Card" |
| **Debt Type** | Category for organization | Credit Card, Personal Loan, Other |
| **Interest Rate** | Annual Percentage Rate (APR) | 19.99% |
| **Current Balance** | Amount currently owed | $5,432.10 |
| **Minimum Payment** | Required monthly minimum | $150.00 |

4. Tap **Add Debt** to save

### Debt Types

Debts are organized into three categories:

| Type | Description | Common Examples |
|------|-------------|-----------------|
| **Credit Card** | Revolving credit accounts | Visa, Mastercard, Store cards |
| **Personal Loan** | Fixed-term installment loans | Bank loans, Peer-to-peer loans |
| **Other** | Any other debt type | Medical bills, Family loans |

### Viewing Debt Summary

When you have debts added, the summary section shows:

- **Total Debt**: Combined balance of all debts
- **Total Minimum Payment**: Sum of all monthly minimums
- **Average APR**: Weighted average interest rate (by balance)
- **Debt Count**: Number of active debts

### Editing a Debt

1. Tap on any debt card to open the edit form
2. Modify the fields as needed
3. Tap **Update Debt** to save changes

### Deleting a Debt

**Option 1: From Edit Form**
1. Tap the debt card to open edit mode
2. Scroll down and tap **Delete Debt**
3. Confirm deletion

**Option 2: Long Press**
1. Long-press on a debt card
2. Confirm deletion in the dialog

> **Warning**: Deletion is permanent and cannot be undone.

---

## Payoff Planning

Create a strategic plan to become debt-free.

### Understanding Payoff Methods

#### Snowball Method

**Best for**: People who need motivation and quick wins

**How it works**:
1. Pay minimum payments on all debts
2. Put extra money toward the **smallest balance**
3. When that's paid off, roll that payment to the next smallest
4. Repeat until debt-free

**Pros**:
- Quick psychological wins as debts are eliminated
- Builds momentum and motivation
- Simplifies monthly payments over time

**Cons**:
- May pay more total interest than Avalanche

#### Avalanche Method

**Best for**: People who want to minimize total interest paid

**How it works**:
1. Pay minimum payments on all debts
2. Put extra money toward the **highest interest rate**
3. When that's paid off, roll that payment to the next highest rate
4. Repeat until debt-free

**Pros**:
- Mathematically optimal - pays least total interest
- Saves money long-term
- Better for high-interest debt situations

**Cons**:
- May take longer to see debts fully eliminated
- Requires more discipline without quick wins

#### Custom Method (Coming Soon)

Define your own priority order based on personal preferences.

### Setting Up Your Payoff Plan

1. Navigate to the **Payoff** tab
2. Select your preferred method (Snowball or Avalanche)
3. Enter your **Total Monthly Payment**
   - Must be at least the sum of all minimum payments
   - Higher amounts accelerate payoff

### Reading the Payoff Summary

Once you enter a valid monthly payment, you'll see:

| Metric | Description |
|--------|-------------|
| **Time to Payoff** | Total months and years until debt-free |
| **Total Interest** | Total interest you'll pay over the payoff period |
| **Total Payments** | Combined principal + interest payments |

### Example Scenario

**Your Debts**:
- Credit Card A: $2,000 @ 22% APR, $50 min
- Credit Card B: $5,000 @ 18% APR, $100 min  
- Personal Loan: $10,000 @ 8% APR, $200 min

**Monthly Payment**: $500 ($150 above minimums)

| Method | Order | Time | Total Interest |
|--------|-------|------|----------------|
| Snowball | A → B → Loan | 42 months | $3,847 |
| Avalanche | A → B → Loan | 41 months | $3,412 |

---

## Data Visualization

### Accessing Charts

From the Payoff tab (when you have a valid plan):
1. Tap the **chart icon** in the header
2. Switch between chart types using the segmented buttons

### Principal vs. Interest Pie Chart

Shows the breakdown of your total payments:

- **Principal** (Blue): Amount going toward actual debt reduction
- **Interest** (Green): Amount going to interest charges

This helps visualize how much of your money is "working for you" vs. going to the lender.

### Balance Over Time Line Chart

Shows your combined debt balance decreasing over the payoff period:

- **X-Axis**: Months (labeled every 10 months)
- **Y-Axis**: Total remaining balance
- **Line**: Your debt-free journey

Features:
- Abbreviated Y-axis labels ($44.2k, $1.1M)
- Smooth bezier curves
- Shows starting balance to $0

### Screen Orientation

For better chart viewing:
1. Tap the **orientation button** in the header
2. Switch between Portrait and Landscape modes
3. Charts automatically resize to fill the screen

> **Note**: Orientation control is not available on web.

### Payoff Timeline

Access the detailed month-by-month view:
1. Tap the **calendar icon** in the Payoff header
2. Scroll through each month's payment breakdown

For each month, you'll see:
- Which debts receive payments
- Payment amount per debt
- Remaining balance after payment

The timeline uses infinite scroll - keep scrolling to load more months.

---

## Settings & Customization

### Accessing Settings

Tap the **menu icon** (☰) in the header from any screen, then select **Settings**.

### Income (Optional)

Track your monthly income for debt-to-income insights:

1. Open **Settings** and expand the **Income** section
2. Enter your **Monthly Income** (e.g., take-home pay)
3. Tap outside the field to save

When income is set, the **Payoff** tab shows:
- **Minimum payments as % of income** – How much of your income goes to minimum payments
- **Your payment as % of income** – When you enter a monthly payment, see what percentage of income it represents
- A reminder that experts suggest keeping debt payments under 36% of gross income

Income data is stored locally and never shared.

### Appearance Settings

#### Theme Mode

| Option | Description |
|--------|-------------|
| **Light** | Bright theme with soft blue accents |
| **Dark** | Dark theme with purple accents |
| **System** | Automatically matches your device setting |

Light theme colors:
- Primary: Calm blue (#4E7BA5)
- Secondary: Sage green (#6B8F71)
- Background: Warm off-white (#F5F3F0)

Dark theme colors:
- Primary: Soft purple (#D0BCFF)
- Secondary: Muted lavender (#CCC2DC)
- Background: Deep charcoal (#1C1B1F)

### Export Data

Export all your debt information to Excel for sharing with a debt counselor or financial advisor:

1. Open **Settings** and expand **Export Data**
2. Tap **Export to Excel**
3. On iOS/Android: Use the share sheet to save or send the file (email, AirDrop, etc.)
4. On Web: The file downloads automatically

The Excel file includes:
- **Summary** – Total debt, minimum payments, income, payoff timeline, debt-to-income ratios
- **Debts** – Each debt with name, type, balance, interest rate, minimum payment
- **Income & Plan** – Monthly income and payoff method
- **Payoff Schedule** – Month-by-month breakdown (when you have a valid plan)

> **Note**: Export includes all data you've entered. Only share with trusted professionals.

### Data Persistence

All your data is automatically saved locally using MMKV storage:

- Debts are persisted across app restarts
- Theme preference is remembered
- Income (if set) is saved
- Payoff method selection is maintained

> **Note**: Data is stored only on your device. There is currently no cloud backup.

---

## Tips & Best Practices

### Getting Started

1. **Add all your debts** - Include everything for accurate planning
2. **Use accurate APRs** - Check your statements for exact rates
3. **Be realistic about payments** - Only commit to what you can afford

### Maximizing Your Payoff

1. **Pay more than minimums** - Even $50 extra can save months
2. **Review monthly** - Update balances as you make progress
3. **Consider windfalls** - Tax refunds and bonuses can accelerate payoff

### Choosing Your Method

- **Snowball** if you need motivation and have similar interest rates
- **Avalanche** if you have high-interest debt and strong discipline
- **Either works** - the best method is the one you'll stick with!

---

## Keyboard Shortcuts (Web)

When running Debtinator in a web browser:

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between form fields |
| `Enter` | Submit forms |
| `Escape` | Close dialogs |

---

## Accessibility

Debtinator includes accessibility features:

- **Screen reader support** with accessibility labels
- **Keyboard navigation** for all interactive elements
- **High contrast** themes with sufficient color contrast
- **Touch targets** sized for easy tapping (44x44 minimum)
