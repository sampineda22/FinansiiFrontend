import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { localStorage } from 'app/modules/auth/interfaces/localStorage';
import { environment } from 'environments/environment.development';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private actualComponent: string;
  /*Commented on 2026-mar.-05 by spineda - Begin*/
  private api: string = environment.apiURL;

  constructor(private http: HttpClient, public dialog: MatDialog) { }
  /*Commented on 2026-mar.-05 by spineda - End*/

  ngOnInit(): void {
    this.getCompanyCode();
    this.getUser();
  }

  setCompanyCode(code: string) {
    const access_Logged: localStorage = JSON.parse(localStorage.getItem('access_Logged'));
    access_Logged.companyCode = code;
    localStorage.setItem('access_Logged', JSON.stringify(access_Logged));
  }

  getCompanyCode() {
    const access_Logged: any = JSON.parse(localStorage.getItem('access_Logged'));
    return access_Logged.companyCode;
  }

  getPersonalCode() {
    const access_Logged: any = JSON.parse(localStorage.getItem('access_Logged'));
    return access_Logged.personalCode;
  }

  getUser() {
    const access_Logged: any = JSON.parse(localStorage.getItem('access_Logged') || 'null');
    return access_Logged?.userId ?? access_Logged?.user?.id ?? access_Logged?.user?.user ?? null;
  }

  setActualComponent(name: string) {
    this.actualComponent = name;
  }

  getActualComponent() {
    return this.actualComponent;
  }

  verificationSwal(title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title,
        text: '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI',
        cancelButtonText: 'NO',
      }).then(result => {
        resolve(result.isConfirmed)
      });
    });
  }

  setPageSize(lenght: number): number[] {
    if (lenght <= 1) {
      return [1];
    } else {
      return [lenght, Math.round(lenght / 2), lenght > 10 ? 10 : 0]
    }
  }

  /*Commented on 2026-mar.-05 by spineda - Begin*/
  getScreensByUserId$(userId: string) {
    const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
    return this.http.get<any>(`${this.api}Screen/GetScreensByUser/${userId}`, { headers });
  }
  /*Commented on 2026-mar.-05 by spineda - End*/

  /*Commented on 2026-mar.-13 by spineda - Begin*/
  closeDialog() {
    this.dialog.closeAll();
  }
  /*Commented on 2026-mar.-13 by spineda - End*/
}