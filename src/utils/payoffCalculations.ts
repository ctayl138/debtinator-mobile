import { Debt, PayoffSchedule, PayoffStep, PayoffPlan } from '../types';

/**
 * Calculate monthly interest rate from annual percentage rate
 */
function getMonthlyInterestRate(apr: number): number {
  return apr / 100 / 12;
}

/**
 * Apply payment to a debt and return updated balance and interest paid.
 * Assumes interest has already been accrued (balance already includes interest).
 */
function applyPayment(
  balance: number,
  payment: number
): { newBalance: number; principalPaid: number } {
  const principalPaid = Math.min(payment, balance);
  const newBalance = balance - principalPaid;

  return {
    newBalance: Math.max(0, newBalance),
    principalPaid,
  };
}

/**
 * Snowball method: Pay off smallest balance first
 */
function sortBySnowball(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

/**
 * Avalanche method: Pay off highest interest rate first
 */
function sortByAvalanche(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

/**
 * Custom method: Use provided order
 */
function sortByCustom(debts: Debt[], customOrder: string[]): Debt[] {
  const debtMap = new Map(debts.map((d) => [d.id, d]));
  const ordered: Debt[] = [];
  const remaining = new Set(debts.map((d) => d.id));

  // Add debts in custom order
  for (const id of customOrder) {
    if (debtMap.has(id) && remaining.has(id)) {
      ordered.push(debtMap.get(id)!);
      remaining.delete(id);
    }
  }

  // Add any remaining debts
  for (const id of remaining) {
    ordered.push(debtMap.get(id)!);
  }

  return ordered;
}

/**
 * Generate payoff schedule for a plan
 */
export function calculatePayoffSchedule(plan: PayoffPlan): PayoffSchedule {
  const { method, monthlyPayment, debts, customOrder } = plan;

  // Sort debts based on method
  let orderedDebts: Debt[];
  switch (method) {
    case 'snowball':
      orderedDebts = sortBySnowball(debts);
      break;
    case 'avalanche':
      orderedDebts = sortByAvalanche(debts);
      break;
    case 'custom':
      orderedDebts = customOrder
        ? sortByCustom(debts, customOrder)
        : [...debts];
      break;
    default:
      orderedDebts = [...debts];
  }

  // Create working copies of debts
  const workingDebts = orderedDebts.map((debt) => ({
    ...debt,
    balance: debt.balance,
  }));

  const steps: PayoffStep[][] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPayments = 0;

  while (workingDebts.some((d) => d.balance > 0)) {
    month++;
    const monthlySteps: PayoffStep[] = [];
    let remainingPayment = monthlyPayment;

    // Step 1: Accrue interest on all debts (interest is calculated once per month per debt)
    const interestAccrued = new Map<string, number>();
    for (const debt of workingDebts) {
      if (debt.balance <= 0) continue;
      const monthlyRate = getMonthlyInterestRate(debt.interestRate);
      const interest = debt.balance * monthlyRate;
      interestAccrued.set(debt.id, interest);
      debt.balance += interest; // Add interest to balance
      totalInterest += interest;
    }

    // Step 2: Pay minimum payments on ALL debts (if they have a balance)
    // This reflects reality - you must pay minimums on all debts each month
    for (const debt of workingDebts) {
      if (debt.balance <= 0) continue;

      const minPayment = Math.min(debt.minimumPayment, debt.balance);
      const payment = Math.min(minPayment, remainingPayment);

      if (payment > 0) {
        const result = applyPayment(debt.balance, payment);
        debt.balance = result.newBalance;
        totalPayments += payment;
        remainingPayment -= payment;

        monthlySteps.push({
          debtId: debt.id,
          debtName: debt.name,
          month,
          payment,
          remainingBalance: debt.balance,
          interestPaid: interestAccrued.get(debt.id) || 0,
        });
      }
    }

    // Step 3: Apply any remaining payment to the priority debt (first in snowball/avalanche order)
    // The priority debt is the first debt in the ordered list that still has a balance
    if (remainingPayment > 0) {
      const priorityDebt = workingDebts.find((d) => d.balance > 0);
      if (priorityDebt) {
        const result = applyPayment(priorityDebt.balance, remainingPayment);
        const payment = result.principalPaid;

        priorityDebt.balance = result.newBalance;
        totalPayments += payment;

        // Update or add step for the priority debt
        const existingStep = monthlySteps.find(
          (s) => s.debtId === priorityDebt.id
        );
        if (existingStep) {
          existingStep.payment += payment;
          existingStep.remainingBalance = priorityDebt.balance;
        } else {
          monthlySteps.push({
            debtId: priorityDebt.id,
            debtName: priorityDebt.name,
            month,
            payment,
            remainingBalance: priorityDebt.balance,
            interestPaid: interestAccrued.get(priorityDebt.id) || 0,
          });
        }
      }
    }

    steps.push(monthlySteps);

    // Safety check to prevent infinite loops
    if (month >= 600) {
      // 50 years max
      break;
    }
  }

  return {
    steps,
    totalMonths: month,
    totalInterest,
    totalPayments,
  };
}

/**
 * Get summary statistics for debts
 */
export function getDebtSummary(debts: Debt[]) {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );
  const weightedInterestRate =
    debts.reduce((sum, debt) => sum + debt.balance * debt.interestRate, 0) /
    totalBalance;

  return {
    totalBalance,
    totalMinimumPayments,
    weightedInterestRate: isNaN(weightedInterestRate)
      ? 0
      : weightedInterestRate,
    count: debts.length,
  };
}
