export interface ICustomer {
   id?: number | string;
   name: string;
   dateOfBirth: string;
   state: string;
   city: string;
   zipcode: string;
   cpf: string;
   contacts?: IContact[];
}

export interface IContact { 
   email: string;
   phone?: string;
   skypeId?: string;
}
