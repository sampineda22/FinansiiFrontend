export interface CertificateDeposit{
    id: number,
    companyCode: string
    bank: string
    cdNumber: string
    currency: string
    startDate: string | Date
    endDate: string | Date
    amount: number
    ratePercentage: number
    dailyIncome: number
    isEnabled: boolean
    renovationCertificate?: string
    comment?: string
    isCapitalizable: boolean
    creationDate: string | Date
    creationUser: string
    modificationDate?: string | Date
}