import { ExpenseCategory } from "./expenseCategory"
import { FuelType } from "./fuelType"
import { Status } from "./status"

export interface ExpenseDetails {
    id: number
    expenseCategoryId: number
    fuelTypeId?: number
    statusId: number
    salesAgentUser: string
    vendAccount: string
    description?: string
    seriesNum?: string
    invoiceId: string
    exemptAmount?: number
    gravadoAmount: number
    invoiceAmount: number
    invoiceDate: Date
    imagePath: string
    creationDate: Date
    admin?: string
    rejectionMotive?: string
    expenseNote?: string
    companyCode: string
    expenseCategory: ExpenseCategory
    fuelType: FuelType
    status: Status
}