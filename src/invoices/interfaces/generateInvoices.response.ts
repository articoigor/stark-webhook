import { HttpException } from '@nestjs/common';
import { Invoice } from 'starkbank';

export class GenerateInvoiceResponse {
  invoices: Invoice[];
  error?: HttpException;

  constructor(invoices: Invoice[], error?: HttpException) {
    this.invoices = invoices;
    this.error = error;
  }
}
