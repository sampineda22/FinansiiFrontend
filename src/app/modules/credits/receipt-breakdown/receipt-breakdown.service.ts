import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityResponse } from 'app/interfaces/admin/entityResponse';
import { FiscalWeek } from 'app/interfaces/credits/fiscalWeek';
import { FiscalYear } from 'app/interfaces/credits/fiscalYear';
import { ReceiptDetailBreakdown } from 'app/interfaces/credits/receiptDetailBreakdown';
import { SalesAgent } from 'app/interfaces/credits/salesAgent';
import { Employee } from 'app/interfaces/general/employee';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReceiptBreakdownService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  getReceiptDetailBreakdown$(startDate: string, endDate: string, salesmanCode: string, companyCode: string){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<EntityResponse<ReceiptDetailBreakdown[]>>(`${this.api}ReceiptDetailBreakdown/GetReceiptDetailBreakdown/${startDate}/${endDate}/${salesmanCode}/${companyCode}`, { headers });
  }

  getSalesAgents$(companyCode: string){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<EntityResponse<SalesAgent[]>>(`${this.api}ReceiptDetailBreakdown/GetSalesAgents/${companyCode}`, { headers });
  }

  getFiscalYears$(){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<EntityResponse<FiscalYear[]>>(`${this.api}ReceiptDetailBreakdown/GetFiscalYears`, { headers });
  }

  getFiscalWeaks$(recId: string){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<EntityResponse<FiscalWeek[]>>(`${this.api}ReceiptDetailBreakdown/GetFiscalWeeks/${recId}`, { headers });
  }

  createReport$(startDate: string, endDate: string, weekNumber: string, companyCode: string, salesAgentSelected: string){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<EntityResponse<string>>(`${this.api}ReceiptDetailBreakdown/CreateReceiptBreakdownReports/${startDate}/${endDate}/${weekNumber}/${companyCode}/${salesAgentSelected}`, { headers });
  }
}