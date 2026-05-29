import { ExpenseCategory } from "./expenseCategory"
import { FuelType } from "./fuelType"
import { Status } from "./status"

export interface ExpenseDetailsDto {
    id: number
    expenseCategoryId: number
    mealId?: number
    fuelTypeId?: number
    statusId: number
    personalCode: string
    vendAccount: string
    description?: string
    invoiceId: string
    seriesNum?: string
    exemptAmount?: number
    gravadoAmount?: number
    invoiceAmount: number
    invoiceDate: Date
    imagePath?: string
    creationDate: Date
    personalCodeAdmin?: string
    rejectionMotive?: string
    journalNum?: string
    companyCode: string
    inUse: boolean
    expenseCategoryName?: string
    expenseTypeName?: string
    icon?: string
    fuelTypeName?: string
    statusName?: string
    code?: string
    name?: string
}