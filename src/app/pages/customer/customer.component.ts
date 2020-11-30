import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ICustomer } from 'src/app/interfaces/customer';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  
  items$: Observable<ICustomer[]>;
  filter = new FormControl( '' );

  private items: ICustomer[];
  // private token: string = sessionStorage.getItem( 'token' );

  constructor (
    private pipe: DecimalPipe,
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal,
  ) { }
  
  ngOnInit () {
    try {
      this.refreshTable();
    } catch (error) {
      throw new Error( "Error retrieving customer's list" );
    } 
  }

  private search ( text: string, pipe: PipeTransform ): ICustomer[] {
    if (this.items) {
      return this.items.filter( item => {
        const term = text.toLowerCase();
        return item.name.toLowerCase().includes( term )
          || pipe.transform( item.cpf ).includes( term )
          || pipe.transform( item.zipcode ).includes( term );
      } );
    }
  }

  private refreshTable () { 
    this.items$ = this.apiService.getAllCustomers();
    this.items$.subscribe( ( response: ICustomer[] ) => this.items = response );
    setTimeout( () => {
      this.items$ = this.filter.valueChanges.pipe(
        startWith( '' ),
        map( text => this.search( text, this.pipe ) )
      );
    }, 1000 );
  }

  logout (): void {
    sessionStorage.removeItem( 'token' );
    this.router.navigateByUrl( '/' );
  }

  addUserToTable ( newCustomer: ICustomer ): void { 
    if ( 'id' in newCustomer ) {
      this.items$ = this.items$
        .pipe(
          map( customerList => { 
            customerList.push( newCustomer );
            return customerList;
          })
        )
    }
  }

  updateTable ( value: boolean ) { 
    if (value) {
      this.refreshTable();
    }
  }
}
