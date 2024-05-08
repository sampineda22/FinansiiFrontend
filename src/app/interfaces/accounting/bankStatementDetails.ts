import { TransactionType } from "app/enum/transactionType"

export interface BankStatementDetails
{
    bankStatementDetailId ?: number
    bankStatementId ?: number
    currencyCode ?: string
    transactionDate ?: string | Date
    transactionCode ?: string
    description ?: string
    reference ?: string
    amount ?: number
    type ?: TransactionType
}