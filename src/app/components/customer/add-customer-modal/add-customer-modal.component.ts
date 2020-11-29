import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbDateStruct, NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
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
  model: NgbDateStruct;
  time: NgbTimeStruct;
  closeResult = '';
  states$: Observable<any> = new Observable(null);
  cities$: Observable<any> = new Observable(null);
  customerForm = new FormGroup( {
    name: new FormControl( ''  ),
    dateOfBirth: new FormControl( '' ),
    datePicker: new FormControl( '' ),
    timePicker: new FormControl( '' ),
    contacts: new FormControl( [] || null ),
    state: new FormControl( '', [ <any> Validators.required] ),
    city: new FormControl( '', [ <any> Validators.required] ),
    cpf: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cpf ]  ),
    cep: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cep ] ),
    phone_temp: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.telefone ] ),
    email_temp: new FormControl( '' ),
    skype_temp: new FormControl( '' ),
  } );

  @Output() handleAddUserToTable: EventEmitter<ICustomer> = new EventEmitter<ICustomer>();

  constructor (
    private modalService: NgbModal,
    private apiService: ApiService
  ) { }

  ngOnInit (): void {
    this.states$ = this.apiService.getAllStates();
  }

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

  onSubmit () : void { 
    this.customerForm.patchValue( {
      dateOfBirth: `${ this.customerForm.value.datePicker.year }-${ this.customerForm.value.datePicker.month }-${ this.customerForm.value.datePicker.day }T${ this.customerForm.value.timePicker.hour }:${ this.customerForm.value.timePicker.minute }:${ this.customerForm.value.timePicker.second}`
    } );
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
  }

  private resetForm (): void { 
    this.model = {year: null, month: null, day: null};
    this.time = { hour: null, minute: null, second: null };
    this.customerForm = new FormGroup( {
      name: new FormControl( '' ),
      dateOfBirth: new FormControl( '' ),
      datePicker: new FormControl( '' ),
      timePicker: new FormControl( '' ),
      contacts: new FormControl( [] || null ),
      state: new FormControl( '', [ <any> Validators.required ] ),
      city: new FormControl( '', [ <any> Validators.required ] ),
      cpf: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cpf ] ),
      cep: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cep ] ),
      phone_temp: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.telefone ] ),
      email_temp: new FormControl( '' ),
      skype_temp: new FormControl( '' ),
    } );
  }
}