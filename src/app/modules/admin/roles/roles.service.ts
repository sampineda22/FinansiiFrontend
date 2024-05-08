import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { entityResponse } from 'app/interfaces/admin/entityResponse';
import { Role } from 'app/interfaces/admin/role';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  getAllRoles$(): Observable<Role[]> {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<Role[]>(this.api + 'GetAllRoles', { headers });
  }

  postRole$(item: Role): Observable<entityResponse>{
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.post<entityResponse>(this.api + 'PostRole', item, { headers });
  } 

  deleteRole$(roleId: number): Observable<entityResponse>{
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.delete<entityResponse>(`${this.api}DeleteRole/${roleId}`, { headers });
  } 
}
