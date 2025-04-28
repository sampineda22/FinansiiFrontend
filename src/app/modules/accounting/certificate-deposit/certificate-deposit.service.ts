import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CertificateDeposit } from 'app/interfaces/accounting/certificateDeposit';
import { environment } from 'environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificateDepositService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  getAllCertificatesDeposit$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}CertificateDeposit/GetCertificatesDeposit/${companyCode}`, { headers });
  }

  getWeeklyRecords$(id: number) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}CertificateDeposit/GetCertificateWeeklyDetails/${id}`, { headers });
  }

  getAllBanks$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}CertificateDeposit/GetAllBanks/${companyCode}`, { headers });
  }

  postCertificate$(certificate: CertificateDeposit) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));

    return this.http.post<any>(`${this.api}CertificateDeposit/PostCertificateDeposit`, certificate, { headers });
  }

  postJournal$(companyCode: string, fiscalYearId: string, week: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));

    return this.http.post<any>(`${this.api}CertificateDeposit/PostWeeklyJournal/${companyCode}/${fiscalYearId}/${week}`, { headers });
  }

  postFinalJournal$(companyCode: string, certificateId: number) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));

    return this.http.post<any>(`${this.api}CertificateDeposit/PostFinalJournal/${companyCode}/${certificateId}`, { headers });
  }

  deleteCertificate$(id: number){
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));

    return this.http.delete<any>(`${this.api}CertificateDeposit/DeleteCertificate/${id}`, { headers });
  }

  downloadExcel$(companyCode: string): Observable<any> {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post(`${this.api}CertificateDeposit/DownloadExcel/${companyCode}`, null, {
      headers,
      observe: 'response',
      responseType: 'blob' // Remove 'as json'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
          return this.handleFileDownload(response.body);
        } else {
          throw new Error('Unexpected response type');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error instanceof Blob) {
          return this.handleJsonError(error.error);
        } else {
          return throwError(() => new Error('An unexpected error occurred'));
        }
      })
    );
  }

  private handleJsonError(blob: Blob): Observable<any> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          observer.error(json); // Error object will contain the parsed JSON
        } catch (e) {
          observer.error(new Error('Invalid JSON response'));
        }
      };
      reader.onerror = () => observer.error(new Error('Error reading blob as text'));
      reader.readAsText(blob);
    });
  }

  private handleFileDownload(blob: Blob): Blob {
    return blob;
  }
}
