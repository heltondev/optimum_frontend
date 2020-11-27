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
    const headers = new HttpHeaders( {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token, Accept',
      'Authorization': `Bearer ${ sessionStorage.getItem( 'token' ) }`
    } )
    return this.http.get( `${ environment.api.url }/api/v1/customers`, {
      headers: (headers)
    } );
  }

  getAllStates () { 
    return this.http.get( 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome' );
  }
  
  getCityByState ( id: number ) { 
    return this.http.get( `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}/municipios?orderBy=nome` );
  }
}
