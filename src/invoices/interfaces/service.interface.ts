import { Invoice } from 'starkbank';
import { InvoiceDto } from '../dtos/invoice.dto';

export interface IInvoiceService {
  generateInvoices(invoices: InvoiceDto[]): Promise<Invoice[]>;
}
