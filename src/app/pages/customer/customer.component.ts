import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  
  items$: Observable<any[]>;
  filter = new FormControl( '' );

  private items: any[] | any;
  private token: string = sessionStorage.getItem( 'token' );

  constructor (
    private pipe: DecimalPipe,
    private apiService: ApiService,
    private router: Router
  ) { 
    this.items = [
      {
        "id": 1,
        "name": "John Doe",
        "dateOfBirth": "2000-10-10T10:00:00.000+00:00",
        "state": "SP",
        "city": "Sao Paulo",
        "zipcode": "16300000",
        "cpf": "00000000000"
      },
      {
        "id": 2,
        "name": "Rachel Doe",
        "dateOfBirth": "2002-08-15T10:00:00.000+00:00",
        "state": "SP",
        "city": "Penapolis",
        "zipcode": "17900000",
        "cpf": "11111111111"
      },
      {
        "id": 3,
        "name": "Ray Doe",
        "dateOfBirth": "2001-07-11T10:00:00.000+00:00",
        "state": "CE",
        "city": "Fortaleza",
        "zipcode": "11100000",
        "cpf": "22222222222"
      },
      {
        "id": 4,
        "name": "Julie Doe",
        "dateOfBirth": "2005-07-11T20:00:00.000+00:00",
        "state": "RJ",
        "city": "Fortaleza",
        "zipcode": "11100000",
        "cpf": "22222222222"
      }
    ]
  }

  ngOnInit () {
    setTimeout(() => {
      this.apiService
        .getAllCustomers()
        .subscribe( response  => { 
          this.items = response;
        }, err => { 
            console.error('[Customers] => ',  err.message);
        })
      this.items$ = this.filter.valueChanges.pipe(
        startWith( '' ),
        map( text => this.search( text, this.pipe ) )
      );
    }, 1000);
  }

  private search ( text: string, pipe: PipeTransform ): any[] {
    if (this.items) {
      return this.items.filter( item => {
        const term = text.toLowerCase();
        return item.name.toLowerCase().includes( term )
          || pipe.transform( item.cpf ).includes( term )
          || pipe.transform( item.zipcode ).includes( term );
      } );
    }
  }



  logout () {
    sessionStorage.removeItem( 'token' );
    this.router.navigateByUrl( '/' );
  }

}
