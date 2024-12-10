export class CustomerDto {
  name: string;
  taxId: string;
  email: string;
  country: string;
  phone: string;
  stateCode: string;
  streetLine1: string;
  streetLine2: string;
  zipCode: string;

  constructor(
    name: string,
    taxId: string,
    email: string,
    country: string,
    phone: string,
    stateCode: string,
    streetLine1: string,
    streetLine2: string,
    zipCode: string,
  ) {
    this.name = name;
    this.taxId = taxId;
    this.email = email;
    this.country = country;
    this.phone = phone;
    this.stateCode = stateCode;
    this.streetLine1 = streetLine1;
    this.streetLine2 = streetLine2;
    this.zipCode = zipCode;
  }
}
