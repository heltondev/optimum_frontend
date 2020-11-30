import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as MOMENT from 'moment';
import { MASKS, NgBrazilValidators } from 'ng-brazil';
import { Observable } from 'rxjs';
import { ICustomer } from 'src/app/interfaces/customer';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-customer-modal',
  templateUrl: './add-customer-modal.component.html',
  styleUrls: ['./add-customer-modal.component.scss']
})
export class AddCustomerModalComponent implements OnInit {
  
  MASKS = MASKS;
  closeResult = '';
  states$: Observable<any> = new Observable(null);
  cities$: Observable<any> = new Observable(null);
  customerForm: FormGroup;
  formDisabled: boolean;
  addContactBtn: boolean;

  @Output() handleAddUserToTable: EventEmitter<ICustomer> = new EventEmitter<ICustomer>();

  constructor (
    private modalService: NgbModal,
    private apiService: ApiService,
    private fb: FormBuilder
  ) { }

  ngOnInit (): void {
    this.initiateForm();
    console.log( 'this.customerForm', this.customerForm );
    this.states$ = this.apiService.getAllStates();
  }

  private initiateForm (): void {
    this.fb.group( {
      name: new FormControl( '', [ Validators.required ] ),
      dateOfBirth: new FormControl( null ),
      datePicker: new FormControl( { year: null, month: null, day: null } ),
      timePicker: new FormControl( { hour: null, minute: null, second: null } ),
      contacts: new FormControl( [] ),
      state: new FormControl( null ),
      city: new FormControl( null ),
      cpf: new FormControl( null ),
      zipcode: new FormControl( null ),
      phone_temp: new FormControl( null ),
      email_temp: new FormControl( null ),
      skype_temp: new FormControl( null ),
    } );
  }

  onCheckForm () { 
    this.formDisabled = ( 
      this.customerForm.value.name.length
      && this.customerForm.value.cpf.length
      && this.customerForm.value.zipcode.length
      && this.customerForm.value.contacts.length
      && this.customerForm.value.state.length
      && this.customerForm.value.city.length
      && this.customerForm.value.contacts.length
    ) ? true : false    
  };

  open ( content ): void {
    this.resetForm();
    this.modalService.open( content, { ariaLabelledBy: 'modal-basic-title' } ).result.then( ( result ) => {
      this.closeResult = `Closed with: ${ result }`;
    }, ( reason ) => {
      this.closeResult = `Dismissed ${ this.getDismissReason( reason ) }`;
    } );
  }

  handleCity ( cityName ) : void { 
    this.states$.subscribe( res => {
      const selected = res.filter( state => state.nome === cityName );
      this.cities$ = this.apiService.getCityByState( selected[ 0 ].id );
    } )
  }

  onSubmit (): void { 
    this.customerForm.patchValue( {
      dateOfBirth: MOMENT( `${ this.customerForm.value.datePicker.year }-${ this.customerForm.value.datePicker.month }-${ this.customerForm.value.datePicker.day } ${ this.customerForm.value.timePicker.hour }:${ this.customerForm.value.timePicker.minute }:${ this.customerForm.value.timePicker.second }` ).format( 'YYYY-MM-DD HH:mm:ss' ),
      cpf: this.customerForm.value.cpf.replace( /\D+/g, '' ),
      zipcode: this.customerForm.value.zipcode.replace( /\D+/g, '' ),
    } );
    const orginalFormValues = this.customerForm.value;
    this.customerForm.removeControl( 'datePicker' );
    this.customerForm.removeControl( 'timePicker' );
    this.customerForm.removeControl( 'phone_temp' );
    this.customerForm.removeControl( 'email_temp' );
    this.customerForm.removeControl( 'skype_temp' );
    this.apiService
      .addCustomer( this.customerForm.value )
      .subscribe( ( response: ICustomer ) => { 
        if ( 'id' in response ) {
          this.handleAddUserToTable.emit( response );
        } else { 
          this.customerForm.patchValue(orginalFormValues);
          this.handleAddUserToTable.emit( null );
          alert( "Error: Customer not added" );
        }
      })
    this.resetForm();
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

  addContact () : void { 
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
    this.onCheckForm();
  }

  checkAddContact () { 
    this.addContactBtn = (
      this.customerForm.value.phone_temp.length
      || this.customerForm.value.email_temp.length
      || this.customerForm.value.skype_temp.length
    ) ? true : false
  }

  private resetForm (): void { 
    this.customerForm = new FormGroup( {
      name: new FormControl( '' ),
      dateOfBirth: new FormControl( '' ),
      datePicker: new FormControl( '' ),
      timePicker: new FormControl( '' ),
      contacts: new FormControl( [] || null ),
      state: new FormControl( '', [ Validators.required ] ),
      city: new FormControl( '', [ Validators.required ] ),
      cpf: new FormControl( '', [ Validators.required, NgBrazilValidators.cpf ] ),
      zipcode: new FormControl( '', [ Validators.required, NgBrazilValidators.cep ] ),
      phone_temp: new FormControl( '', [ Validators.required, NgBrazilValidators.telefone ] ),
      email_temp: new FormControl( '' ),
      skype_temp: new FormControl( '' ),
    } );
  }
}