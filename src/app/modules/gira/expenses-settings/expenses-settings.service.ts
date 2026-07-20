import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExpenseCategoryDto } from 'app/interfaces/gira/expenseCategory';
import {ExpenseCategory} from 'app/interfaces/gira/expenseCategory';
import { ExpenseAccount } from 'app/interfaces/gira/expenseAccount';
import { ExpenseType } from 'app/interfaces/gira/expenseType';
import { TaxGroup } from 'app/interfaces/gira/taxGroup';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ExpensesSettingsService {

  private api: string = environment.apiURL;
  public allExpensesTypes: ExpenseType[] = [];
  public allExpensesCategories: ExpenseCategoryDto[] = [];

  constructor(private http: HttpClient) { }

  setAllExpensesTypes(list: ExpenseType[]) {
    this.allExpensesTypes = list;
  }

  getAllExpensesTypes(): ExpenseType[] {
    return this.allExpensesTypes;
  }

  setAllExpensesCategories(list: ExpenseCategoryDto[]) {
    this.allExpensesCategories = list;
  }
  //#region ExpensesTypes
  getAllExpensesCategories(): ExpenseCategoryDto[] {
    return this.allExpensesCategories;
  }

  getExpensesTypes$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/GetExpensesTypes/${companyCode}`, { headers });
  }

  postStatus$(expenseType: ExpenseType) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/Status`, expenseType, { headers });
  }

  postPutExpenseType$(expenseType: ExpenseType, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/ExpenseType/${companyCode}`, expenseType, { headers });
  }
  //#endregion

  //#region ExpensesCategories
  getExpensesCategories$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/ExpensesCategories/${companyCode}`, { headers });
  }

  postStatusCategory$(expenseCategory: ExpenseCategory) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/StatusCategory`, expenseCategory, { headers });
  }

  postPutExpenseCategory$(expenseCategory: ExpenseCategory, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/ExpenseCategory/${companyCode}`, expenseCategory, { headers });
  }
  //#endregion

  //#region ExpensesAccounts
  getExpensesAccount$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/ExpensesAccounts/${companyCode}`, { headers });
  }

  getMainAccounts$() {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/MainAccounts`, { headers });
  }

  postPutExpenseAccount$(expense: ExpenseAccount, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/ExpenseAccount/${companyCode}`, expense, { headers });
  }

  deleteExpenseAccount$(expenseId: number, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.delete<any>(`${this.api}ExpensesSettings/ExpenseAccount/${companyCode}/${expenseId}`, { headers });
  }
  //#endregion

  //#region TaxGroups
  getTaxGroups$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/TaxGroups/${companyCode}`, { headers });
  }

  postPutTaxGroup$(newTax: TaxGroup, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/TaxGroup/${companyCode}`, newTax, { headers });
  }
  //#endregion
}