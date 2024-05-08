import { Bank } from "app/enum/bank"

export interface BankConfiguration{
    bankConfigurationId ?: number
    companyId ?: string
    bank ?: Bank
    accountId ?: string
    accountNumber ?: string
    host ?: string
    port ?: number
    userName ?: string
    password ?: string
    fileRoute ?: string
    localFileRoute ?: string
    fileName ?: string
}