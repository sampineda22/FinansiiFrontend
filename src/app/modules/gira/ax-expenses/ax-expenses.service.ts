import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AXExpensesService {
  private api: string = environment.apiURL;

  constructor(private http: HttpClient) {
  }

  getAXExpenses$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}AXExpenses/AXExpenses/${companyCode}`, { headers });
  }

  putStatus$(companyCode: string, id: number, rejectionMotive: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.put<any>(`${this.api}AXExpenses/Status/${companyCode}/${id}/${rejectionMotive}`, { headers });
  }
}
