import { ProcessTransferResponse } from './processInvoice.response';
import { GenerateInvoiceResponse } from './generateInvoices.response';

export interface IInvoiceService {
  generateInvoices(): Promise<GenerateInvoiceResponse>;
  processTransfer(body: any, headers: any): Promise<ProcessTransferResponse>;
  functionsHealthcheck(): string;
}
