import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import SHA256 from 'crypto-js/sha256';
import { ILogin, ILoginSuccess } from 'src/app/interfaces/login';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor (
    private service: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  loginForm = new FormGroup( {
    username: new FormControl( 'test@test.com' ),
    password: new FormControl( '123456' ),
  } );

  onSubmit () {
    const payload: ILogin = this.loginForm.value;
    payload.password = SHA256( payload.password ).toString().toUpperCase();
    this.service.signIn( payload ).subscribe( ( response: ILoginSuccess ) => { 
      if ('token' in response) {
        console.log( response.token );
        sessionStorage.setItem( 'token', response.token );
        this.router.navigateByUrl( '/customer' );
      }
    }, ( error ) => { 
        this.router.navigateByUrl('/');
        sessionStorage.removeItem('token')
        console.error( "[Login Page] => ", (error.message) ? error.message : error );
        alert( "Login failed" );
    })
  }

}
