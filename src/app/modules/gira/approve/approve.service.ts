import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ApproveService {
  private api: string = environment.apiURL;

  constructor(private http: HttpClient) {
  }

  getPendingApprovals$(companyCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}Approve/PendingApprovals/${companyCode}`, { headers });
  }

  putStatus$(companyCode: string, id: number, rejectionMotive: string, user: string, personalCode: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.put<any>(`${this.api}Approve/Status/${companyCode}/${id}/${personalCode}/${user}/${rejectionMotive}`, { headers });
  }
}