import { BankStatatementState } from "app/enum/bankStatatementState"

export interface BankStatement{
    bankStatementId ?: number
    account ?: string
    transactionDate ?: string | Date
    createDateTime ?: string | Date
    status ?: BankStatatementState
}