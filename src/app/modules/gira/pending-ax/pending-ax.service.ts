import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PendingAXService {
  private api: string = environment.apiURL;

  constructor(private http: HttpClient) {}

  getPendingAX$(companyCode: string) {
    const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken'));
    return this.http.get<any>(`${this.api}PendingAX/PendingAX/${companyCode}`, { headers });
  }
}
