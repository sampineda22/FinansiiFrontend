import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  private api: string = environment.apiURL;

  constructor(private http: HttpClient) {
  }

  getDetails$(companyCode: string, salesAgent: string, expenseType: number, startDate: Date | string, endDate: Date | string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}Historical/HistoricalDetails/${companyCode}/${salesAgent}/${expenseType}/${startDate}/${endDate}`, { headers });
  }

  downloadExcel$(companyCode: string, salesAgent: string, expenseType: number, startDate: Date | string, endDate: Date | string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.api}Historical/DownloadExcel/${companyCode}/${salesAgent}/${expenseType}/${startDate}/${endDate}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}