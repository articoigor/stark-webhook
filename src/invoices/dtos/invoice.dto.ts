export class InvoiceDto {
  amount: number;
  name: string;
  due: string;
  interest: number;
  taxId: string;

  constructor(
    amount: number,
    name: string,
    due: string,
    interest: number,
    taxId: string,
  ) {
    this.amount = amount;
    this.name = name;
    this.taxId = taxId;
    this.due = due;
    this.interest = interest;
  }
}
