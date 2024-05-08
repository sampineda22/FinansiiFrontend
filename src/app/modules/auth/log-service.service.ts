import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogServiceService {

  private api: string = environment.apiURL;

  constructor(private http: HttpClient){}

}