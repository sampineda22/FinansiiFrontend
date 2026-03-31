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
    taxGroup?: string | null;
    companyCode?: string;
    expenseType?: ExpenseType | null;
}