import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExpenseCategory } from 'app/interfaces/gira/expenseCategory';
import { ExpenseAccount } from 'app/interfaces/gira/expenseAccount';
import { ExpenseType } from 'app/interfaces/gira/expenseType';
import { TaxGroup } from 'app/interfaces/gira/taxGroup';
import { environment } from 'environments/environment.development';
import { User } from 'app/interfaces/gira/user';

@Injectable({
  providedIn: 'root'
})
export class ExpensesSettingsService {

  private api: string = environment.apiURL;
  public allExpensesTypes: ExpenseType[] = [];
  public allExpensesCategories: ExpenseCategory[] = [];

  constructor(private http: HttpClient) { }

  setAllExpensesTypes(list: ExpenseType[]) {
    this.allExpensesTypes = list;
  }

  getAllExpensesTypes(): ExpenseType[] {
    return this.allExpensesTypes;
  }

  setAllExpensesCategories(list: ExpenseCategory[]) {
    this.allExpensesCategories = list;
  }
  //#region ExpensesTypes
  getAllExpensesCategories(): ExpenseCategory[] {
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

  //#region Users
  getUsers$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/Users/${companyCode}`, { headers });
  }

  getEmployees$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ExpensesSettings/Employees/${companyCode}`, { headers });
  }

  postUser$(user: User, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/User/${companyCode}`, user, { headers });
  }

  postUserState$(user: User) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ExpensesSettings/UserState`, user, { headers });
  }

  resetPassword$(id: number, newPassword: string, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.put<any>(`${this.api}ExpensesSettings/ResetPassword/${id}/${newPassword}/${companyCode}`, { headers });
  }
  //#endregion
}