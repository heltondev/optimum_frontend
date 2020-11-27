import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbDateStruct, NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { MASKS, NgBrazilValidators } from 'ng-brazil';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';



@Component({
  selector: 'app-add-customer-modal',
  templateUrl: './add-customer-modal.component.html',
  styleUrls: ['./add-customer-modal.component.scss']
})
export class AddCustomerModalComponent implements OnInit {
  
  MASKS = MASKS;
  model: NgbDateStruct;
  time: NgbTimeStruct = { hour: 13, minute: 30, second: 30 };
  closeResult = '';
  states$: Observable<any> = new Observable(null);
  cities$: Observable<any> = new Observable(null);
  customerForm = new FormGroup( {
    name: new FormControl( ''  ),
    dateOfBirth: new FormControl( '' ),
    datePicker: new FormControl( '' ),
    timePicker: new FormControl( '' ),
    state: new FormControl( '', [ <any> Validators.required] ),
    city: new FormControl( '', [ <any> Validators.required] ),
    cpf: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cpf ]  ),
    cep: new FormControl( '', [ <any> Validators.required, <any> NgBrazilValidators.cep ]  ),
  } );

  constructor (
    private modalService: NgbModal,
    private apiService: ApiService
  ) { }

  ngOnInit (): void {
    this.states$ = this.apiService.getAllStates();
  }

  open ( content ) {
    this.modalService.open( content, { ariaLabelledBy: 'modal-basic-title' } ).result.then( ( result ) => {
      this.closeResult = `Closed with: ${ result }`;
    }, ( reason ) => {
      this.closeResult = `Dismissed ${ this.getDismissReason( reason ) }`;
    } );
  }

  handleCity ( cityName ) { 
    this.states$.subscribe( res => {
      const selected = res.filter( state => state.nome === cityName );
      this.cities$ = this.apiService.getCityByState( selected[ 0 ].id );
    } )
  }

  onSubmit () { 
    this.customerForm.patchValue( {
      dateOfBirth: `${ this.customerForm.value.datePicker.year }-${ this.customerForm.value.datePicker.month }-${ this.customerForm.value.datePicker.day } ${ this.customerForm.value.timePicker.hour }:${ this.customerForm.value.timePicker.minute }:${ this.customerForm.value.timePicker.second}`
    } );
    this.customerForm.removeControl( 'datePicker' );
    this.customerForm.removeControl('timePicker');
    console.log( 'this.customerForm.value', this.customerForm.value );
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
}