import { Injectable } from '@angular/core';
import { localStorage } from 'app/modules/auth/interfaces/localStorage';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private actualComponent: string;

  constructor() { }

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

  getUser() {
    const access_Logged: any = JSON.parse(localStorage.getItem('access_Logged'));
    return access_Logged.userId;
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

}
