import { Invoice, Project } from 'starkbank';
import { InvoiceDto } from '../dtos/invoice.dto';

export interface IInvoiceRepository {
  publishInvoices(
    invoices: InvoiceDto[],
    adminUser: Project,
  ): Promise<Invoice[]>;
  retrievePublicKey(): Promise<string>;
  retrievePrivateKey(): Promise<string>;
}
