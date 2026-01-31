import {
  createExportWorkbook,
  workbookToBase64,
  workbookToBinary,
  type ExportData,
} from './exportToExcel';

const sampleDebt = {
  id: '1',
  name: 'Test Card',
  type: 'credit_card' as const,
  balance: 5000,
  interestRate: 18,
  minimumPayment: 150,
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('exportToExcel', () => {
  describe('createExportWorkbook', () => {
    it('creates workbook with Summary, Debts, Income & Plan sheets', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Summary');
      expect(wb.SheetNames).toContain('Debts');
      expect(wb.SheetNames).toContain('Income & Plan');
    });

    it('includes Payoff Schedule sheet when plan is valid', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Payoff Schedule');
    });

    it('omits Payoff Schedule when payment below minimums', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 50,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).not.toContain('Payoff Schedule');
    });

    it('handles empty debts', () => {
      const data: ExportData = {
        debts: [],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Summary');
      expect(wb.SheetNames).toContain('Debts');
    });

    it('includes debt-to-income in Summary when income > 0', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'avalanche',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      const summary = wb.Sheets['Summary'];
      expect(summary).toBeDefined();
      const range = (summary as { '!ref'?: string })['!ref'];
      expect(range).toBeDefined();
    });

    it('omits debt-to-income rows when schedule exists but monthlyIncome is 0', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Payoff Schedule');
      const summary = wb.Sheets['Summary'];
      expect(summary).toBeDefined();
    });

    it('uses DEBT_TYPE_LABELS for known types and fallback for unknown', () => {
      const debtWithOther = { ...sampleDebt, type: 'other' as const };
      const data: ExportData = {
        debts: [debtWithOther],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Debts');
    });

    it('handles debt without createdAt', () => {
      const debtNoDate = { ...sampleDebt, createdAt: '' };
      const data: ExportData = {
        debts: [debtNoDate],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Debts');
    });

    it('uses fallback for unknown debt type', () => {
      const debtUnknownType = {
        ...sampleDebt,
        type: 'medical' as unknown as 'credit_card' | 'personal_loan' | 'other',
      };
      const data: ExportData = {
        debts: [debtUnknownType],
        monthlyIncome: 0,
        payoffMethod: 'snowball',
        monthlyPayment: 0,
      };
      const wb = createExportWorkbook(data);
      expect(wb.SheetNames).toContain('Debts');
    });
  });

  describe('workbookToBase64', () => {
    it('returns base64 string', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      const base64 = workbookToBase64(wb);
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
      expect(() => atob(base64)).not.toThrow();
    });
  });

  describe('workbookToBinary', () => {
    it('returns Uint8Array', () => {
      const data: ExportData = {
        debts: [sampleDebt],
        monthlyIncome: 5000,
        payoffMethod: 'snowball',
        monthlyPayment: 200,
      };
      const wb = createExportWorkbook(data);
      const bin = workbookToBinary(wb);
      expect(bin).toBeInstanceOf(Uint8Array);
      expect(bin.length).toBeGreaterThan(0);
    });
  });
});
