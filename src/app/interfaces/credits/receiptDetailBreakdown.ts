export interface ReceiptDetailBreakdown{
    receiptNumber: string,
    documentNumber: string
    feLDocument: string
    productType: string
    date: string | Date
    state: string
    clientAccount: string
    clientName: string
    debitCollectorCode: string
    currencyCode: string
    receiptAmountInCurrency: number
    receiptAmount: number
    cashAmount: number
    canceledReceiptAmount: number
    total: number
}