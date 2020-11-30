import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as MOMENT from 'moment';
import { MASKS, NgBrazilValidators } from 'ng-brazil';
import { Observable } from 'rxjs';
import { ICustomer } from 'src/app/interfaces/customer';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './edit-customer-modal.component.html',
  styleUrls: ['./edit-customer-modal.component.scss']
})
export class EditCustomerModalComponent implements OnInit {
  @Input() customer: ICustomer
  MASKS = MASKS;
  closeResult = '';
  states$: Observable<any> = new Observable( null );
  cities$: Observable<any> = new Observable( null );
  customerForm = new FormGroup( {
    id: new FormControl( 0 ),
    name: new FormControl( '', [<any> Validators.required, <any> Validators.minLength(3)] ),
    dateOfBirth: new FormControl( '' ),
    datePicker: new FormControl( { year: null, month: null, day: null } ),
    timePicker: new FormControl( { hour: null, minute: null, second: null } ),
    contacts: new FormControl( [] || null ),
    state: new FormControl( '', [ <any> Validators.required ] ),
    city: new FormControl( '', [ <any> Validators.required ] ),
    cpf: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cpf ] ),
    zipcode: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cep ] ),
    phone_temp: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.telefone ] ),
    email_temp: new FormControl( '' ),
    skype_temp: new FormControl( '' ),
  } );

  @Output() handleUpdateTable: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  constructor (
    private modalService: NgbModal,
    private apiService: ApiService
  ) { }

  ngOnInit (): void {
    this.states$ = this.apiService.getAllStates();
    this.handleCity(this.customer.state);
  }

  open ( content ): void {   
    console.log(this.customer);
      this.customerForm.patchValue( {
      ...this.customer,
      zipcode: this.customer.zipcode || null,
      datePicker: {
        year: MOMENT( this.customer.dateOfBirth ).year() || MOMENT().year(),
        month: MOMENT( this.customer.dateOfBirth ).month() || MOMENT().month(),
        day: MOMENT( this.customer.dateOfBirth ).day() || MOMENT().day(),
      },
      timePicker: {
        hour: MOMENT( this.customer.dateOfBirth ).hour() || MOMENT().hour(),
        minute: MOMENT( this.customer.dateOfBirth ).minute() || MOMENT().minute(),
        second: MOMENT( this.customer.dateOfBirth ).second() || MOMENT().second(),
      }
    } );
    console.log(this.customerForm.value);
    
    this.modalService.open( content, { ariaLabelledBy: 'modal-basic-title' } ).result.then( ( result ) => {
      this.closeResult = `Closed with: ${ result }`;
    }, ( reason ) => {
      this.closeResult = `Dismissed ${ this.getDismissReason( reason ) }`;
    } );
  }

  handleCity ( stateName ): void {
    this.states$.subscribe( res => {
      const selected = res.filter( state => state.nome === stateName );
      if (selected.length && 'id' in selected[0]) {
        this.cities$ = this.apiService.getCityByState( selected[ 0 ].id );
      }
    } );
  }

  onSubmit (): void {

    this.customerForm.patchValue( {
      dateOfBirth: MOMENT( `${ this.customerForm.value.datePicker.year }-${ this.customerForm.value.datePicker.month }-${ this.customerForm.value.datePicker.day } ${ this.customerForm.value.timePicker.hour }:${ this.customerForm.value.timePicker.minute }:${ this.customerForm.value.timePicker.second }` ).format( 'YYYY-MM-DD HH:mm:ss' ),
      cpf: this.customerForm.value.cpf.replace( /\D+/g, '' ),
      zipcode: this.customerForm.value.zipcode.replace( /\D+/g, '' )
    } );
    const orginalFormValues = this.customerForm.value;
    this.customerForm.removeControl( 'datePicker' );
    this.customerForm.removeControl( 'timePicker' );
    this.customerForm.removeControl( 'phone_temp' );
    this.customerForm.removeControl( 'email_temp' );
    this.customerForm.removeControl( 'skype_temp' );
    this.customerForm.removeControl( 'id' );
    this.apiService
      .updateCustomer( this.customer.id, this.customerForm.value )
      .subscribe( ( response: ICustomer ) => {
        if ( 'id' in response ) {
          this.handleUpdateTable.emit( true );
        } else {
          this.customerForm.patchValue( orginalFormValues );
          this.handleUpdateTable.emit( false );
          alert( "Error: Customer not added" );
        }
      } );
    this.modalService.dismissAll();
  }

  private getDismissReason ( reason: any ): string {
    if ( reason === ModalDismissReasons.ESC ) {
      return 'by pressing ESC';
    } else if ( reason === ModalDismissReasons.BACKDROP_CLICK ) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${ reason }`;
    }
  }

  addContact (): void {
    if (
      this.customerForm.value.phone_temp != null
      || this.customerForm.value.email_temp != null
      || this.customerForm.value.skype_temp != null
    ) {
      this.customerForm.value.contacts.push( {
        email: this.customerForm.value.email_temp || null,
        phone: this.customerForm.value.phone_temp || null,
        skypeId: this.customerForm.value.skype_temp || null
      } );
    } else {
      alert( "Error: Contact should have at least one field filled" );
    }
  }

  removeContact ( index ): void { 
    this.customerForm.value.contacts.splice( Number( index ), 1 );
  }

  onDelete (): void {     
    this.apiService.deleteCustomer( Number( this.customerForm.value.id ) ).subscribe( resp => { 
      this.handleUpdateTable.emit( true );
      this.modalService.dismissAll();
    })
  }

}
