import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendPaymentService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  getJournals$(companyCode: string): Observable<any> {
    const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
    return this.http.get<any>(`${this.api}VendPaymentReport/UnpostedJournals/${companyCode}`, { headers });
  }

  getVendPaymentLines$(journalNum: string, companyCode: string): Observable<any> {
    const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
    return this.http.get<any>(`${this.api}VendPaymentReport/VendPaymentLines/${journalNum}/${companyCode}`, { headers });
  }

  /*createReport$(journalNum: string, companyCode: string): Observable<any> {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}VendPaymentReport/Report/${journalNum}/${companyCode}`, { headers });
  }*/

  createReport$(journalNum: string, companyCode: string, offSetLedgerDimension: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders().set('authorization', localStorage.getItem('accessToken') ?? '');

    return this.http.post(`${this.api}VendPaymentReport/Report/${journalNum}/${companyCode}/${offSetLedgerDimension}`,
      null,
      {
        headers,
        responseType: 'blob',
        observe: 'response'
      }
    );
  }
}