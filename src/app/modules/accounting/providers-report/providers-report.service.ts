import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProviderReport } from 'app/interfaces/accounting/providerReport';
import { environment } from 'environments/environment.development';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvidersReportService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  getProvidersReport$(formData: FormData): Observable<any> {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ProvidersReport/GetProvidersReport`, formData, { headers })
  }

  downloadProvidersReport$(providersReport: ProviderReport[]): Observable<any> {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<any>(`${this.api}ProvidersReport/DownloadProvidersReport`, providersReport, {
      headers,
      observe: 'response',
      responseType: 'blob' as 'json',
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
