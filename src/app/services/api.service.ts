import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ILogin } from '../interfaces/login';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor (
    private http: HttpClient
  ) { }
  
  signIn (payload: ILogin) { 
    return this.http.post( `${environment.api.url}/authenticate`, payload );
  }
}
