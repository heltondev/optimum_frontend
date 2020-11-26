import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  getAllCustomers () {
    const headers: HttpHeaders = new HttpHeaders( {
      'Content-Type': 'text/plain',
      'Authorization': `Bearer ${ sessionStorage.getItem( 'token' ) }`
    } );
    console.log(headers);
    
    return this.http.get( `${ environment.api.url }/api/v1/customers`, {
      headers: headers
    } );
  }
}
