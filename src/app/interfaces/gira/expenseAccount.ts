import { ExpenseCategory } from "./expenseCategory";
import { ExpenseType } from "./expenseType";

export interface ExpenseAccount {
    id: number;
    accountId: string;
    idExpenseType: number;
    idExpenseCategory: number;
    companyCode: string;

    expenseType?: ExpenseType | null;
    expenseCategory?: ExpenseCategory | null;
}

export interface ExpenseAccountDto {
    id: number;
    accountId: string;
    accountName: string;
    idExpenseType: number;
    expenseTypeName: string;
    idExpenseCategory: number;
    expenseCategoryName: string;
}