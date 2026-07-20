import { ExpenseType } from "./expenseType";

export interface ExpenseCategory {
    id?: number;
    idExpenseType?: number;
    name?: string;
    isInvoiceRequired?: boolean;
    isDescriptionRequired?: boolean;
    isImageRequired?: boolean;
    status?: boolean;
    vendAccount?: string | null;
    companyCode?: string;
    expenseType?: ExpenseType | null;
}

export interface ExpenseCategoryDto {
    id: number;
    name: string;
    idExpenseType: number;
    typeName: string;
    isInvoiceRequired: boolean;
    isDescriptionRequired: boolean;
    isImageRequired: boolean;
    status: boolean;
    vendAccount?: string | null;
    vendCurrency?: string | null;
    companyCode: string
}