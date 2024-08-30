import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BankConfiguration } from 'app/interfaces/accounting/bankConfiguration';
import { BankStatement } from 'app/interfaces/accounting/bankStatement';
import { BankStatementDetails } from 'app/interfaces/accounting/bankStatementDetails';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BankTransfersService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  getStatementsByAccountId$(accountId: string, date: string, companyCode: string){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<BankStatement[]>(`${this.api}GetByAccountId/${accountId}/${date}/${companyCode}`, { headers });
  }

  getBanksConfiguration$(companyCode: string){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<BankConfiguration[]>(`${this.api}GetAllBankConfiguration/${companyCode}`, { headers });
  }

  getDetailsByStatement$(bankStatementId: number){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<BankStatementDetails[]>(`${this.api}Details-BankStatementId?bankStatementId=${bankStatementId}`)
  }

  sendBankStatementServiceAX$(BankStatementId: string): Observable<any>{
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}SendBankStatementServiceAX/${BankStatementId}`, { headers })
  }

  importStatementFromFileByAccount$(date: string, companyCode: string, accountId: string): Observable<any>{
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}ImportStatementFromFileByAccountId/${companyCode}/${date}/${accountId}`, { headers })
  }

}