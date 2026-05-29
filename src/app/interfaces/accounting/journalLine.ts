export interface JournalLine {
  lineNum: number;
  voucher: string;
  name: string;
  description: string;
  currencyCode: string;
  debit: number;
  paymentStatus: string;
  offSetLedgerDimension: string;
}