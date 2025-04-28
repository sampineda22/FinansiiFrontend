export interface WeeklyRecordsDto{
    week: number
    startDate: string | Date
    endDate: string | Date
    datesRange: string
    currency: string
    amountInCurrency: number
    amount: number
    journal: string
}