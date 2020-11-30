import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICustomer } from '../interfaces/customer';
import { ILogin } from '../interfaces/login';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private headers = new HttpHeaders( {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': "http://localhost:4200",
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token, Accept, Authorization',
    'Authorization': `Bearer ${ sessionStorage.getItem( 'token' ) }`,
  } );

  constructor (
    private http: HttpClient
  ) { }
  
  signIn (payload: ILogin) { 
    return this.http.post( `${environment.api.url}/authenticate`, payload );
  }

  getAllCustomers () {
    return this.http.get<ICustomer[]>( `${ environment.api.url }/api/v1/customers`, {
      headers: ( this.headers ),
      withCredentials: true
    } );
  }

  getAllStates () { 
    return this.http.get( 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome' );
  }
  
  getCityByState ( id: number ) { 
    return this.http.get( `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}/municipios?orderBy=nome` );
  }

  addCustomer (payload: ICustomer) { 
    return this.http.post<ICustomer>( `${ environment.api.url }/api/v1/customers`, payload, {
      headers: ( this.headers ),
      withCredentials: true
    } );
  }

  deleteCustomer ( id: string | number ) { 
    return this.http.delete<void>( `${ environment.api.url }/api/v1/customers/${id}`, {
      headers: ( this.headers ),
      withCredentials: true
    } );
  } 
}
