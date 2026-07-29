import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SharedService } from 'app/shared/shared.service';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  private api: string = environment.apiURL;

  constructor(private http: HttpClient, private _sharedService: SharedService) {
  }

  getDetails$(companyCode: string, expenseType: number, startDate: Date | string, endDate: Date | string, salesAgent: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}Historical/HistoricalDetails/${companyCode}/${expenseType}/${startDate}/${endDate}?personalCode=${salesAgent}`, { headers });
  }

  downloadExcel$(companyCode: string, salesAgent: string, expenseType: number, startDate: Date | string, endDate: Date | string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.api}Historical/DownloadExcel/${companyCode}/${salesAgent}/${expenseType}/${startDate}/${endDate}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  getImage$(id: number, companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get(`${this.api}Historical/Image/${id}/${companyCode}`, {
      headers,
      responseType: 'blob'
    });
  }

  showColumns(showName: boolean): string[] {
    var companyCode = this._sharedService.getCompanyCode();
    var displayedColumns: string[] = [];

    const allColumns: string[] = ['number', 'expenseTypeName', 'expenseCategoryName', 'seriesNum', 'invoiceId', 'description', 'gravadoAmount', 'exemptAmount',
      'invoiceAmount', 'invoiceDate', 'statusName', 'journalNum', 'actions', 'eraseFilters'];

    if (showName) {
      allColumns.splice(allColumns.length-2, 0, 'name');
    }

    if (companyCode === 'IMGT') {
      displayedColumns = allColumns.filter(col => col !== 'gravadoAmount');
    } else if (companyCode === 'IMCR') {
      const valuesToRemove = ["seriesNum", "exemptAmount", 'gravadoAmount'];
      displayedColumns = allColumns.filter(col => !valuesToRemove.includes(col));
    }
    else {
      displayedColumns = allColumns.filter(col => col !== 'seriesNum');
    }
    return displayedColumns;
  }
}