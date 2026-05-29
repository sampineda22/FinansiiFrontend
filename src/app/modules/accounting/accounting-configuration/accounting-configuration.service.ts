import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExceptionCode } from 'app/interfaces/accounting/exceptionCodes';
import { PaymentDate } from 'app/interfaces/accounting/paymentDate';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AccountingConfigurationService {
    private api: string = environment.apiURL;

    constructor(private http: HttpClient) { }

    //#region ExceptionCodes
    getExceptionCodes$(companyCode: string): Observable<any> {
        const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
        return this.http.get<any>(`${this.api}AccountingConfiguration/ExceptionCodes/${companyCode}`, { headers });
    }

    getMT940Banks$(companyCode: string): Observable<any> {
        const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
        return this.http.get<any>(`${this.api}AccountingConfiguration/MT940Banks/${companyCode}`, { headers });
    }

    postExceptionCode$(exceptionCode: any): Observable<any> {
        const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
        return this.http.post<any>(`${this.api}AccountingConfiguration/ExceptionCode`, exceptionCode, { headers });
    }

    deleteExceptionCode$(exceptionCode: ExceptionCode): Observable<any> {
        const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
        return this.http.delete<any>(`${this.api}AccountingConfiguration/ExceptionCode/${exceptionCode.companyCode}/${exceptionCode.code}/${exceptionCode.accountId}`, { headers });
    }

    //#endRegion

    getPaymentDates$(companyCode: string): Observable<any> {
        const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
        return this.http.get<any>(`${this.api}AccountingConfiguration/PaymentDates/${companyCode}`, { headers });
    }

    postPaymentDate$(paymentDate: any): Observable<any> {
        const headers = new HttpHeaders().append('authorization', localStorage.getItem('accessToken') ?? '');
        return this.http.post<any>(`${this.api}AccountingConfiguration/PaymentDate`, paymentDate, { headers });
    }

    deletePaymentDate$(paymentDate: PaymentDate): Observable<any> {
        const headers = new HttpHeaders().append("authorization", localStorage.getItem("accessToken"));
        return this.http.delete<any>(`${this.api}AccountingConfiguration/PaymentDate/${paymentDate.companyCode}/${paymentDate.year}/${paymentDate.month}`, { headers });
    }
}